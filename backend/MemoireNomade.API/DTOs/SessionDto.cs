using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.DTOs
{
    // ── Respuestas ────────────────────────────────────────────────────────────

    public class SessionSummaryDto
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }
        public int AvailableSpots { get; set; }
        public bool IncludesSeineCruise { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<SessionPricingDto> Pricings { get; set; } = new();
    }

    public class SessionPricingDto
    {
        public int Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Type { get; set; } = string.Empty;
        public int? MinPersons { get; set; }
        public int? MaxPersons { get; set; }
    }

    // ── Peticiones ────────────────────────────────────────────────────────────

    public class CreateSessionDto
    {
        [Required(ErrorMessage = "El tour es obligatorio.")]
        public int TourId { get; set; }

        [Required(ErrorMessage = "La fecha es obligatoria.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "La hora es obligatoria.")]
        public TimeOnly Time { get; set; }

        [Range(1, 999, ErrorMessage = "Las plazas disponibles deben ser entre 1 y 999.")]
        public int AvailableSpots { get; set; }

        public bool IncludesSeineCruise { get; set; } = false;

        [Required(ErrorMessage = "Las tarifas son obligatorias.")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos una tarifa.")]
        public List<CreateSessionPricingDto> Pricings { get; set; } = new();
    }

    public class CreateSessionPricingDto
    {
        [Required(ErrorMessage = "La descripción de la tarifa es obligatoria.")]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Range(0, 99999.99, ErrorMessage = "El precio debe ser un valor positivo.")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "El tipo de tarifa es obligatorio.")]
        public string Type { get; set; } = string.Empty; // group / child / extra

        public int? MinPersons { get; set; }
        public int? MaxPersons { get; set; }
    }

    public class UpdateSessionDto
    {
        [Required(ErrorMessage = "La fecha es obligatoria.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "La hora es obligatoria.")]
        public TimeOnly Time { get; set; }

        [Range(1, 999, ErrorMessage = "Las plazas disponibles deben ser entre 1 y 999.")]
        public int AvailableSpots { get; set; }

        public bool IncludesSeineCruise { get; set; }

        [Required(ErrorMessage = "Las tarifas son obligatorias.")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos una tarifa.")]
        public List<CreateSessionPricingDto> Pricings { get; set; } = new();
    }

    public class UpdateSessionStatusDto
    {
        [Required(ErrorMessage = "El estado es obligatorio.")]
        public string Status { get; set; } = string.Empty;

        public string? Notes { get; set; }
    }
}