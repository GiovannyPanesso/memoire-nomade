using MemoireNomade.API.Data;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MemoireNomade.API.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IBookingService _bookingService;
        private readonly IStripeService _stripeService;

        public BookingsController(
            AppDbContext db,
            IBookingService bookingService,
            IStripeService stripeService)
        {
            _db = db;
            _bookingService = bookingService;
            _stripeService = stripeService;
        }

        // GET /api/bookings/{confirmationCode}
        [HttpGet("{confirmationCode}")]
        public async Task<IActionResult> GetByConfirmationCode(string confirmationCode)
        {
            var booking = await _bookingService
                .GetBookingByConfirmationCodeAsync(confirmationCode);

            if (booking == null)
                return NotFound(new { message = "Reserva no encontrada." });

            return Ok(booking);
        }

        // POST /api/bookings
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage, booking) =
                await _bookingService.CreateBookingAsync(dto);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return CreatedAtAction(
                nameof(GetByConfirmationCode),
                new { confirmationCode = booking!.ConfirmationCode },
                booking);
        }

        // POST /api/bookings/{id}/refund
        [HttpPost("{id}/refund")]
        public async Task<IActionResult> Refund(int id, [FromBody] RefundDto dto)
        {
            var booking = await _db.Bookings
                .Include(b => b.Payments)
                .Include(b => b.StatusHistory)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound(new { message = "Reserva no encontrada." });

            var payment = booking.Payments
                .FirstOrDefault(p => p.PaymentMethod == "Stripe" && p.Status == "Completado");

            if (payment == null || string.IsNullOrEmpty(payment.StripePaymentIntentId))
                return BadRequest(new { message = "No se encontró un pago de Stripe para esta reserva." });

            if (dto.Amount <= 0 || dto.Amount > payment.Amount)
                return BadRequest(new { message = "El importe del reembolso no es válido." });

            try
            {
                var refund = await _stripeService.CreateRefundAsync(
                    payment.StripePaymentIntentId,
                    dto.Amount
                );

                payment.RefundAmount = dto.Amount;
                payment.RefundDate = DateTime.UtcNow;
                payment.Status = dto.Amount >= payment.Amount ? "Reembolsado" : "ReembolsoParcial";

                var previousStatus = booking.Status;
                booking.Status = "Reembolsada";

                booking.StatusHistory.Add(new Models.BookingStatusHistory
                {
                    BookingId = booking.Id,
                    PreviousStatus = previousStatus,
                    NewStatus = "Reembolsada",
                    ChangedAt = DateTime.UtcNow,
                    ChangedBy = "Admin",
                    Notes = $"Reembolso de {dto.Amount:F2}€ procesado via Stripe."
                });

                await _db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Reembolso procesado correctamente.",
                    refundId = refund.Id,
                    amount = dto.Amount
                });
            }
            catch (Stripe.StripeException ex)
            {
                return BadRequest(new { message = $"Error de Stripe: {ex.Message}" });
            }
        }
    }

    public class RefundDto
    {
        public decimal Amount { get; set; }
    }
}