using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BinToBloom_Backend.Models.Entities
{
    [Table("Payments")]
    public class Payment
    {
        [Key]
        [Column("payment_id")]
        public int PaymentId { get; set; }

        [Column("business_id")]
        public int? BusinessId { get; set; }


        [Required]
        [Column("amount")]
        [Range(0.01, 999999.99, ErrorMessage = "Amount must be between 0.01 and 999999.99")]
        public decimal Amount { get; set; }

        [Column("razorpay_order_id")]
        public string? RazorpayOrderId { get; set; }

        [Column("razorpay_payment_id")]
        public string? RazorpayPaymentId { get; set; }

        [Column("razorpay_signature")]
        public string? RazorpaySignature { get; set; }

        [Column("payment_mode")]
        public string PaymentMode { get; set; } = "ONLINE"; // Default or required? BusinessService sets it.

        [Required]
        [Column("payment_status")]
        [StringLength(20)]
        public string PaymentStatus { get; set; } = string.Empty;

        [Column("pickup_request_id")]
        public int? PickupRequestId { get; set; }

        [ForeignKey("PickupRequestId")]
        public PickupRequest? PickupRequest { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column("payment_date")]
        public DateTime PaymentDate { get; set; } = DateTime.Now;

        [ForeignKey("BusinessId")]
        public BusinessDetail? BusinessDetail { get; set; }

    }
}