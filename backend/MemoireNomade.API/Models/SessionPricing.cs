using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MemoireNomade.API.Models
{
    public class SessionPricing
    {
        [Key]
        public int Id { get; set; }

        public int SessionId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // group / child / extra

        public int? MinPersons { get; set; }

        public int? MaxPersons { get; set; }

        // Propiedad de navegación
        public Session Session { get; set; } = null!;
        public ICollection<BookingItem> BookingItems { get; set; } = new List<BookingItem>();
    }
}