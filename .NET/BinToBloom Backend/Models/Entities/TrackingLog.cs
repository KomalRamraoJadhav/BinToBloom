using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("TrackingLogs")]
    public class TrackingLog
    {
        [Key]
        [Column("track_id")]
        public int TrackId { get; set; }

        [Required]
        [Column("pickup_id")]
        public int PickupId { get; set; }

        [Required]
        [Column("latitude")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public decimal Latitude { get; set; }

        [Required]
        [Column("longitude")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public decimal Longitude { get; set; }

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.Now;

        [ForeignKey("PickupId")]
        public PickupRequest PickupRequest { get; set; } = null!;
    }
}