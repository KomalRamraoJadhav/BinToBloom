using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("NGOReports")]
    public class NGOReport
    {
        [Key]
        [Column("report_id")]
        public int ReportId { get; set; }

        [Required]
        [Column("ngo_id")]
        public int NGOId { get; set; }

        [Required]
        [Column("total_waste")]
        [Range(0, 999999.99, ErrorMessage = "Total waste must be between 0 and 999999.99")]
        public decimal TotalWaste { get; set; }

        [Required]
        [Column("carbon_saved")]
        [Range(0, 999999.99, ErrorMessage = "Carbon saved must be between 0 and 999999.99")]
        public decimal CarbonSaved { get; set; }

        [Column("generated_on")]
        public DateTime GeneratedOn { get; set; } = DateTime.Now;

        [ForeignKey("NGOId")]
        public NGO NGO { get; set; } = null!;
    }
}