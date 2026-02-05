using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface INGOService
    {
        Task<NGODashboardDto?> GetNGODashboardAsync(int userId);
        Task<IEnumerable<CityWasteDataDto>> GetCityWasteDataAsync();
        Task<NGOReportDto?> CreateNGOReportAsync(int userId, CreateNGOReportDto dto);
        Task<IEnumerable<NGOReportDto>> GetNGOReportsAsync(int userId);
        Task<bool> UpdateNGOProfileAsync(int userId, UpdateNGOProfileDto dto);
        Task<GlobalAnalyticsDto> GetGlobalAnalyticsAsync();
        Task<SpecificCityAnalyticsDto> GetCitySpecificAnalyticsAsync(string city);
    }
}

