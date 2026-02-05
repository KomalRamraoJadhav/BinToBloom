using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;

namespace BinToBloom_Backend.Services
{
    public class BusinessService : IBusinessService
    {
        private readonly ApplicationDbContext _context;

        public BusinessService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BusinessProfileDto?> GetBusinessProfileAsync(int userId)
        {
            var business = await _context.BusinessDetails
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.UserId == userId);

            if (business == null) return null;

            return new BusinessProfileDto
            {
                BusinessId = business.BusinessId,
                UserId = business.UserId,
                Name = business.User.Name,
                Email = business.User.Email,
                Phone = business.User.Phone,
                Address = business.User.Address,
                City = business.User.City,
                BusinessType = business.BusinessType,
                PickupFrequency = business.PickupFrequency,
                SustainabilityScore = business.SustainabilityScore,
                PaymentEnabled = business.PaymentEnabled
            };
        }

        public async Task<bool> UpdateBusinessProfileAsync(int userId, UpdateBusinessProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            var business = await _context.BusinessDetails.FirstOrDefaultAsync(b => b.UserId == userId);
            
            if (user == null || business == null) return false;

            user.Name = dto.Name;
            user.Phone = dto.Phone;
            user.Address = dto.Address;
            user.City = dto.City;
            business.BusinessType = dto.BusinessType;
            business.PickupFrequency = dto.PickupFrequency;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PaymentDto?> CreatePaymentAsync(int userId, CreatePaymentDto dto)
        {
            var business = await _context.BusinessDetails.FirstOrDefaultAsync(b => b.UserId == userId);
            if (business == null) return null;

            var payment = new Payment
            {
                BusinessId = business.BusinessId,
                Amount = dto.Amount,
                PaymentMode = dto.PaymentMode,
                PaymentStatus = "SUCCESS"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return new PaymentDto
            {
                PaymentId = payment.PaymentId,
                BusinessId = payment.BusinessId,
                Amount = payment.Amount,
                PaymentMode = payment.PaymentMode,
                PaymentStatus = payment.PaymentStatus,
                PaymentDate = payment.PaymentDate
            };
        }

        public async Task<IEnumerable<PaymentDto>> GetBusinessPaymentsAsync(int userId)
        {
            var business = await _context.BusinessDetails.FirstOrDefaultAsync(b => b.UserId == userId);
            if (business == null) return new List<PaymentDto>();

            return await _context.Payments
                .Where(p => p.BusinessId == business.BusinessId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    BusinessId = p.BusinessId,
                    Amount = p.Amount,
                    PaymentMode = p.PaymentMode,
                    PaymentStatus = p.PaymentStatus,
                    PaymentDate = p.PaymentDate
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<BusinessProfileDto>> GetBusinessLeaderboardAsync()
        {
            return await _context.BusinessDetails
                .Include(b => b.User)
                .OrderByDescending(b => b.SustainabilityScore)
                .Select(b => new BusinessProfileDto
                {
                    BusinessId = b.BusinessId,
                    UserId = b.UserId,
                    Name = b.User.Name,
                    Email = b.User.Email,
                    Phone = b.User.Phone,
                    Address = b.User.Address,
                    City = b.User.City,
                    BusinessType = b.BusinessType,
                    PickupFrequency = b.PickupFrequency,
                    SustainabilityScore = b.SustainabilityScore,
                    PaymentEnabled = b.PaymentEnabled
                })
                .Take(50)
                .ToListAsync();
        }
    }
}

