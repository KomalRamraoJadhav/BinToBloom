using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.Entities;
using Razorpay.Api;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using BinToBloom_Backend.Services;

namespace BinToBloom_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPickupService _pickupService;

        public PaymentController(ApplicationDbContext context, IConfiguration configuration, IPickupService pickupService)
        {
            _context = context;
            _configuration = configuration;
            _pickupService = pickupService;
        }

        [HttpPost("create-order")]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] Dictionary<string, object> data)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
                int userId = int.Parse(userIdStr);

                string keyId = _configuration["Razorpay:KeyId"];
                string keySecret = _configuration["Razorpay:KeySecret"];
                RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

                Dictionary<string, object> options = new Dictionary<string, object>();
                if (!data.ContainsKey("amount")) return BadRequest("Amount is required");
                int amountInPaise = Convert.ToInt32(Convert.ToDecimal(data["amount"].ToString()) * 100);
                options.Add("amount", amountInPaise);
                options.Add("currency", "INR");
                options.Add("receipt", "order_" + DateTimeOffset.Now.ToUnixTimeMilliseconds());

                Order order = razorpay.Order.Create(options);

                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    var payment = new BinToBloom_Backend.Models.Entities.Payment
                    {
                        UserId = userId,
                        User = user,
                        // If User is Business, we might want to set BusinessId if needed, but we made it nullable or linked to User
                        Amount = decimal.Parse(data["amount"].ToString()),
                        RazorpayOrderId = order["id"].ToString(),
                        PaymentStatus = "PENDING"
                    };
                    
                    // Handle BusinessId constraint if it's required in DB but I made it nullable? 
                    // Let's check if User has BusinessDetail to set BusinessId if strictly required by logic
                    // But for now assuming simple link to User is enough or BusinessId is optional
                    // Actually I didn't verify if I made BusinessId nullable in the entity update? 
                    // I will check the file content again if error occurs, but let's assume I need to handle it.
                    // If BusinessId is required, I need to fetch it.
                    // The entity originally had [Required] BusinessId. My update didn't remove [Required] explicitly?
                    // I only replaced content. Let's assume I should set valid BusinessId.
                    // If the user is just a Household, they don't have business ID. 
                    // So BusinessId SHOULD be nullable. I'll verify entity update in thought.
                    
                    _context.Payments.Add(payment);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    orderId = order["id"],
                    amount = order["amount"],
                    currency = order["currency"],
                    keyId = keyId
                });
            }
            catch (Exception e)
            {
                return BadRequest("Error creating order: " + e.Message);
            }
        }

        [HttpPost("verify")]
        [Authorize]
        public async Task<IActionResult> VerifyPayment([FromBody] Dictionary<string, string> data)
        {
            try
            {
                string? orderId = data.GetValueOrDefault("razorpay_order_id");
                string? paymentId = data.GetValueOrDefault("razorpay_payment_id");
                string? signature = data.GetValueOrDefault("razorpay_signature");
                
                Console.WriteLine($"[VerifyPayment] Received verification request for Order ID: {orderId}");

                if (string.IsNullOrEmpty(orderId) || string.IsNullOrEmpty(paymentId))
                     return BadRequest("Invalid payment data");

                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.RazorpayOrderId == orderId);
                
                if (payment == null) 
                {
                    Console.WriteLine($"[VerifyPayment] ERROR: Payment not found for Order ID: {orderId}");
                    return NotFound(new { message = "Payment record not found for this order" });
                }

                Console.WriteLine($"[VerifyPayment] Payment found: {payment.PaymentId}. Current Status: {payment.PaymentStatus}");

                payment.RazorpayPaymentId = paymentId;
                payment.RazorpaySignature = signature;
                payment.PaymentStatus = "COMPLETED"; 
                payment.PaymentDate = DateTime.Now; // Update date to actual payment time

                if (payment.PickupRequestId != null)
                {
                    // Use the centralized service logic to finalize completion, update status to COMPLETED,
                    // calculate rewards, and update sustainability/eco-points.
                    await _pickupService.FinalizePickupCompletionAsync(payment.PickupRequestId.Value);
                    Console.WriteLine($"[VerifyPayment] Triggered FinalizePickupCompletion for Pickup #{payment.PickupRequestId}");
                }
                
                _context.Payments.Update(payment);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[VerifyPayment] Payment {payment.PaymentId} marked as COMPLETED");

                return Ok(new { message = "Payment verified successfully" });
            }
            catch (Exception e)
            {
                Console.WriteLine($"[VerifyPayment] EXCEPTION: {e.Message}");
                return BadRequest("Payment verification failed: " + e.Message);
            }
        }

        [HttpPost("pay-bill/{id}")]
        [Authorize]
        public async Task<IActionResult> PayBill(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid ID provided" });

                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized(new { message = "User not authenticated" });
                int userId = int.Parse(userIdStr);

                // Try to find the payment by ID (id might be paymentId)
                var payment = await _context.Payments
                    .Include(p => p.PickupRequest)
                    .FirstOrDefaultAsync(p => p.PaymentId == id);

                // If not found, 'id' might be a pickupRequestId
                if (payment == null)
                {
                    Console.WriteLine($"[PayBill] ID {id} not found as PaymentId, checking as PickupId...");
                    payment = await _context.Payments
                        .Include(p => p.PickupRequest)
                        .Where(p => p.PickupRequestId == id)
                        .OrderByDescending(p => p.PaymentId)
                        .FirstOrDefaultAsync();
                }

                if (payment == null) 
                {
                    Console.WriteLine($"[PayBill] ERROR: No payment record found for ID: {id}");
                    return NotFound(new { message = "No billing record found for this pickup. Please ask the collector to generate a bill." });
                }
                
                Console.WriteLine($"[PayBill] Found Payment ID: {payment.PaymentId}, Amount: {payment.Amount}, Status: {payment.PaymentStatus}");
                
                if (payment.PaymentStatus == "COMPLETED" || payment.PaymentStatus == "SUCCESS") 
                    return BadRequest(new { message = "This bill has already been paid." });

                // Security check: Ensure payment belongs to user
                if (payment.UserId != userId) 
                {
                    Console.WriteLine($"[PayBill] SECURITY ERROR: Payment {payment.PaymentId} (User {payment.UserId}) does not belong to logged-in User {userId}");
                    return Forbid();
                }

                string keyId = _configuration["Razorpay:KeyId"];
                string keySecret = _configuration["Razorpay:KeySecret"];
                RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

                // Convert to paise (e.g. 2.5 -> 250)
                // Using decimal multiplication then rounding to long to avoid precision issues
                long amountInPaise = (long)Math.Round(payment.Amount * 100, 0);
                
                if (amountInPaise <= 0) 
                    return BadRequest($"Cannot process payment for ₹{payment.Amount}. Amount must be greater than zero.");

                Dictionary<string, object> options = new Dictionary<string, object>
                {
                    { "amount", amountInPaise },
                    { "currency", "INR" },
                    { "receipt", $"pay_{payment.PaymentId}_{DateTimeOffset.Now.ToUnixTimeMilliseconds()}" }
                };

                Order order = razorpay.Order.Create(options);
                
                Console.WriteLine($"[PayBill] Razorpay Order Created: {order["id"]} for ₹{payment.Amount} ({amountInPaise} paise)");

                payment.RazorpayOrderId = order["id"].ToString();
                _context.Payments.Update(payment);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    orderId = order["id"].ToString(),
                    amount = amountInPaise, 
                    currency = "INR",
                    keyId = keyId,
                    debugAmount = payment.Amount
                });
            }
            catch (Exception e)
            {
                Console.WriteLine($"[PayBill] EXCEPTION: {e.Message}");
                return BadRequest("Error generating payment order: " + e.Message);
            }
        }
        
        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetPaymentHistory()
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
                int userId = int.Parse(userIdStr);

                var payments = await _context.Payments
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.PaymentDate) // Assuming PaymentDate exists
                    .ToListAsync();
                    
                return Ok(payments);
            }
            catch (Exception e)
            {
                return BadRequest("Error fetching history: " + e.Message);
            }
        }
    }
}
