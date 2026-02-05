using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Services;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BinToBloom_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "COLLECTOR")]
    public class CollectorController : ControllerBase
    {
        private readonly ICollectorService _collectorService;
        private readonly IPickupService _pickupService;
        private readonly ApplicationDbContext _context;

        public CollectorController(ICollectorService collectorService, IPickupService pickupService, ApplicationDbContext context)
        {
            _collectorService = collectorService;
            _pickupService = pickupService;
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var dashboard = await _collectorService.GetCollectorDashboardAsync(userId);
            
            if (dashboard == null)
                return NotFound(new { message = "Dashboard not found." });

            return Ok(dashboard);
        }

        [HttpGet("pickups")]
        public async Task<IActionResult> GetPickups()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var collector = await _collectorService.GetCollectorDashboardAsync(userId);
            if (collector == null) return NotFound();

            var pickups = await _pickupService.GetCollectorPickupsAsync(collector.CollectorId);
            return Ok(pickups);
        }

        [HttpGet("available-pickups")]
        public async Task<IActionResult> GetAvailablePickups()
        {
            var pickups = await _pickupService.GetAvailablePickupsAsync();
            return Ok(pickups);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var profile = await _collectorService.GetCollectorProfileAsync(userId);
            if (profile == null) return NotFound();
            return Ok(profile);
        }

        [HttpPost("pickup/{pickupId}/accept")]
        public async Task<IActionResult> AcceptPickup(int pickupId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var collector = await _collectorService.GetCollectorDashboardAsync(userId);
            if (collector == null) return NotFound();

            var result = await _pickupService.AssignCollectorAsync(pickupId, collector.CollectorId);
            
            if (!result)
                return BadRequest(new { message = "Failed to accept pickup." });

            return Ok(new { message = "Pickup accepted successfully." });
        }

        [HttpPost("pickup/{pickupId}/reject")]
        public async Task<IActionResult> RejectPickup(int pickupId)
        {
             var result = await _pickupService.UnassignCollectorAsync(pickupId);
            
            if (!result)
                return BadRequest(new { message = "Failed to reject pickup." });

            return Ok(new { message = "Pickup rejected successfully." });
        }

        [HttpPut("pickup/{pickupId}/status")]
        public async Task<IActionResult> UpdatePickupStatus(int pickupId, [FromBody] UpdatePickupStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _pickupService.UpdatePickupStatusAsync(pickupId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update status." });

            return Ok(new { message = "Status updated successfully." });
        }

        [HttpPost("pickup/{pickupId}/waste")]
        public async Task<IActionResult> LogWaste(int pickupId, [FromBody] CompletePickupDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var points = await _pickupService.CompletePickupAsync(pickupId, dto);
            
            if (points == -1)
                return BadRequest(new { message = "Failed to complete pickup." });

            return Ok(new { message = "Pickup completed successfully.", pointsAwarded = points });
        }

        [HttpPost("location")]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateCollectorLocationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _collectorService.UpdateCollectorLocationAsync(userId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update location." });

            return Ok(new { message = "Location updated successfully." });
        }

        [HttpPost("pickup/{pickupId}/tracking")]
        public async Task<IActionResult> UpdateTracking(int pickupId, [FromBody] TrackingLogDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _pickupService.CreateTrackingLogAsync(pickupId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update tracking." });

            return Ok(new { message = "Tracking updated successfully." });
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateCollectorStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _collectorService.UpdateCollectorStatusAsync(userId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update status." });

            return Ok(new { message = "Status updated successfully." });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCollectorProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _collectorService.UpdateCollectorProfileAsync(userId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update profile." });

            return Ok(new { message = "Profile updated successfully." });
        }
        [HttpPost("pickup/{pickupId}/generate-bill")]
        public async Task<IActionResult> GenerateBill(int pickupId, [FromBody] GenerateBillDto dto)
        {
            var pickup = await _context.PickupRequests
                .Include(p => p.User)
                    .ThenInclude(u => u.BusinessDetail)
                .Include(p => p.User)
                    .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(p => p.PickupId == pickupId);

            if (pickup == null) return NotFound("Pickup request not found");

            int businessId;

            // Validate User is Business and ensure BusinessDetail exists
            if (pickup.User.BusinessDetail == null)
            {
                if (pickup.User.Role.RoleName.ToUpper() == "BUSINESS")
                {
                    // Auto-heal: Create missing BusinessDetail
                    var newBusiness = new BusinessDetail
                    {
                        UserId = pickup.UserId,
                        BusinessType = "General",
                        PickupFrequency = "WEEKLY", // Default
                        SustainabilityScore = 0,
                        PaymentEnabled = true
                    };
                    _context.BusinessDetails.Add(newBusiness);
                    await _context.SaveChangesAsync(); // Save to generate ID
                    businessId = newBusiness.BusinessId;
                }
                else
                {
                    return BadRequest(new { message = $"Bills can only be generated for Business users. Current Role: {pickup.User.Role.RoleName}" });
                }
            }
            else
            {
                businessId = pickup.User.BusinessDetail.BusinessId;
            }

            // Create or update WasteLog to store weight for later eco-points calculation
            var existingWasteLog = await _context.WasteLogs.FirstOrDefaultAsync(w => w.PickupId == pickupId);
            if (existingWasteLog != null)
            {
                existingWasteLog.WeightKg = dto.Weight;
                existingWasteLog.Notes = dto.Notes;
                _context.WasteLogs.Update(existingWasteLog);
            }
            else
            {
                var wasteLog = new WasteLog
                {
                    PickupId = pickupId,
                    WasteType = pickup.WasteType,
                    WeightKg = dto.Weight,
                    Notes = dto.Notes ?? string.Empty,
                    CollectedAt = DateTime.Now
                };
                _context.WasteLogs.Add(wasteLog);
            }
            await _context.SaveChangesAsync();

            Console.WriteLine($"[GenerateBill] Pickup {pickupId}: Amount = ₹{dto.Amount}, Weight = {dto.Weight}kg");

            // Check if bill already exists
            var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.PickupRequestId == pickupId);
            if (existingPayment != null) 
            {
                // Validation: Can only update if not paid
                if (existingPayment.PaymentStatus == "COMPLETED" || existingPayment.PaymentStatus == "SUCCESS")
                {
                    return BadRequest(new { message = "Bill already paid. Cannot regenerate." });
                }

                Console.WriteLine($"[GenerateBill] Updating existing payment {existingPayment.PaymentId}: Old Amount = ₹{existingPayment.Amount}, New Amount = ₹{dto.Amount}");

                existingPayment.Amount = dto.Amount;
                existingPayment.PaymentDate = DateTime.Now; // Update date
                existingPayment.PaymentStatus = "PENDING"; // Reset status just in case
                
                _context.Payments.Update(existingPayment);
                await _context.SaveChangesAsync();
                
                // Ensure pickup status is updated
                pickup.PickupStatus = "PAYMENT_PENDING";
                _context.PickupRequests.Update(pickup);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Bill updated successfully", paymentId = existingPayment.PaymentId });
            }

            var payment = new Payment
            {
                UserId = pickup.UserId,
                PickupRequestId = pickupId,
                Amount = dto.Amount,
                PaymentMode = "ONLINE",
                PaymentStatus = "PENDING",
                PaymentDate = DateTime.Now,
                BusinessId = businessId
            };

            Console.WriteLine($"[GenerateBill] Saving Payment record: Amount = ₹{payment.Amount}, BusinessId = {businessId}, UserId = {payment.UserId}");

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            
            // Ensure pickup status is updated
            pickup.PickupStatus = "PAYMENT_PENDING";
            _context.PickupRequests.Update(pickup);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bill generated successfully", paymentId = payment.PaymentId }); 
        }
    }
}

