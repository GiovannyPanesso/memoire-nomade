using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.DTOs
{
    // ── Respuestas ────────────────────────────────────────────────────────────

    public class BookingSummaryDto
    {
        public int Id { get; set; }
        public string ConfirmationCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public List<BookingItemSummaryDto> Items { get; set; } = new();
    }

    public class BookingDetailDto
    {
        public int Id { get; set; }
        public string ConfirmationCode { get; set; } = string.Empty;
        public CustomerDto Customer { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string? StripePaymentIntentId { get; set; }
        public string? PaypalOrderId { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<BookingItemDetailDto> Items { get; set; } = new();
        public List<BookingStatusHistoryDto> StatusHistory { get; set; } = new();
        public List<PaymentDto> Payments { get; set; } = new();
    }

    public class BookingItemSummaryDto
    {
        public int Id { get; set; }
        public string TourName { get; set; } = string.Empty;
        public DateOnly SessionDate { get; set; }
        public TimeOnly SessionTime { get; set; }
        public int NumAdults { get; set; }
        public int NumChildren { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class BookingItemDetailDto
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public DateOnly SessionDate { get; set; }
        public TimeOnly SessionTime { get; set; }
        public bool IncludesSeineCruise { get; set; }
        public string PricingLabel { get; set; } = string.Empty;
        public decimal PricingPrice { get; set; }
        public int NumAdults { get; set; }
        public int NumChildren { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class CustomerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Country { get; set; }
    }

    public class BookingStatusHistoryDto
    {
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public string ChangedBy { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class PaymentDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? RefundAmount { get; set; }
        public DateTime? RefundDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ── Peticiones ────────────────────────────────────────────────────────────

    public class CreateBookingDto
    {
        [Required(ErrorMessage = "Los datos del cliente son obligatorios.")]
        public CreateCustomerDto Customer { get; set; } = new();

        [Required(ErrorMessage = "Los ítems de la reserva son obligatorios.")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos un ítem.")]
        public List<CreateBookingItemDto> Items { get; set; } = new();
    }

    public class CreateCustomerDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        [EmailAddress(ErrorMessage = "El email no es válido.")]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }
    }

    public class CreateBookingItemDto
    {
        [Required]
        public int SessionId { get; set; }

        [Required]
        public int SessionPricingId { get; set; }

        [Range(0, 99)]
        public int NumAdults { get; set; }

        [Range(0, 99)]
        public int NumChildren { get; set; }
    }

    public class CreateManualBookingDto
    {
        [Required]
        public CreateCustomerDto Customer { get; set; } = new();

        [Required]
        [MinLength(1)]
        public List<CreateBookingItemDto> Items { get; set; } = new();

        public string Status { get; set; } = "Confirmada";

        public string? Notes { get; set; }
    }

    public class UpdateBookingDto
    {
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }
}