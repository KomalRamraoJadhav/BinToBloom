using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Data;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Models.Entities;

namespace BinToBloom_Backend.Services
{
    public class PickupService : IPickupService
    {
        private readonly ApplicationDbContext _context;

        public PickupService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PickupRequestDto?> CreatePickupRequestAsync(int userId, CreatePickupRequestDto dto)
        {
            // Parse strings to DateOnly and TimeOnly
            if (!DateOnly.TryParse(dto.ScheduledDate, out DateOnly scheduledDate))
            {
                throw new InvalidOperationException("Invalid date format.");
            }
            
            if (!TimeOnly.TryParse(dto.ScheduledTime, out TimeOnly scheduledTime))
            {
                 throw new InvalidOperationException("Invalid time format.");
            }

            // Validate date and time
            var today = DateOnly.FromDateTime(DateTime.Now);
            var now = TimeOnly.FromDateTime(DateTime.Now);
            
            if (scheduledDate < today)
            {
                throw new InvalidOperationException("Cannot schedule pickup for past dates.");
            }
            
            if (scheduledDate == today)
            {
                // If same day, must be at least 2 hours from now
                var twoHoursLater = now.AddHours(2);
                
                if (scheduledTime <= twoHoursLater)
                {
                    throw new InvalidOperationException("Pickup time must be at least 2 hours from now for same-day pickups.");
                }
            }

            var pickup = new PickupRequest
            {
                UserId = userId,
                WasteType = dto.WasteType,
                ScheduledDate = scheduledDate,
                ScheduledTime = scheduledTime,
                Notes = dto.Notes,
                PickupFrequency = dto.PickupFrequency,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                PickupStatus = "PENDING"
            };

            _context.PickupRequests.Add(pickup);
            await _context.SaveChangesAsync();

            return await GetPickupByIdAsync(pickup.PickupId);
        }

        public async Task<PickupRequestDto?> UpdatePickupRequestAsync(int pickupId, CreatePickupRequestDto dto)
        {
            var pickup = await _context.PickupRequests.FindAsync(pickupId);
            if (pickup == null) return null;

            // Parse strings to DateOnly and TimeOnly
            if (!DateOnly.TryParse(dto.ScheduledDate, out DateOnly scheduledDate))
            {
                throw new InvalidOperationException("Invalid date format.");
            }
            
            if (!TimeOnly.TryParse(dto.ScheduledTime, out TimeOnly scheduledTime))
            {
                 throw new InvalidOperationException("Invalid time format.");
            }

            // Validate date and time
            var today = DateOnly.FromDateTime(DateTime.Now);
            var now = TimeOnly.FromDateTime(DateTime.Now);
            
            if (scheduledDate < today)
            {
                throw new InvalidOperationException("Cannot schedule pickup for past dates.");
            }
            
            // Allow update same logic as create
            if (scheduledDate == today)
            {
                var twoHoursLater = now.AddHours(2);
                if (scheduledTime <= twoHoursLater)
                {
                    throw new InvalidOperationException("Pickup time must be at least 2 hours from now for same-day pickups.");
                }
            }

            pickup.WasteType = dto.WasteType;
            pickup.ScheduledDate = scheduledDate;
            pickup.ScheduledTime = scheduledTime;
            pickup.Notes = dto.Notes;
            pickup.PickupFrequency = dto.PickupFrequency;
            pickup.Latitude = dto.Latitude;
            pickup.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();

            return await GetPickupByIdAsync(pickupId);
        }

        public async Task<bool> DeletePickupRequestAsync(int pickupId)
        {
            var pickup = await _context.PickupRequests.FindAsync(pickupId);
            if (pickup == null) return false;

            if (pickup.PickupStatus != "PENDING")
            {
                throw new InvalidOperationException("Only pending pickups can be deleted.");
            }

            _context.PickupRequests.Remove(pickup);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PickupRequestDto>> GetUserPickupsAsync(int userId)
        {
            return await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .Include(p => p.Collector)
                .Include(p => p.Payment)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PickupRequestDto
                {
                    PickupId = p.PickupId,
                    UserId = p.UserId,
                    User = new UserDto
                    {
                        UserId = p.User.UserId,
                        Name = p.User.Name,
                        Phone = p.User.Phone,
                        Address = p.User.Address,
                        City = p.User.City,
                        Role = p.User.Role.RoleName,
                        Status = p.User.Status,
                        CreatedAt = p.User.CreatedAt
                    },
                    CollectorId = p.CollectorId,
                    CollectorName = p.Collector != null ? p.Collector.User.Name : null,
                    WasteType = p.WasteType,
                    ScheduledDate = p.ScheduledDate,
                    ScheduledTime = p.ScheduledTime,
                    PickupStatus = p.PickupStatus,
                    Notes = p.Notes,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    PaymentStatus = p.Payment != null ? p.Payment.PaymentStatus : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PickupRequestDto>> GetAvailablePickupsAsync()
        {
            return await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .Include(p => p.Payment)
                .Where(p => p.CollectorId == null && p.PickupStatus == "PENDING")
                .OrderBy(p => p.ScheduledDate)
                .ThenBy(p => p.ScheduledTime)
                .Select(p => new PickupRequestDto
                {
                    PickupId = p.PickupId,
                    UserId = p.UserId,
                    User = new UserDto
                    {
                        UserId = p.User.UserId,
                        Name = p.User.Name,
                        Phone = p.User.Phone,
                        Address = p.User.Address,
                        City = p.User.City,
                         Role = p.User.Role.RoleName,
                        Status = p.User.Status,
                         CreatedAt = p.User.CreatedAt
                    },
                    WasteType = p.WasteType,
                    ScheduledDate = p.ScheduledDate,
                    ScheduledTime = p.ScheduledTime,
                    PickupStatus = p.PickupStatus,
                    Notes = p.Notes,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    PaymentStatus = p.Payment != null ? p.Payment.PaymentStatus : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PickupRequestDto>> GetCollectorPickupsAsync(int collectorId)
        {
            return await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .Include(p => p.Collector)
                .Include(p => p.Payment)
                .Where(p => p.CollectorId == collectorId)
                .OrderByDescending(p => p.ScheduledDate)
                .Select(p => new PickupRequestDto
                {
                    PickupId = p.PickupId,
                    UserId = p.UserId,
                    User = new UserDto
                    {
                        UserId = p.User.UserId,
                        Name = p.User.Name,
                        Phone = p.User.Phone,
                        Address = p.User.Address,
                        City = p.User.City,
                        Role = p.User.Role.RoleName,
                        Status = p.User.Status,
                        CreatedAt = p.User.CreatedAt
                    },
                    CollectorId = p.CollectorId,
                    CollectorName = p.Collector != null ? p.Collector.User.Name : null,
                    WasteType = p.WasteType,
                    ScheduledDate = p.ScheduledDate,
                    ScheduledTime = p.ScheduledTime,
                    PickupStatus = p.PickupStatus,
                    Notes = p.Notes,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    PaymentStatus = p.Payment != null ? p.Payment.PaymentStatus : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PickupRequestDto>> GetAllPickupsAsync()
        {
            return await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .Include(p => p.Collector)
                .Include(p => p.Payment)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PickupRequestDto
                {
                    PickupId = p.PickupId,
                    UserId = p.UserId,
                    User = new UserDto {
                         UserId = p.User.UserId,
                        Name = p.User.Name,
                        Phone = p.User.Phone,
                        Address = p.User.Address,
                        City = p.User.City,
                        Role = p.User.Role.RoleName,
                        Status = p.User.Status,
                        CreatedAt = p.User.CreatedAt
                    },
                    CollectorId = p.CollectorId,
                    CollectorName = p.Collector != null ? p.Collector.User.Name : null,
                    WasteType = p.WasteType,
                    ScheduledDate = p.ScheduledDate,
                    ScheduledTime = p.ScheduledTime,
                    PickupStatus = p.PickupStatus,
                    Notes = p.Notes,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    PaymentStatus = p.Payment != null ? p.Payment.PaymentStatus : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<PickupRequestDto?> GetPickupByIdAsync(int pickupId)
        {
            return await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .Include(p => p.Collector)
                .Include(p => p.Payment)
                .Where(p => p.PickupId == pickupId)
                .Select(p => new PickupRequestDto
                {
                    PickupId = p.PickupId,
                    UserId = p.UserId,
                    User = new UserDto {
                         UserId = p.User.UserId,
                        Name = p.User.Name,
                        Phone = p.User.Phone,
                        Address = p.User.Address,
                        City = p.User.City,
                        Role = p.User.Role.RoleName,
                        Status = p.User.Status,
                        CreatedAt = p.User.CreatedAt
                    },
                    CollectorId = p.CollectorId,
                    CollectorName = p.Collector != null ? p.Collector.User.Name : null,
                    WasteType = p.WasteType,
                    ScheduledDate = p.ScheduledDate,
                    ScheduledTime = p.ScheduledTime,
                    PickupStatus = p.PickupStatus,
                    Notes = p.Notes,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    PaymentStatus = p.Payment != null ? p.Payment.PaymentStatus : null,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdatePickupStatusAsync(int pickupId, UpdatePickupStatusDto dto)
        {
            var pickup = await _context.PickupRequests.FindAsync(pickupId);
            if (pickup == null) return false;

            pickup.PickupStatus = dto.PickupStatus;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignCollectorAsync(int pickupId, int collectorId)
        {
            var pickup = await _context.PickupRequests.FindAsync(pickupId);
            if (pickup == null) return false;

            pickup.CollectorId = collectorId;
            pickup.PickupStatus = "ASSIGNED";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnassignCollectorAsync(int pickupId)
        {
            var pickup = await _context.PickupRequests.FindAsync(pickupId);
            if (pickup == null) return false;

            pickup.CollectorId = null;
            pickup.PickupStatus = "PENDING";
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<int> CompletePickupAsync(int pickupId, CompletePickupDto dto)
        {
            var pickup = await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(p => p.PickupId == pickupId);
            
            if (pickup == null) return -1;

            // Create Waste Log
            var wasteLog = new WasteLog
            {
                PickupId = pickupId,
                WasteType = pickup.WasteType, // Use type from pickup
                WeightKg = dto.Weight,
                PhotoUrl = ""
            };
            _context.WasteLogs.Add(wasteLog);

            // Calculate points based on waste type
            int pointsEarned = CalculateEcoPoints(pickup.WasteType, (double)dto.Weight);

            // Update household/business waste totals and points
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == pickup.UserId);
            
            if (user != null)
            {
                if (user.Role.RoleName == "HOUSEHOLD")
                {
                    var household = await _context.HouseholdDetails
                        .FirstOrDefaultAsync(h => h.UserId == pickup.UserId);
                    if (household != null)
                    {
                        household.TotalWasteKg += dto.Weight;
                        household.EcoPoints += pointsEarned;
                    }
                }
                else if (user.Role.RoleName == "BUSINESS")
                {
                    var business = await _context.BusinessDetails
                        .FirstOrDefaultAsync(b => b.UserId == pickup.UserId);
                    if (business != null)
                    {
                        business.SustainabilityScore = Math.Min(100, business.SustainabilityScore + (int)(dto.Weight * 0.5m));
                    }
                }

                // Create eco reward record
                var reward = new EcoReward
                {
                    UserId = pickup.UserId,
                    PointsEarned = pointsEarned,
                    RewardType = $"Waste Collection - {pickup.WasteType}"
                };
                _context.EcoRewards.Add(reward);
            }

            pickup.PickupStatus = "COMPLETED";
            await _context.SaveChangesAsync();
            
            // Update leaderboard rankings
            await UpdateLeaderboardRankingsAsync();

            return pointsEarned;
        }

        public async Task<bool> CreateWasteLogAsync(int pickupId, WasteLogDto dto)
        {
            var pickup = await _context.PickupRequests
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PickupId == pickupId);
            
            if (pickup == null) return false;

            var wasteLog = new WasteLog
            {
                PickupId = pickupId,
                WasteType = dto.WasteType,
                WeightKg = dto.WeightKg,
                PhotoUrl = dto.PhotoUrl
            };

            _context.WasteLogs.Add(wasteLog);

            // Calculate points based on waste type
            int pointsEarned = CalculateEcoPoints(dto.WasteType, (double)dto.WeightKg);

            // Update household/business waste totals and points
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == pickup.UserId);
            
            if (user != null)
            {
                if (user.Role.RoleName == "HOUSEHOLD")
                {
                    var household = await _context.HouseholdDetails
                        .FirstOrDefaultAsync(h => h.UserId == pickup.UserId);
                    if (household != null)
                    {
                        household.TotalWasteKg += dto.WeightKg;
                        household.EcoPoints += pointsEarned;
                    }
                }
                else if (user.Role.RoleName == "BUSINESS")
                {
                    var business = await _context.BusinessDetails
                        .FirstOrDefaultAsync(b => b.UserId == pickup.UserId);
                    if (business != null)
                    {
                        // Business sustainability score increases with waste collection
                        business.SustainabilityScore = Math.Min(100, business.SustainabilityScore + (int)(dto.WeightKg * 0.5m));
                    }
                }

                // Create eco reward record
                var reward = new EcoReward
                {
                    UserId = pickup.UserId,
                    PointsEarned = pointsEarned,
                    RewardType = $"Waste Collection - {dto.WasteType}"
                };
                _context.EcoRewards.Add(reward);
            }

            pickup.PickupStatus = "COMPLETED";
            await _context.SaveChangesAsync();

            // Update leaderboard rankings
            await UpdateLeaderboardRankingsAsync();
            
            return true;
        }

        private async Task UpdateLeaderboardRankingsAsync()
        {
            // Get all households ordered by eco points
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

        public async Task<bool> FinalizePickupCompletionAsync(int pickupId)
        {
            var pickup = await _context.PickupRequests
                .Include(p => p.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(p => p.PickupId == pickupId);
            
            if (pickup == null) return false;
            
            // if already completed, just return true
            if (pickup.PickupStatus == "COMPLETED") return true;

            // Find the waste log created during bill generation
            var wasteLog = await _context.WasteLogs.FirstOrDefaultAsync(w => w.PickupId == pickupId);
            if (wasteLog == null) return false;

            // Calculate points based on waste type and weight
            int pointsEarned = CalculateEcoPoints(pickup.WasteType, (double)wasteLog.WeightKg);


            // Update user rewards
            var user = pickup.User;
            if (user != null)
            {
                if (user.Role?.RoleName == "HOUSEHOLD")
                {
                    var household = await _context.HouseholdDetails.FirstOrDefaultAsync(h => h.UserId == user.UserId);
                    if (household != null)
                    {
                        household.TotalWasteKg += wasteLog.WeightKg;
                        household.EcoPoints += pointsEarned;
                    }
                }
                else if (user.Role?.RoleName == "BUSINESS")
                {
                    var business = await _context.BusinessDetails.FirstOrDefaultAsync(b => b.UserId == user.UserId);
                    if (business != null)
                    {
                        business.SustainabilityScore = Math.Min(100, business.SustainabilityScore + (int)(wasteLog.WeightKg * 0.5m));
                    }
                }

                // Add to EcoRewards history
                var reward = new EcoReward
                {
                    UserId = user.UserId,
                    PointsEarned = pointsEarned,
                    RewardType = $"Waste Collection - {pickup.WasteType}",
                    EarnedOn = DateTime.Now
                };
                _context.EcoRewards.Add(reward);
            }

            pickup.PickupStatus = "COMPLETED";
            await _context.SaveChangesAsync();
            await UpdateLeaderboardRankingsAsync();
            
            return true;
        }

        public async Task<bool> CreateTrackingLogAsync(int pickupId, TrackingLogDto dto)
        {
            var trackingLog = new TrackingLog
            {
                PickupId = pickupId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.TrackingLogs.Add(trackingLog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<TrackingLogDto>> GetTrackingLogsAsync(int pickupId)
        {
            return await _context.TrackingLogs
                .Where(t => t.PickupId == pickupId)
                .OrderBy(t => t.Timestamp)
                .Select(t => new TrackingLogDto
                {
                    Latitude = t.Latitude,
                    Longitude = t.Longitude
                })
                .ToListAsync();
        }

        private int CalculateEcoPoints(string wasteType, double weight)
        {
            double ecoFactor = wasteType.ToUpper() switch
            {
                "BIODEGRADABLE" => 1.0,
                "NON_BIODEGRADABLE" => 0.5,
                "ORGANIC_WASTE" => 1.0,
                "RECYCLABLE_WASTE" => 1.5,
                "E-WASTE" => 2.0,
                "E_WASTE" => 2.0,
                "CHEMICAL_WASTE" => 2.5,
                "HAZARDOUS_WASTE" => 3.0,
                "CONSTRUCTION_WASTE" => 1.8,
                "NON_RECYCLABLE_COMMERCIAL" => 0.8,
                "FOOD" => 1.0,
                _ => 1.0
            };
            
            // Calculate points based on weight * pointsPerKg (from table)
            // Using Math.Ceiling to ensure at least 1 point for small valid pickups, or Round?
            // User asked "as per table", table says "Points per kg".
            // 1kg E-Waste (2) => 2 points.
            return (int)Math.Round(weight * ecoFactor);
        }
    }
}

