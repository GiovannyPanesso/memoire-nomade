using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MemoireNomade.API.Models
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string ConfirmationCode { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pendiente";

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        [MaxLength(200)]
        public string? StripePaymentIntentId { get; set; }

        [MaxLength(200)]
        public string? PaypalOrderId { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación
        public Customer Customer { get; set; } = null!;
        public ICollection<BookingItem> Items { get; set; } = new List<BookingItem>();
        public ICollection<BookingStatusHistory> StatusHistory { get; set; } = new List<BookingStatusHistory>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}