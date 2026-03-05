using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.Models
{
    public class BookingStatusHistory
    {
        [Key]
        public int Id { get; set; }

        public int BookingId { get; set; }

        [MaxLength(50)]
        public string? PreviousStatus { get; set; }

        [Required]
        [MaxLength(50)]
        public string NewStatus { get; set; } = string.Empty;

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(200)]
        public string ChangedBy { get; set; } = string.Empty;

        public string? Notes { get; set; }

        // Propiedad de navegación
        public Booking Booking { get; set; } = null!;
    }
}