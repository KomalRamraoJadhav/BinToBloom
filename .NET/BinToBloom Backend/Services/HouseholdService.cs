using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public class HouseholdService : IHouseholdService
    {
        private readonly ApplicationDbContext _context;

        public HouseholdService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HouseholdProfileDto?> GetHouseholdProfileAsync(int userId)
        {
            var household = await _context.HouseholdDetails
                .Include(h => h.User)
                .FirstOrDefaultAsync(h => h.UserId == userId);

            if (household == null) return null;

            return new HouseholdProfileDto
            {
                HouseholdId = household.HouseholdId,
                UserId = household.UserId,
                Name = household.User.Name,
                Email = household.User.Email,
                Phone = household.User.Phone,
                Address = household.User.Address,
                City = household.User.City,
                TotalWasteKg = household.TotalWasteKg,
                EcoPoints = household.EcoPoints,
                LeaderboardRank = household.LeaderboardRank,
                Co2Saved = household.TotalWasteKg * 2.5m, // 2.5kg CO2 per kg waste
                TreesSaved = household.TotalWasteKg * 0.1m // 0.1 tree per kg waste
            };
        }

        public async Task<bool> UpdateHouseholdProfileAsync(int userId, UpdateHouseholdProfileDto dto)
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

        public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync()
        {
            try
            {
                // Update rankings first
                await UpdateLeaderboardRankingsAsync();
                
                var households = await _context.HouseholdDetails
                    .Include(h => h.User)
                    .OrderByDescending(h => h.EcoPoints) // Sort by points first
                    .ThenByDescending(h => h.TotalWasteKg)
                    .Take(100)
                    .ToListAsync();

                int rank = 1;
                return households.Select(h => new LeaderboardEntryDto
                {
                    UserId = h.UserId,
                    Name = h.User.Name,
                    TotalWaste = h.TotalWasteKg,
                    EcoPoints = h.EcoPoints,
                    Rank = rank++
                }).ToList();
            }
            catch (Exception)
            {
                // Return empty list if error occurs
                return new List<LeaderboardEntryDto>();
            }
        }

        public async Task<LeaderboardEntryDto?> GetUserLeaderboardPositionAsync(int userId)
        {
            // Update rankings first
            await UpdateLeaderboardRankingsAsync();
            
            var allHouseholds = await _context.HouseholdDetails
                .Include(h => h.User)
                .OrderByDescending(h => h.EcoPoints) // Sort by points first
                .ThenByDescending(h => h.TotalWasteKg)
                .ToListAsync();

            var userHousehold = allHouseholds.FirstOrDefault(h => h.UserId == userId);
            if (userHousehold == null) return null;

            var rank = allHouseholds.IndexOf(userHousehold) + 1;

            return new LeaderboardEntryDto
            {
                UserId = userHousehold.UserId,
                Name = userHousehold.User.Name,
                TotalWaste = userHousehold.TotalWasteKg,
                EcoPoints = userHousehold.EcoPoints,
                Rank = rank
            };
        }

        private async Task UpdateLeaderboardRankingsAsync()
        {
            var households = await _context.HouseholdDetails
                .OrderByDescending(h => h.EcoPoints)
                .ThenByDescending(h => h.TotalWasteKg)
                .ToListAsync();

            int rank = 1;
            foreach (var household in households)
            {
                household.LeaderboardRank = rank++;
            }

            await _context.SaveChangesAsync();
        }
    }
}

