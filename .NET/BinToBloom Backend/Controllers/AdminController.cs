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
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IPickupService _pickupService;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public AdminController(IAdminService adminService, IPickupService pickupService, ApplicationDbContext context, IEmailService emailService)
        {
            _adminService = adminService;
            _pickupService = pickupService;
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var dashboard = await _adminService.GetAdminDashboardAsync();
            return Ok(dashboard);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("users/{userId}/status")]
        public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] UserApprovalDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.UpdateUserStatusAsync(userId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update user status." });

            return Ok(new { message = "User status updated successfully." });
        }

        [HttpGet("pickups")]
        public async Task<IActionResult> GetAllPickups()
        {
            var pickups = await _pickupService.GetAllPickupsAsync();
            return Ok(pickups);
        }

        [HttpPost("pickup/{pickupId}/assign")]
        public async Task<IActionResult> AssignCollector(int pickupId, [FromBody] AssignCollectorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.AssignCollectorToPickupAsync(pickupId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to assign collector." });

            return Ok(new { message = "Collector assigned successfully." });
        }

        [HttpGet("report")]
        public async Task<IActionResult> GenerateSystemReport()
        {
            var report = await _adminService.GenerateSystemReportAsync();
            return Ok(report);
        }

        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages()
        {
            try
            {
                var contacts = await _context.Contacts
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        messageId = c.ContactId,
                        name = c.Name,
                        email = c.Email,
                        subject = c.Subject,
                        message = c.Message,
                        createdAt = c.CreatedAt
                    })
                    .ToListAsync();
                
                return Ok(contacts);
            }
            catch (Exception ex)
            {
                return Ok(new object[0]); // Return empty array on error
            }
        }
        [HttpPost("messages/{messageId}/reply")]
        public async Task<IActionResult> ReplyToMessage(int messageId, [FromBody] Dictionary<string, string> request)
        {
            try
            {
                string replyMessage = request.GetValueOrDefault("reply");
                if (string.IsNullOrEmpty(replyMessage)) return BadRequest("Reply message is required");

                var contact = await _context.Contacts.FindAsync(messageId);
                if (contact == null) return NotFound("Message not found");

                await _emailService.SendEmailAsync(contact.Email, "Re: " + contact.Subject, replyMessage);

                return Ok(new { message = "Reply sent successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to send email: " + ex.Message);
            }
        }
    }
}

