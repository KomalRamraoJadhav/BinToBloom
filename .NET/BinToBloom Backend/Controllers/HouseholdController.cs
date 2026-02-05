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
    [Authorize(Roles = "HOUSEHOLD")]
    public class HouseholdController : ControllerBase
    {
        private readonly IHouseholdService _householdService;
        private readonly IPickupService _pickupService;
        private readonly ApplicationDbContext _context;

        public HouseholdController(IHouseholdService householdService, IPickupService pickupService, ApplicationDbContext context)
        {
            _householdService = householdService;
            _pickupService = pickupService;
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var profile = await _householdService.GetHouseholdProfileAsync(userId);
            
            if (profile == null)
                return NotFound(new { message = "Profile not found." });

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateHouseholdProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _householdService.UpdateHouseholdProfileAsync(userId, dto);
            
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

        [HttpGet("leaderboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeaderboard()
        {
            var leaderboard = await _householdService.GetLeaderboardAsync();
            return Ok(leaderboard);
        }

        [HttpGet("leaderboard/position")]
        public async Task<IActionResult> GetLeaderboardPosition()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var position = await _householdService.GetUserLeaderboardPositionAsync(userId);
            
            if (position == null)
                return NotFound(new { message = "Position not found." });

            return Ok(position);
        }

        [HttpGet("pickup/{pickupId}/tracking")]
        public async Task<IActionResult> GetTrackingLogs(int pickupId)
        {
            var logs = await _pickupService.GetTrackingLogsAsync(pickupId);
            return Ok(logs);
        }
        [HttpGet("eco-points")]
        public async Task<IActionResult> GetEcoPoints()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var profile = await _householdService.GetHouseholdProfileAsync(userId);
            if (profile == null)
                return NotFound(new { message = "Profile not found." });

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

            return Ok(new { 
                totalPoints = profile.EcoPoints,
                totalWaste = profile.TotalWasteKg,
                recentRewards = mappedRewards
            });
        }
    }
}

