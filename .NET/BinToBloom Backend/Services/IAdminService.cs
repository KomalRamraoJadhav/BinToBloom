using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface IAdminService
    {
        Task<AdminDashboardDto> GetAdminDashboardAsync();
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<bool> UpdateUserStatusAsync(int userId, UserApprovalDto dto);
        Task<bool> AssignCollectorToPickupAsync(int pickupId, AssignCollectorDto dto);
        Task<SystemReportDto> GenerateSystemReportAsync();
    }
}

