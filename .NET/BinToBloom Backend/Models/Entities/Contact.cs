using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("Contacts")]
    public class Contact
    {
        [Key]
        [Column("contact_id")]
        public int ContactId { get; set; }

        [Required]
        [Column("name")]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        [StringLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("subject")]
        [StringLength(200, MinimumLength = 3)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [Column("message")]
        [StringLength(2000, MinimumLength = 10)]
        public string Message { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("is_read")]
        public bool IsRead { get; set; } = false;
    }
}

