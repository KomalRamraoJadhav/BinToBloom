using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;
using BinToBloom_Backend.Helpers;

namespace BinToBloom_Backend.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public UserService(ApplicationDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (await EmailExistsAsync(registerDto.Email))
                return null;

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == registerDto.Role);
            if (role == null) return null;

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Phone = registerDto.Phone,
                Address = registerDto.Address,
                City = registerDto.City,
                RoleId = role.RoleId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create role-specific details
            await CreateRoleSpecificDetailsAsync(user, registerDto);

            var token = _jwtHelper.GenerateToken(user, role.RoleName);
            
            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    UserId = user.UserId,
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone,
                    Address = user.Address,
                    City = user.City,
                    Role = role.RoleName,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt
                }
            };
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                return null;

            if (user.Status != "ACTIVE")
                return null;

            var token = _jwtHelper.GenerateToken(user, user.Role.RoleName);

            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    UserId = user.UserId,
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone,
                    Address = user.Address,
                    City = user.City,
                    Role = user.Role.RoleName,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt
                }
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return null;

            return new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                City = user.City,
                Role = user.Role.RoleName,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllCollectorsAsync()
        {
            return await _context.Collectors
                .Include(c => c.User)
                .Include(c => c.User.Role)
                .Select(c => new UserDto
                {
                    UserId = c.User.UserId,
                    Name = c.User.Name,
                    Email = c.User.Email,
                    Phone = c.User.Phone,
                    Address = c.User.Address,
                    City = c.User.City,
                    Role = c.User.Role.RoleName,
                    Status = c.User.Status,
                    CreatedAt = c.User.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        private async Task CreateRoleSpecificDetailsAsync(User user, RegisterDto registerDto)
        {
            switch (registerDto.Role)
            {
                case "HOUSEHOLD":
                    _context.HouseholdDetails.Add(new HouseholdDetail { UserId = user.UserId });
                    break;
                case "BUSINESS":
                    _context.BusinessDetails.Add(new BusinessDetail 
                    { 
                        UserId = user.UserId,
                        BusinessType = registerDto.BusinessType ?? "General"
                    });
                    break;
                case "COLLECTOR":
                    _context.Collectors.Add(new Collector { UserId = user.UserId });
                    break;
                case "NGO":
                    _context.NGOs.Add(new NGO { UserId = user.UserId, City = user.City });
                    break;
                case "ADMIN":
                    _context.Admins.Add(new Admin { UserId = user.UserId });
                    break;
            }
            await _context.SaveChangesAsync();
        }
    }
}