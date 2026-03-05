using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.DTOs
{
    // ── Respuestas (lo que devuelve la API) ───────────────────────────────────

    public class TourSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public string? MainImageUrl { get; set; }
        public int SessionCount { get; set; }
        public int AvailableSpots { get; set; } // Suma de plazas de sesiones activas
    }

    public class TourDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Includes { get; set; }
        public string? NotIncludes { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public string? MainImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<TourImageDto> Images { get; set; } = new();
    }

    public class TourImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int Order { get; set; }
    }

    // ── Peticiones (lo que recibe la API) ─────────────────────────────────────

    public class CreateTourDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        public string Description { get; set; } = string.Empty;

        public string? Includes { get; set; }

        public string? NotIncludes { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        [MaxLength(500)]
        public string? MainImageUrl { get; set; }
    }

    public class UpdateTourDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        public string Description { get; set; } = string.Empty;

        public string? Includes { get; set; }

        public string? NotIncludes { get; set; }

        public bool IsActive { get; set; }

        public bool IsFeatured { get; set; }

        [MaxLength(500)]
        public string? MainImageUrl { get; set; }
    }
}