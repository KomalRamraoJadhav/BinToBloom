using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("PickupRequests")]
    public class PickupRequest
    {
        [Key]
        [Column("pickup_id")]
        public int PickupId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("collector_id")]
        public int? CollectorId { get; set; }

        [Required]
        [Column("waste_type")]
        [StringLength(20)]
        [RegularExpression("^(FOOD|E-WASTE|BIODEGRADABLE|NON_BIODEGRADABLE)$", ErrorMessage = "Invalid waste type")]
        public string WasteType { get; set; } = string.Empty;


        [Column("notes")]
        [StringLength(500)]
        public string? Notes { get; set; }

        [Column("pickup_frequency")]
        [StringLength(10)]
        public string? PickupFrequency { get; set; }

        [Column("latitude", TypeName = "decimal(10, 8)")]
        public decimal? Latitude { get; set; }


        [Column("longitude", TypeName = "decimal(11, 8)")]
        public decimal? Longitude { get; set; }

        [Required]
        [Column("scheduled_date")]
        public DateOnly ScheduledDate { get; set; }

        [Required]
        [Column("scheduled_time")]
        public TimeOnly ScheduledTime { get; set; }

        [Column("pickup_status")]
        [StringLength(20)]
        [RegularExpression("^(PENDING|ACCEPTED|COMPLETED|PAID)$", ErrorMessage = "Status must be PENDING, ACCEPTED, COMPLETED or PAID")]
        public string PickupStatus { get; set; } = "PENDING";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("CollectorId")]
        public Collector? Collector { get; set; }

        public ICollection<WasteLog> WasteLogs { get; set; } = new List<WasteLog>();
        public ICollection<TrackingLog> TrackingLogs { get; set; } = new List<TrackingLog>();

        public Payment? Payment { get; set; }
    }
}