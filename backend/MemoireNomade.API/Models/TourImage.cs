using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.Models
{
    public class TourImage
    {
        [Key]
        public int Id { get; set; }

        public int TourId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public int Order { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Propiedad de navegación
        public Tour Tour { get; set; } = null!;
    }
}