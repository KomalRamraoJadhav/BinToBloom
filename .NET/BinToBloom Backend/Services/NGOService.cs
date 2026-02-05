using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;

namespace BinToBloom_Backend.Services
{
    public class NGOService : INGOService
    {
        private readonly ApplicationDbContext _context;

        public NGOService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NGODashboardDto?> GetNGODashboardAsync(int userId)
        {
            var ngo = await _context.NGOs
                .Include(n => n.User)
                .FirstOrDefaultAsync(n => n.UserId == userId);

            if (ngo == null) return null;

            var totalWaste = await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .ThenInclude(p => p.User)
                .Where(w => w.PickupRequest.User.City == ngo.City)
                .SumAsync(w => (decimal?)w.WeightKg) ?? 0;

            var totalCarbonSaved = totalWaste * 0.5m; // 0.5 kg CO2 per kg waste

            var totalReports = await _context.NGOReports
                .CountAsync(r => r.NGOId == ngo.NGOId);

            return new NGODashboardDto
            {
                NGOId = ngo.NGOId,
                Name = ngo.User.Name,
                City = ngo.City,
                TotalWasteCollected = totalWaste,
                TotalCarbonSaved = totalCarbonSaved,
                TotalReports = totalReports
            };
        }

        public async Task<IEnumerable<CityWasteDataDto>> GetCityWasteDataAsync()
        {
            return await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .ThenInclude(p => p.User)
                .GroupBy(w => w.PickupRequest.User.City)
                .Select(g => new CityWasteDataDto
                {
                    City = g.Key,
                    TotalWaste = g.Sum(w => w.WeightKg),
                    TotalPickups = g.Select(w => w.PickupId).Distinct().Count(),
                    CarbonSaved = g.Sum(w => w.WeightKg) * 0.5m
                })
                .OrderByDescending(c => c.TotalWaste)
                .ToListAsync();
        }

        public async Task<NGOReportDto?> CreateNGOReportAsync(int userId, CreateNGOReportDto dto)
        {
            var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == userId);
            if (ngo == null) return null;

            var report = new NGOReport
            {
                NGOId = ngo.NGOId,
                TotalWaste = dto.TotalWaste,
                CarbonSaved = dto.CarbonSaved
            };

            _context.NGOReports.Add(report);
            await _context.SaveChangesAsync();

            return new NGOReportDto
            {
                ReportId = report.ReportId,
                NGOId = report.NGOId,
                NGOName = ngo.User.Name,
                TotalWaste = report.TotalWaste,
                CarbonSaved = report.CarbonSaved,
                GeneratedOn = report.GeneratedOn
            };
        }

        public async Task<IEnumerable<NGOReportDto>> GetNGOReportsAsync(int userId)
        {
            var ngo = await _context.NGOs
                .Include(n => n.User)
                .FirstOrDefaultAsync(n => n.UserId == userId);
            
            if (ngo == null) return new List<NGOReportDto>();

            return await _context.NGOReports
                .Where(r => r.NGOId == ngo.NGOId)
                .OrderByDescending(r => r.GeneratedOn)
                .Select(r => new NGOReportDto
                {
                    ReportId = r.ReportId,
                    NGOId = r.NGOId,
                    NGOName = ngo.User.Name,
                    TotalWaste = r.TotalWaste,
                    CarbonSaved = r.CarbonSaved,
                    GeneratedOn = r.GeneratedOn
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateNGOProfileAsync(int userId, UpdateNGOProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == userId);
            if (user == null || ngo == null) return false;

            user.Name = dto.Name;
            user.Phone = dto.Phone;
            user.Address = dto.Address;
            user.City = dto.City;
            ngo.City = dto.City;

            await _context.SaveChangesAsync();
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<GlobalAnalyticsDto> GetGlobalAnalyticsAsync()
        {
            var totalWaste = await _context.WasteLogs.SumAsync(w => (decimal?)w.WeightKg) ?? 0;
            var totalPickups = await _context.PickupRequests.CountAsync();
            var completedPickups = await _context.PickupRequests.CountAsync(p => p.PickupStatus == "COMPLETED" || p.PickupStatus == "PAID" || p.PickupStatus == "PAYMENT_PENDING");

            var wasteByType = await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .GroupBy(w => w.PickupRequest.WasteType)
                .Select(g => new { Type = g.Key, Weight = g.Sum(w => w.WeightKg) })
                .ToDictionaryAsync(x => x.Type, x => x.Weight);

            var cityWisePickups = await _context.PickupRequests
                .Include(p => p.User)
                .GroupBy(p => p.User.City)
                .Select(g => new { City = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.City, x => x.Count);
            
            var cityWiseWaste = await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .ThenInclude(p => p.User)
                .GroupBy(w => w.PickupRequest.User.City)
                .Select(g => new { City = g.Key, Weight = g.Sum(w => w.WeightKg) })
                .ToDictionaryAsync(x => x.City, x => x.Weight);

            return new GlobalAnalyticsDto
            {
                TotalWaste = totalWaste,
                TotalPickups = totalPickups,
                CompletedPickups = completedPickups,
                WasteByType = wasteByType,
                CityWisePickups = cityWisePickups,
                CityWiseWaste = cityWiseWaste
            };
        }

        public async Task<SpecificCityAnalyticsDto> GetCitySpecificAnalyticsAsync(string city)
        {
            var totalWaste = await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .ThenInclude(p => p.User)
                .Where(w => w.PickupRequest.User.City == city)
                .SumAsync(w => (decimal?)w.WeightKg) ?? 0;

            var totalPickups = await _context.PickupRequests
                .Include(p => p.User)
                .Where(p => p.User.City == city)
                .CountAsync();

            var wasteByType = await _context.WasteLogs
                .Include(w => w.PickupRequest)
                .ThenInclude(p => p.User)
                .Where(w => w.PickupRequest.User.City == city)
                .GroupBy(w => w.PickupRequest.WasteType)
                .Select(g => new { Type = g.Key, Weight = g.Sum(w => w.WeightKg) })
                .ToDictionaryAsync(x => x.Type, x => x.Weight);

            return new SpecificCityAnalyticsDto
            {
                City = city,
                TotalWaste = totalWaste,
                TotalPickups = totalPickups,
                WasteByType = wasteByType
            };
        }
    }
}

