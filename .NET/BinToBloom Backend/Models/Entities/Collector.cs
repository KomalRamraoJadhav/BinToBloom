using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("Collectors")]
    public class Collector
    {
        [Key]
        [Column("collector_id")]
        public int CollectorId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("status")]
        [StringLength(10)]
        [RegularExpression("^(ACTIVE|BUSY)$", ErrorMessage = "Status must be ACTIVE or BUSY")]
        public string Status { get; set; } = "ACTIVE";

        [Column("current_lat", TypeName = "decimal(9,6)")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public decimal? CurrentLat { get; set; }

        [Column("current_lng", TypeName = "decimal(9,6)")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public decimal? CurrentLng { get; set; }


        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public ICollection<PickupRequest> PickupRequests { get; set; } = new List<PickupRequest>();
    }
}