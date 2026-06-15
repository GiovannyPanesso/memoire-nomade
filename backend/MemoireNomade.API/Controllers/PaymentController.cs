using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.Data;
using MemoireNomade.API.Services;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace MemoireNomade.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly IBookingService _bookingService;
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        IStripeService stripeService,
        IBookingService bookingService,
        AppDbContext db,
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<PaymentController> logger)
    {
        _stripeService = stripeService;
        _bookingService = bookingService;
        _db = db;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    // Crear PaymentIntent — llamado desde el frontend antes de mostrar el formulario de pago
    [HttpPost("create-payment-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentDto dto)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.ConfirmationCode == dto.ConfirmationCode);

        if (booking == null)
            return NotFound(new { message = "Reserva no encontrada." });

        if (booking.Status == "Confirmada" || booking.Status == "Completada")
            return BadRequest(new { message = "Esta reserva ya ha sido pagada." });

        var paymentIntent = await _stripeService.CreatePaymentIntentAsync(
            booking.TotalAmount,
            "eur",
            booking.Id,
            booking.ConfirmationCode
        );

        return Ok(new
        {
            clientSecret = paymentIntent.ClientSecret,
            amount = booking.TotalAmount,
            confirmationCode = booking.ConfirmationCode
        });
    }

    // Confirmar pago desde el frontend (para entornos sin webhook accesible)
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Items)
                .ThenInclude(i => i.Session)
                    .ThenInclude(s => s.Tour)
            .Include(b => b.Items)
                .ThenInclude(i => i.SessionPricing)
            .FirstOrDefaultAsync(b => b.ConfirmationCode == dto.ConfirmationCode);

        if (booking == null)
            return NotFound(new { message = "Reserva no encontrada." });

        if (booking.Status == "Confirmada" || booking.Status == "Completada")
            return Ok(new { message = "Reserva ya confirmada." });

        await _bookingService.ConfirmBookingAsync(booking.Id, dto.PaymentIntentId ?? "demo", dto.PaymentMethod ?? "Stripe");

        // Notificar al admin
        try
        {
            var emailData = new BookingConfirmationData
            {
                CustomerName = booking.Customer.Name,
                CustomerEmail = booking.Customer.Email,
                ConfirmationCode = booking.ConfirmationCode,
                TotalAmount = booking.TotalAmount,
                Items = booking.Items.Select(i => new BookingItemData
                {
                    TourName = i.Session.Tour.Name,
                    Date = i.Session.Date.ToString("dd/MM/yyyy"),
                    Time = i.Session.Time.ToString(@"hh\:mm"),
                    PricingLabel = i.SessionPricing.Label,
                    Subtotal = i.Subtotal
                }).ToList()
            };
            await _emailService.SendNewBookingNotificationAsync(emailData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending admin notification for booking {Code}", dto.ConfirmationCode);
        }

        return Ok(new { message = "Reserva confirmada." });
    }

    // Webhook — Stripe llama a este endpoint cuando el pago se completa
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var webhookSecret = _configuration["Stripe:WebhookSecret"];

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                webhookSecret
            );

            if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent == null) return Ok();

                var bookingId = int.Parse(paymentIntent.Metadata["bookingId"]);
                var booking = await _db.Bookings
                    .Include(b => b.StatusHistory)
                    .Include(b => b.Customer)
                    .Include(b => b.Items)
                        .ThenInclude(i => i.Session)
                            .ThenInclude(s => s.Tour)
                    .Include(b => b.Items)
                        .ThenInclude(i => i.SessionPricing)
                    .FirstOrDefaultAsync(b => b.Id == bookingId);

                if (booking != null && booking.Status == "Pendiente")
                {
                    var previousStatus = booking.Status;
                    booking.Status = "Confirmada";

                    // Guardar pago
                    var payment = new Models.Payment
                    {
                        BookingId = booking.Id,
                        Amount = paymentIntent.Amount / 100m,
                        Currency = paymentIntent.Currency.ToUpper(),
                        PaymentMethod = "Stripe",
                        Status = "Completado",
                        StripePaymentIntentId = paymentIntent.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.Payments.Add(payment);

                    // Historial
                    booking.StatusHistory.Add(new Models.BookingStatusHistory
                    {
                        BookingId = booking.Id,
                        PreviousStatus = previousStatus,
                        NewStatus = "Confirmada",
                        ChangedAt = DateTime.UtcNow,
                        ChangedBy = "Stripe Webhook"
                    });

                    await _db.SaveChangesAsync();

                    // Notificar al Admin
                    try
                    {
                        var emailData = new BookingConfirmationData
                        {
                            CustomerName = booking.Customer.Name,
                            CustomerEmail = booking.Customer.Email,
                            ConfirmationCode = booking.ConfirmationCode,
                            TotalAmount = booking.TotalAmount,
                            Items = booking.Items.Select(i => new BookingItemData
                            {
                                TourName = i.Session.Tour.Name,
                                Date = i.Session.Date.ToString("dd/MM/yyyy"),
                                Time = i.Session.Time.ToString(@"hh\\:mm"),
                                PricingLabel = i.SessionPricing.Label,
                                Subtotal = i.Subtotal
                            }).ToList()
                        };

                        await _emailService.SendNewBookingNotificationAsync(emailData);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error sending admin notification for booking {Id}", bookingId);
                    }
                }
            }

            return Ok();
        }
        catch (StripeException)
        {
            return BadRequest();
        }
    }
}

public class CreatePaymentIntentDto
{
    public string ConfirmationCode { get; set; } = string.Empty;
}

public class ConfirmPaymentDto
{
    public string ConfirmationCode { get; set; } = string.Empty;
    public string? PaymentIntentId { get; set; }
    public string? PaymentMethod { get; set; }
}