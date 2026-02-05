using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;

namespace BinToBloom_Backend.Services
{
    public interface IUserService
    {
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<IEnumerable<UserDto>> GetAllCollectorsAsync();
        Task<bool> EmailExistsAsync(string email);
    }
}