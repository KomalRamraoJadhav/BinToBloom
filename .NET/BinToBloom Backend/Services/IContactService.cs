using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface IContactService
    {
        Task<bool> CreateContactAsync(ContactDto dto);
    }
}

