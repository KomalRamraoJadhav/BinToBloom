using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("WasteLogs")]
    public class WasteLog
    {
        [Key]
        [Column("log_id")]
        public int LogId { get; set; }

        [Required]
        [Column("pickup_id")]
        public int PickupId { get; set; }

        [Required]
        [Column("waste_type")]
        [StringLength(20)]
        [RegularExpression("^(FOOD|E-WASTE)$", ErrorMessage = "Waste type must be FOOD or E-WASTE")]
        public string WasteType { get; set; } = string.Empty;

        [Required]
        [Column("weight_kg")]
        [Range(0.1, 1000, ErrorMessage = "Weight must be between 0.1 and 1000 kg")]
        public decimal WeightKg { get; set; }

        [Column("collected_at")]
        public DateTime CollectedAt { get; set; } = DateTime.Now;

        [Column("photo_url")]
        [StringLength(500)]
        [Url(ErrorMessage = "Invalid URL format")]
        public string? PhotoUrl { get; set; }

        [Column("notes")]
        [StringLength(500)]
        public string? Notes { get; set; }

        [ForeignKey("PickupId")]
        public PickupRequest PickupRequest { get; set; } = null!;
    }
}