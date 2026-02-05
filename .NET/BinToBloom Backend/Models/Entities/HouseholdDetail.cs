using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("HouseholdDetails")]
    public class HouseholdDetail
    {
        [Key]
        [Column("household_id")]
        public int HouseholdId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("total_waste_kg")]
        [Range(0, 99999.99)]
        public decimal TotalWasteKg { get; set; } = 0;

        [Column("eco_points")]
        [Range(0, int.MaxValue)]
        public int EcoPoints { get; set; } = 0;

        [Column("leaderboard_rank")]
        [Range(0, int.MaxValue)]
        public int LeaderboardRank { get; set; } = 0;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}