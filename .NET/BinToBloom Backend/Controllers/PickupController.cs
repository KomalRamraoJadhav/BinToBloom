using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;
using BinToBloom_Backend.Services;
using System.Security.Claims;

namespace BinToBloom_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PickupController : ControllerBase
    {
        private readonly IPickupService _pickupService;
        private readonly ApplicationDbContext _context;

        public PickupController(IPickupService pickupService, ApplicationDbContext context)
        {
            _pickupService = pickupService;
            _context = context;
        }

        [HttpPost("request")]
        [Authorize(Roles = "HOUSEHOLD,BUSINESS")]
        public async Task<IActionResult> CreatePickupRequest([FromBody] CreatePickupRequestDto requestDto)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
                int userId = int.Parse(userIdStr);

                var pickupRequest = await _pickupService.CreatePickupRequestAsync(userId, requestDto);
                return Ok(pickupRequest);
            }
            catch (Exception e)
            {
                return BadRequest("Error creating pickup request: " + e.Message);
            }
        }

        [HttpGet("my-requests")]
        [Authorize(Roles = "HOUSEHOLD,BUSINESS")]
        public async Task<IActionResult> GetUserPickupRequests()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
            int userId = int.Parse(userIdStr);

            var requests = await _pickupService.GetUserPickupsAsync(userId);
            return Ok(requests);
        }

        [HttpGet("collector-requests")]
        [Authorize(Roles = "COLLECTOR")]
        public async Task<IActionResult> GetCollectorPickupRequests()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
            int userId = int.Parse(userIdStr);
            
            var collector = await _context.Collectors.FirstOrDefaultAsync(c => c.UserId == userId);
            if (collector == null) return BadRequest("Collector profile not found");

            var requests = await _pickupService.GetCollectorPickupsAsync(collector.CollectorId);
            return Ok(requests);
        }
        
        [HttpPut("{pickupId}/status")]
        [Authorize(Roles = "COLLECTOR,ADMIN")]
        public async Task<IActionResult> UpdatePickupStatus(int pickupId, [FromQuery] string status)
        {
            try
            {
                var dto = new UpdatePickupStatusDto { PickupStatus = status };
                var success = await _pickupService.UpdatePickupStatusAsync(pickupId, dto);
                if (success)
                {
                    var updatedRequest = await _pickupService.GetPickupByIdAsync(pickupId);
                    return Ok(updatedRequest);
                }
                return BadRequest("Failed to update status");
            }
            catch (Exception e)
            {
                return BadRequest("Error updating pickup status: " + e.Message);
            }
        }
    }
}
