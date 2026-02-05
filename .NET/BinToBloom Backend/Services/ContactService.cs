using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;

namespace BinToBloom_Backend.Services
{
    public class ContactService : IContactService
    {
        private readonly ApplicationDbContext _context;

        public ContactService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateContactAsync(ContactDto dto)
        {
            var contact = new Contact
            {
                Name = dto.Name,
                Email = dto.Email,
                Subject = dto.Subject,
                Message = dto.Message
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

