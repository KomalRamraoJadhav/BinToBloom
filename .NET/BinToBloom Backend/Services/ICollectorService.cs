using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface ICollectorService
    {
        Task<CollectorDashboardDto?> GetCollectorDashboardAsync(int userId);
        Task<bool> UpdateCollectorLocationAsync(int userId, UpdateCollectorLocationDto dto);
        Task<bool> UpdateCollectorStatusAsync(int userId, UpdateCollectorStatusDto dto);
        Task<bool> UpdateCollectorProfileAsync(int userId, UpdateCollectorProfileDto dto);
        Task<CollectorProfileDto?> GetCollectorProfileAsync(int userId);
    }
}

