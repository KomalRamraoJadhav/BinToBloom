using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("EcoRewards")]
    public class EcoReward
    {
        [Key]
        [Column("reward_id")]
        public int RewardId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("points_earned")]
        [Range(1, 10000, ErrorMessage = "Points earned must be between 1 and 10000")]
        public int PointsEarned { get; set; }

        [Required]
        [Column("reward_type")]
        [StringLength(100, MinimumLength = 2)]
        public string RewardType { get; set; } = string.Empty;

        [Column("earned_on")]
        public DateTime EarnedOn { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}