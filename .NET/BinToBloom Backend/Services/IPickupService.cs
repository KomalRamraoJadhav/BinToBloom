using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface IPickupService
    {
        Task<PickupRequestDto?> CreatePickupRequestAsync(int userId, CreatePickupRequestDto dto);
        Task<PickupRequestDto?> UpdatePickupRequestAsync(int pickupId, CreatePickupRequestDto dto);
        Task<bool> DeletePickupRequestAsync(int pickupId);
        Task<IEnumerable<PickupRequestDto>> GetAvailablePickupsAsync();
        Task<IEnumerable<PickupRequestDto>> GetUserPickupsAsync(int userId);
        Task<IEnumerable<PickupRequestDto>> GetCollectorPickupsAsync(int collectorId);
        Task<IEnumerable<PickupRequestDto>> GetAllPickupsAsync();
        Task<bool> UnassignCollectorAsync(int pickupId);
        Task<PickupRequestDto?> GetPickupByIdAsync(int pickupId);
        Task<bool> UpdatePickupStatusAsync(int pickupId, UpdatePickupStatusDto dto);
        Task<bool> AssignCollectorAsync(int pickupId, int collectorId);
        Task<int> CompletePickupAsync(int pickupId, CompletePickupDto dto); // Returns points awarded
        Task<bool> FinalizePickupCompletionAsync(int pickupId);
        Task<bool> CreateWasteLogAsync(int pickupId, WasteLogDto dto);
        Task<bool> CreateTrackingLogAsync(int pickupId, TrackingLogDto dto);
        Task<IEnumerable<TrackingLogDto>> GetTrackingLogsAsync(int pickupId);
    }
}

