using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.Models
{
    public class Session
    {
        [Key]
        public int Id { get; set; }

        public int TourId { get; set; }

        public DateOnly Date { get; set; }

        public TimeOnly Time { get; set; }

        public int AvailableSpots { get; set; }

        public bool IncludesSeineCruise { get; set; } = false;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Activa";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación
        public Tour Tour { get; set; } = null!;
        public ICollection<SessionPricing> Pricings { get; set; } = new List<SessionPricing>();
        public ICollection<BookingItem> BookingItems { get; set; } = new List<BookingItem>();
    }
}