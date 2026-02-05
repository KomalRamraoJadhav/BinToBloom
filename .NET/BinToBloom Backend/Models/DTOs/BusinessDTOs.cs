using System.ComponentModel.DataAnnotations;

namespace BinToBloom_Backend.Models.DTOs
{
    public class BusinessProfileDto
    {
        public int BusinessId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string PickupFrequency { get; set; } = string.Empty;
        public int SustainabilityScore { get; set; }
        public bool PaymentEnabled { get; set; }
    }

    public class UpdateBusinessProfileDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required")]
        [RegularExpression(@"^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Address must be between 10 and 500 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "City must be between 2 and 100 characters")]
        public string City { get; set; } = string.Empty;

        [Required(ErrorMessage = "Business type is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Business type must be between 2 and 100 characters")]
        public string BusinessType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Pickup frequency is required")]
        [RegularExpression("^(DAILY|WEEKLY)$", ErrorMessage = "Pickup frequency must be DAILY or WEEKLY")]
        public string PickupFrequency { get; set; } = string.Empty;
    }

    public class CreatePaymentDto
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, 999999.99, ErrorMessage = "Amount must be between 0.01 and 999999.99")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Payment mode is required")]
        [RegularExpression("^(UPI|CARD|WALLET)$", ErrorMessage = "Payment mode must be UPI, CARD, or WALLET")]
        public string PaymentMode { get; set; } = string.Empty;
    }

    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int? BusinessId { get; set; }

        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
    }
}

