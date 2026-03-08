using MemoireNomade.API.Data;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/bookings")]
    [Authorize]
    public class AdminBookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IStripeService _stripeService;
        private readonly AppDbContext _db;

        public AdminBookingsController(IBookingService bookingService, IStripeService stripeService, AppDbContext db)
        {
            _bookingService = bookingService;
            _stripeService = stripeService;
            _db = db;
        }

        // GET /api/admin/bookings
        [HttpGet]
        public async Task<IActionResult> GetAllBookings(
            [FromQuery] string? status,
            [FromQuery] int? tourId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var bookings = await _bookingService
                .GetAllBookingsAsync(status, tourId, from, to);
            return Ok(bookings);
        }

        // GET /api/admin/bookings/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);

            if (booking == null)
                return NotFound(new { message = "Reserva no encontrada." });

            return Ok(booking);
        }

        // POST /api/admin/bookings
        [HttpPost]
        public async Task<IActionResult> CreateManualBooking(
            [FromBody] CreateManualBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";

            var (success, errorMessage, booking) =
                await _bookingService.CreateManualBookingAsync(dto, adminEmail);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return CreatedAtAction(
                nameof(GetBookingById),
                new { id = booking!.Id },
                booking);
        }

        // PUT /api/admin/bookings/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBooking(
            int id, [FromBody] UpdateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";

            var (success, errorMessage) =
                await _bookingService.UpdateBookingAsync(id, dto, adminEmail);

            if (!success)
                return BadRequest(new { message = errorMessage });

            var booking = await _bookingService.GetBookingByIdAsync(id);
            return Ok(booking);
        }

        // POST /api/admin/bookings/{id}/refund
        [HttpPost("{id:int}/refund")]
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
}

public class RefundDto
{
    public decimal Amount { get; set; }
}