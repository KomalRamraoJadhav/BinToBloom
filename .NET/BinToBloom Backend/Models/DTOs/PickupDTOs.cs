using System.ComponentModel.DataAnnotations;

namespace BinToBloom_Backend.Models.DTOs
{
    public class CreatePickupRequestDto
    {
        [Required(ErrorMessage = "Waste type is required")]
        [RegularExpression("^(FOOD|E-WASTE|BIODEGRADABLE|NON_BIODEGRADABLE|ORGANIC_WASTE|RECYCLABLE_WASTE|CHEMICAL_WASTE|HAZARDOUS_WASTE|CONSTRUCTION_WASTE|NON_RECYCLABLE_COMMERCIAL)$", ErrorMessage = "Invalid waste type")]
        public string WasteType { get; set; } = string.Empty;

        public string? Notes { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        [Required(ErrorMessage = "Scheduled date is required")]
        public string ScheduledDate { get; set; } = string.Empty;

        [Required(ErrorMessage = "Scheduled time is required")]
        public string ScheduledTime { get; set; } = string.Empty;

        // For business users - pickup frequency
        [RegularExpression("^(DAILY|WEEKLY|MONTHLY)$", ErrorMessage = "Frequency must be DAILY, WEEKLY, or MONTHLY")]
        public string? PickupFrequency { get; set; }
    }

    public class UpdatePickupStatusDto
    {
        [Required(ErrorMessage = "Pickup status is required")]
        [RegularExpression("^(PENDING|ACCEPTED|COMPLETED)$", ErrorMessage = "Status must be PENDING, ACCEPTED, or COMPLETED")]
        public string PickupStatus { get; set; } = string.Empty;
    }

    public class PickupRequestDto
    {
        public int PickupId { get; set; }
        public int UserId { get; set; }
        public UserDto User { get; set; } = new UserDto();
        public int? CollectorId { get; set; }
        public string? CollectorName { get; set; }
        public string WasteType { get; set; } = string.Empty;
        public DateOnly ScheduledDate { get; set; }
        public TimeOnly ScheduledTime { get; set; }
        public string PickupStatus { get; set; } = string.Empty;
        public string? PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? PickupFrequency { get; set; }
        public string? Notes { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class WasteLogDto
    {
        [Required(ErrorMessage = "Waste type is required")]
        [RegularExpression("^(FOOD|E-WASTE)$", ErrorMessage = "Waste type must be FOOD or E-WASTE")]
        public string WasteType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Weight is required")]
        [Range(0.1, 1000, ErrorMessage = "Weight must be between 0.1 and 1000 kg")]
        public decimal WeightKg { get; set; }

        [StringLength(500)]
        [Url(ErrorMessage = "Invalid URL format")]
        public string? PhotoUrl { get; set; }
    }

    public class TrackingLogDto
    {
        [Required(ErrorMessage = "Latitude is required")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public decimal Latitude { get; set; }

        [Required(ErrorMessage = "Longitude is required")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public decimal Longitude { get; set; }
    }
}
