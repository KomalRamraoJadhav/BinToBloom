using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.Entities;
using System.Security.Claims;

namespace BinToBloom_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrackingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TrackingController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{pickupId}")]
        [Authorize]
        public async Task<IActionResult> GetTrackingInfo(int pickupId)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
                int currentUserId = int.Parse(userIdStr);

                var pickup = await _context.PickupRequests
                    .Include(p => p.User)
                    .Include(p => p.Collector)
                    .ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(p => p.PickupId == pickupId);

                if (pickup == null)
                {
                    return BadRequest(new { message = "Pickup not found" });
                }

                // Check permissions: Only the user who requested OR the assigned collector can track
                // If the user is an ADMIN, they might also see it, but primary logic is User/Collector
                bool isAuthorized = pickup.UserId == currentUserId || 
                                   (pickup.Collector != null && pickup.Collector.UserId == currentUserId);

                if (!isAuthorized && !User.IsInRole("ADMIN"))
                {
                    return StatusCode(403, new { message = "Access denied" });
                }

                var trackingInfo = new Dictionary<string, object>
                {
                    { "pickupId", pickup.PickupId },
                    { "status", pickup.PickupStatus },
                    { "pickupLocation", new { lat = pickup.Latitude ?? 0, lng = pickup.Longitude ?? 0 } }
                };

                if (pickup.Collector != null)
                {
                    trackingInfo.Add("collectorLocation", new { lat = pickup.Collector.CurrentLat ?? 0, lng = pickup.Collector.CurrentLng ?? 0 });
                    trackingInfo.Add("collectorName", pickup.Collector.User.Name);
                    trackingInfo.Add("collectorPhone", pickup.Collector.User.Phone);
                }

                return Ok(trackingInfo);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = "Failed to get tracking info: " + e.Message });
            }
        }
    }
}
