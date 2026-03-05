using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.DTOs
{
    // ── Respuestas ────────────────────────────────────────────────────────────

    public class ContactMessageDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ── Peticiones ────────────────────────────────────────────────────────────

    public class CreateContactMessageDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        [EmailAddress(ErrorMessage = "El email no es válido.")]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "El mensaje es obligatorio.")]
        [MinLength(10, ErrorMessage = "El mensaje debe tener al menos 10 caracteres.")]
        public string Message { get; set; } = string.Empty;
    }
}