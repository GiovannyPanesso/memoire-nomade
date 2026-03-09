using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.Data;
using MemoireNomade.API.Services;
using Microsoft.EntityFrameworkCore;

namespace MemoireNomade.API.Controllers;

[ApiController]
[Route("api/paypal")]
public class PayPalController : ControllerBase
{
    private readonly IPayPalService _payPalService;
    private readonly AppDbContext _db;
    private readonly ILogger<PayPalController> _logger;

    public PayPalController(IPayPalService payPalService, AppDbContext db, ILogger<PayPalController> logger)
    {
        _payPalService = payPalService;
        _db = db;
        _logger = logger;
    }

    // Crear orden PayPal
    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreatePayPalOrderDto dto)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.ConfirmationCode == dto.ConfirmationCode);

        if (booking == null)
            return NotFound(new { message = "Reserva no encontrada." });

        if (booking.Status == "Confirmada" || booking.Status == "Completada")
            return BadRequest(new { message = "Esta reserva ya ha sido pagada." });

        var orderId = await _payPalService.CreateOrderAsync(
            booking.TotalAmount,
            "USD",
            booking.Id,
            booking.ConfirmationCode
        );

        return Ok(new { orderId });
    }

    // Capturar pago PayPal
    [HttpPost("capture-order")]
    public async Task<IActionResult> CaptureOrder([FromBody] CapturePayPalOrderDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.StatusHistory)
            .Include(b => b.Customer)
            .Include(b => b.Items)
                .ThenInclude(i => i.Session)
                    .ThenInclude(s => s.Tour)
            .Include(b => b.Items)
                .ThenInclude(i => i.SessionPricing)
            .FirstOrDefaultAsync(b => b.ConfirmationCode == dto.ConfirmationCode);

        if (booking == null)
            return NotFound(new { message = "Reserva no encontrada." });

        var success = await _payPalService.CaptureOrderAsync(dto.OrderId);

        if (!success)
            return BadRequest(new { message = "No se pudo capturar el pago de PayPal." });

        var previousStatus = booking.Status;
        booking.Status = "Confirmada";
        booking.PaypalOrderId = dto.OrderId;

        var payment = new Models.Payment
        {
            BookingId = booking.Id,
            Amount = booking.TotalAmount,
            Currency = "EUR",
            PaymentMethod = "PayPal",
            Status = "Completado",
            PayPalCaptureId = dto.OrderId,
            CreatedAt = DateTime.UtcNow
        };
        _db.Payments.Add(payment);

        booking.StatusHistory.Add(new Models.BookingStatusHistory
        {
            BookingId = booking.Id,
            PreviousStatus = previousStatus,
            NewStatus = "Confirmada",
            ChangedAt = DateTime.UtcNow,
            ChangedBy = "PayPal"
        });

        await _db.SaveChangesAsync();

        // Notificar al admin
        try
        {
            var emailService = HttpContext.RequestServices.GetRequiredService<IEmailService>();
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
            await emailService.SendNewBookingNotificationAsync(emailData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending admin notification for PayPal booking {Code}", booking.ConfirmationCode);
        }

        return Ok(new
        {
            confirmationCode = booking.ConfirmationCode,
            message = "Pago capturado correctamente."
        });
    }
}

public class CreatePayPalOrderDto
{
    public string ConfirmationCode { get; set; } = string.Empty;
}

public class CapturePayPalOrderDto
{
    public string OrderId { get; set; } = string.Empty;
    public string ConfirmationCode { get; set; } = string.Empty;
}