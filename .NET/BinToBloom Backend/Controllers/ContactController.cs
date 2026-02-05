using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Services;
using BinToBloom_Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace BinToBloom_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;
        private readonly ApplicationDbContext _context;

        public ContactController(IContactService contactService, ApplicationDbContext context)
        {
            _contactService = contactService;
            _context = context;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> CreateContact([FromBody] ContactDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _contactService.CreateContactAsync(dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to submit contact form." });

            return Ok(new { message = "Thank you for contacting us! We'll get back to you soon." });
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllContacts()
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
                return StatusCode(500, new { message = "Error: " + ex.Message });
            }
        }
    }
}

