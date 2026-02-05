using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("Leaderboard")]
    public class Leaderboard
    {
        [Key]
        [Column("leaderboard_id")]
        public int LeaderboardId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("month")]
        [Range(1, 12, ErrorMessage = "Month must be between 1 and 12")]
        public int Month { get; set; }

        [Required]
        [Column("total_waste")]
        [Range(0, 999999.99, ErrorMessage = "Total waste must be between 0 and 999999.99")]
        public decimal TotalWaste { get; set; }

        [Required]
        [Column("rank")]
        [Range(1, int.MaxValue, ErrorMessage = "Rank must be greater than 0")]
        public int Rank { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}