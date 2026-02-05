using BinToBloom_Backend.Models.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("name", TypeName = "varchar(100)")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("email", TypeName = "varchar(255)")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Column("password", TypeName = "varchar(255)")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Column("role_id")]
    public int RoleId { get; set; }

    [Required]
    [Column("phone", TypeName = "varchar(15)")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [Column("address", TypeName = "varchar(500)")]
    public string Address { get; set; } = string.Empty;

    [Required]
    [Column("city", TypeName = "varchar(100)")]
    public string City { get; set; } = string.Empty;

    [Column("status", TypeName = "varchar(10)")]
    public string Status { get; set; } = "ACTIVE";

    [Column("created_at", TypeName = "datetime")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [ForeignKey(nameof(RoleId))]
    public Role Role { get; set; } = null!;


    public HouseholdDetail? HouseholdDetail { get; set; } public BusinessDetail? BusinessDetail { get; set; } public Collector? Collector { get; set; } public NGO? NGO { get; set; } public Admin? Admin { get; set; } public ICollection<PickupRequest> PickupRequests { get; set; } = new List<PickupRequest>(); public ICollection<EcoReward> EcoRewards { get; set; } = new List<EcoReward>();
}
