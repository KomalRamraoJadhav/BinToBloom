using System.ComponentModel.DataAnnotations;

namespace BinToBloom_Backend.Models.DTOs
{
    public class NGODashboardDto
    {
        public int NGOId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal TotalWasteCollected { get; set; }
        public decimal TotalCarbonSaved { get; set; }
        public int TotalReports { get; set; }
    }

    public class CityWasteDataDto
    {
        public string City { get; set; } = string.Empty;
        public decimal TotalWaste { get; set; }
        public int TotalPickups { get; set; }
        public decimal CarbonSaved { get; set; }
    }

    public class CreateNGOReportDto
    {
        [Required(ErrorMessage = "Total waste is required")]
        [Range(0, 999999.99, ErrorMessage = "Total waste must be between 0 and 999999.99")]
        public decimal TotalWaste { get; set; }

        [Required(ErrorMessage = "Carbon saved is required")]
        [Range(0, 999999.99, ErrorMessage = "Carbon saved must be between 0 and 999999.99")]
        public decimal CarbonSaved { get; set; }
    }

    public class NGOReportDto
    {
        public int ReportId { get; set; }
        public int NGOId { get; set; }
        public string NGOName { get; set; } = string.Empty;
        public decimal TotalWaste { get; set; }
        public decimal CarbonSaved { get; set; }
        public DateTime GeneratedOn { get; set; }
    }

    public class UpdateNGOProfileDto
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
}
