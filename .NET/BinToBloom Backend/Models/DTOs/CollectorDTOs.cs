using System.ComponentModel.DataAnnotations;

namespace BinToBloom_Backend.Models.DTOs
{
    public class CollectorDashboardDto
    {
        public int CollectorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? CurrentLat { get; set; }
        public decimal? CurrentLng { get; set; }
        public int PendingRequests { get; set; }
        public int AcceptedRequests { get; set; }
        public int CompletedRequests { get; set; }
    }

    public class UpdateCollectorLocationDto
    {
        [Required(ErrorMessage = "Latitude is required")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public decimal Latitude { get; set; }

        [Required(ErrorMessage = "Longitude is required")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public decimal Longitude { get; set; }
    }

    public class UpdateCollectorStatusDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(ACTIVE|BUSY)$", ErrorMessage = "Status must be ACTIVE or BUSY")]
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateCollectorProfileDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Name can only contain letters and spaces")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required")]
        [RegularExpression(@"^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Address must be between 10 and 500 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "City must be between 2 and 100 characters")]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "City can only contain letters and spaces")]
        public string City { get; set; } = string.Empty;
    }

    public class CollectorProfileDto
    {
        public int CollectorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string VehicleType { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
    }

    public class GenerateBillDto
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, 999999.99, ErrorMessage = "Amount must be between 0.01 and 999999.99")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Weight is required")]
        [Range(0.1, 10000, ErrorMessage = "Weight must be between 0.1 and 10000 kg")]
        public decimal Weight { get; set; }

        public string? Notes { get; set; }
    }

    public class CompletePickupDto
    {
        [Required(ErrorMessage = "Weight is required")]
        [Range(0.1, 1000, ErrorMessage = "Weight must be between 0.1 and 1000 kg")]
        public decimal Weight { get; set; }

        public string? Notes { get; set; }
    }
}
