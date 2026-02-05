using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public class CollectorService : ICollectorService
    {
        private readonly ApplicationDbContext _context;

        public CollectorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CollectorDashboardDto?> GetCollectorDashboardAsync(int userId)
        {
            var collector = await _context.Collectors
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (collector == null) return null;

            var pendingCount = await _context.PickupRequests
                .CountAsync(p => p.CollectorId == collector.CollectorId && p.PickupStatus == "PENDING");
            
            var acceptedCount = await _context.PickupRequests
                .CountAsync(p => p.CollectorId == collector.CollectorId && p.PickupStatus == "ACCEPTED");
            
            var completedCount = await _context.PickupRequests
                .CountAsync(p => p.CollectorId == collector.CollectorId && p.PickupStatus == "COMPLETED");

            return new CollectorDashboardDto
            {
                CollectorId = collector.CollectorId,
                Name = collector.User.Name,
                Status = collector.Status,
                CurrentLat = collector.CurrentLat,
                CurrentLng = collector.CurrentLng,
                PendingRequests = pendingCount,
                AcceptedRequests = acceptedCount,
                CompletedRequests = completedCount
            };
        }

        public async Task<bool> UpdateCollectorLocationAsync(int userId, UpdateCollectorLocationDto dto)
        {
            var collector = await _context.Collectors.FirstOrDefaultAsync(c => c.UserId == userId);
            if (collector == null) return false;

            collector.CurrentLat = dto.Latitude;
            collector.CurrentLng = dto.Longitude;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCollectorStatusAsync(int userId, UpdateCollectorStatusDto dto)
        {
            var collector = await _context.Collectors.FirstOrDefaultAsync(c => c.UserId == userId);
            if (collector == null) return false;

            collector.Status = dto.Status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCollectorProfileAsync(int userId, UpdateCollectorProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Name = dto.Name;
            user.Phone = dto.Phone;
            user.Address = dto.Address;
            user.City = dto.City;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CollectorProfileDto?> GetCollectorProfileAsync(int userId)
        {
            var collector = await _context.Collectors
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (collector == null) return null;

            return new CollectorProfileDto
            {
                CollectorId = collector.CollectorId,
                Name = collector.User.Name,
                Email = collector.User.Email,
                Phone = collector.User.Phone,
                Address = collector.User.Address,
                City = collector.User.City,
                VehicleType = "Not Provided", // Placeholder until DB schema update
                LicenseNumber = "Not Provided" // Placeholder until DB schema update
            };
        }
    }
}

