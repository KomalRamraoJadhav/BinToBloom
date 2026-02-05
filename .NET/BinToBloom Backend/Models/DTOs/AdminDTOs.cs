using System.ComponentModel.DataAnnotations;

namespace BinToBloom_Backend.Models.DTOs
{
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int TotalCollectors { get; set; }
        public int TotalNGOs { get; set; }
        public int PendingPickups { get; set; }
        public int CompletedPickups { get; set; }
        public decimal TotalWasteCollected { get; set; }
    }

    public class UserApprovalDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(ACTIVE|INACTIVE)$", ErrorMessage = "Status must be ACTIVE or INACTIVE")]
        public string Status { get; set; } = string.Empty;
    }

    public class AssignCollectorDto
    {
        [Required(ErrorMessage = "Collector ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Invalid collector ID")]
        public int CollectorId { get; set; }
    }

    public class SystemReportDto
    {
        public DateTime ReportDate { get; set; }
        public int TotalUsers { get; set; }
        public int TotalPickups { get; set; }
        public int CompletedPickups { get; set; }
        public decimal TotalWasteCollected { get; set; }
        public decimal TotalCarbonSaved { get; set; }
        public Dictionary<string, int> UsersByRole { get; set; } = new();
        public Dictionary<string, decimal> WasteByType { get; set; } = new();
    }
}

