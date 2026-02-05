using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Services;
using BinToBloom_Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace BinToBloom_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "BUSINESS")]
    public class BusinessController : ControllerBase
    {
        private readonly IBusinessService _businessService;
        private readonly IPickupService _pickupService;
        private readonly ApplicationDbContext _context;

        public BusinessController(IBusinessService businessService, IPickupService pickupService, ApplicationDbContext context)
        {
            _businessService = businessService;
            _pickupService = pickupService;
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var profile = await _businessService.GetBusinessProfileAsync(userId);
            
            if (profile == null)
                return NotFound(new { message = "Profile not found." });

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateBusinessProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _businessService.UpdateBusinessProfileAsync(userId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update profile." });

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPost("pickup")]
        public async Task<IActionResult> CreatePickupRequest([FromBody] CreatePickupRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var pickup = await _pickupService.CreatePickupRequestAsync(userId, dto);
                
                if (pickup == null)
                    return BadRequest(new { message = "Failed to create pickup request." });

                return Ok(pickup);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to create pickup request." });
            }
        }
        [HttpPut("pickup/{pickupId}")]
        public async Task<IActionResult> UpdatePickupRequest(int pickupId, [FromBody] CreatePickupRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var pickup = await _pickupService.UpdatePickupRequestAsync(pickupId, dto);
                
                if (pickup == null)
                    return BadRequest(new { message = "Failed to update pickup request." });

                return Ok(pickup);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to update pickup request." });
            }
        }

        [HttpDelete("pickup/{pickupId}")]
        public async Task<IActionResult> DeletePickupRequest(int pickupId)
        {
            try
            {
                var result = await _pickupService.DeletePickupRequestAsync(pickupId);
                
                if (!result)
                    return BadRequest(new { message = "Failed to delete pickup request or pickup not found." });

                return Ok(new { message = "Pickup deleted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to delete pickup request." });
            }
        }


        [HttpGet("pickups")]
        public async Task<IActionResult> GetPickups()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var pickups = await _pickupService.GetUserPickupsAsync(userId);
            return Ok(pickups);
        }

        [HttpPost("payment")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var payment = await _businessService.CreatePaymentAsync(userId, dto);
            
            if (payment == null)
                return BadRequest(new { message = "Failed to create payment." });

            return Ok(payment);
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var payments = await _businessService.GetBusinessPaymentsAsync(userId);
            return Ok(payments);
        }

        [HttpGet("leaderboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBusinessLeaderboard()
        {
            var leaderboard = await _businessService.GetBusinessLeaderboardAsync();
            return Ok(leaderboard);
        }

        [HttpGet("eco-points")]
        public async Task<IActionResult> GetEcoPoints()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var business = await _context.BusinessDetails
                .FirstOrDefaultAsync(b => b.UserId == userId);

            if (business == null)
                return NotFound(new { message = "Profile not found." });

            var totalWaste = await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .Where(w => w.PickupRequest.UserId == userId)
                .SumAsync(w => w.WeightKg);

            var recentRewards = await _context.EcoRewards
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.EarnedOn)
                .Take(5)
                .ToListAsync();

            var mappedRewards = recentRewards.Select(r => {
                var wasteType = r.RewardType.Replace("Waste Collection - ", ""); 
                return new {
                    pointsEarned = r.PointsEarned,
                    pickupRequest = new { wasteType = wasteType },
                    earnedAt = r.EarnedOn
                };
            });

            var totalEcoPoints = await _context.EcoRewards
                .Where(r => r.UserId == userId)
                .SumAsync(r => r.PointsEarned);

            return Ok(new { 
                totalPoints = totalEcoPoints,
                totalWaste = totalWaste,
                recentRewards = mappedRewards
            });
        }
    }
}

