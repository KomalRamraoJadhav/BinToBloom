using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalCollectors = await _context.Collectors.CountAsync();
            var totalNGOs = await _context.NGOs.CountAsync();
            var pendingPickups = await _context.PickupRequests.CountAsync(p => p.PickupStatus == "PENDING");
            var completedPickups = await _context.PickupRequests.CountAsync(p => p.PickupStatus == "COMPLETED");
            var totalWaste = await _context.WasteLogs.SumAsync(w => (decimal?)w.WeightKg) ?? 0;

            return new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalCollectors = totalCollectors,
                TotalNGOs = totalNGOs,
                PendingPickups = pendingPickups,
                CompletedPickups = completedPickups,
                TotalWasteCollected = totalWaste
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    City = u.City,
                    Role = u.Role.RoleName,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateUserStatusAsync(int userId, UserApprovalDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Status = dto.Status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignCollectorToPickupAsync(int pickupId, AssignCollectorDto dto)
        {
            var pickup = await _context.PickupRequests.FindAsync(pickupId);
            if (pickup == null) return false;

            pickup.CollectorId = dto.CollectorId;
            pickup.PickupStatus = "ACCEPTED";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SystemReportDto> GenerateSystemReportAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalPickups = await _context.PickupRequests.CountAsync();
            var completedPickups = await _context.PickupRequests.CountAsync(p => p.PickupStatus == "COMPLETED");
            var totalWaste = await _context.WasteLogs.SumAsync(w => (decimal?)w.WeightKg) ?? 0;
            var totalCarbonSaved = totalWaste * 0.5m;

            var usersByRole = await _context.Users
                .Include(u => u.Role)
                .GroupBy(u => u.Role.RoleName)
                .ToDictionaryAsync(g => g.Key, g => g.Count());

            var wasteByType = await _context.WasteLogs
                .GroupBy(w => w.WasteType)
                .ToDictionaryAsync(g => g.Key, g => g.Sum(w => w.WeightKg));

            return new SystemReportDto
            {
                ReportDate = DateTime.Now,
                TotalUsers = totalUsers,
                TotalPickups = totalPickups,
                CompletedPickups = completedPickups,
                TotalWasteCollected = totalWaste,
                TotalCarbonSaved = totalCarbonSaved,
                UsersByRole = usersByRole,
                WasteByType = wasteByType
            };
        }
    }
}

