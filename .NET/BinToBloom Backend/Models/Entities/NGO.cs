using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("NGOs")]
    public class NGO
    {
        [Key]
        [Column("ngo_id")]
        public int NGOId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("city")]
        [StringLength(100, MinimumLength = 2)]
        public string City { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public ICollection<NGOReport> NGOReports { get; set; } = new List<NGOReport>();
    }
}