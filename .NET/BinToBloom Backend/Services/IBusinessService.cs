using BinToBloom_Backend.Models.DTOs;

namespace BinToBloom_Backend.Services
{
    public interface IBusinessService
    {
        Task<BusinessProfileDto?> GetBusinessProfileAsync(int userId);
        Task<bool> UpdateBusinessProfileAsync(int userId, UpdateBusinessProfileDto dto);
        Task<PaymentDto?> CreatePaymentAsync(int userId, CreatePaymentDto dto);
        Task<IEnumerable<PaymentDto>> GetBusinessPaymentsAsync(int userId);
        Task<IEnumerable<BusinessProfileDto>> GetBusinessLeaderboardAsync();
    }
}

