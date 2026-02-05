using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("BusinessDetails")]
    public class BusinessDetail
    {
        [Key]
        [Column("business_id")]
        public int BusinessId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("business_type")]
        [StringLength(100, MinimumLength = 2)]
        public string BusinessType { get; set; } = string.Empty;

        [Column("pickup_frequency")]
        [StringLength(10)]
        [RegularExpression("^(DAILY|WEEKLY)$", ErrorMessage = "Pickup frequency must be DAILY or WEEKLY")]
        public string PickupFrequency { get; set; } = string.Empty;

        [Column("sustainability_score")]
        [Range(0, 100)]
        public int SustainabilityScore { get; set; } = 0;

        [Column("payment_enabled")]
        public bool PaymentEnabled { get; set; } = true;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}