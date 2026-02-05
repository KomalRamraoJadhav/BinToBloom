using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface IHouseholdService
    {
        Task<HouseholdProfileDto?> GetHouseholdProfileAsync(int userId);
        Task<bool> UpdateHouseholdProfileAsync(int userId, UpdateHouseholdProfileDto dto);
        Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync();
        Task<LeaderboardEntryDto?> GetUserLeaderboardPositionAsync(int userId);
    }
}

