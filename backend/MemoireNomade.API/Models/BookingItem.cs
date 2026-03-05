using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MemoireNomade.API.Models
{
    public class BookingItem
    {
        [Key]
        public int Id { get; set; }

        public int BookingId { get; set; }

        public int SessionId { get; set; }

        public int SessionPricingId { get; set; }

        public int NumAdults { get; set; }

        public int NumChildren { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Subtotal { get; set; }

        // Propiedades de navegación
        public Booking Booking { get; set; } = null!;
        public Session Session { get; set; } = null!;
        public SessionPricing SessionPricing { get; set; } = null!;
    }
}