using SendGrid;
using SendGrid.Helpers.Mail;

namespace MemoireNomade.API.Services;

public interface IEmailService
{
    Task SendBookingConfirmationAsync(BookingConfirmationData data);
    Task SendNewBookingNotificationAsync(BookingConfirmationData data);
}

public class BookingConfirmationData
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string ConfirmationCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public List<BookingItemData> Items { get; set; } = new();
}

public class BookingItemData
{
    public string TourName { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string PricingLabel { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendBookingConfirmationAsync(BookingConfirmationData data)
    {
        var subject = $"✅ Reserva confirmada — {data.ConfirmationCode} | Mémoire Nomade";
        var htmlContent = BuildConfirmationEmailHtml(data);

        await SendEmailAsync(data.CustomerEmail, data.CustomerName, subject, htmlContent);
    }

    public async Task SendNewBookingNotificationAsync(BookingConfirmationData data)
    {
        var adminEmail = _configuration["SendGrid:AdminEmail"] ?? "admin@memoirenomade.com";
        var subject = $"🔔 Nueva reserva — {data.ConfirmationCode}";
        var htmlContent = BuildAdminNotificationHtml(data);

        await SendEmailAsync(adminEmail, "Mémoire Nomade Admin", subject, htmlContent);
    }

    private async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlContent)
    {
        var apiKey = _configuration["SendGrid:ApiKey"];
        var fromEmail = _configuration["SendGrid:FromEmail"] ?? "noreply@memoirenomade.com";
        var fromName = _configuration["SendGrid:FromName"] ?? "Mémoire Nomade";

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(toEmail, toName);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, string.Empty, htmlContent);

        var response = await client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("SendGrid error sending to {Email}: {StatusCode}", toEmail, response.StatusCode);
        }
        else
        {
            _logger.LogInformation("Email sent to {Email}: {Subject}", toEmail, subject);
        }
    }

    private string BuildConfirmationEmailHtml(BookingConfirmationData data)
    {
        var itemsHtml = string.Join("", data.Items.Select(item => $@"
            <tr>
                <td style='padding:12px 16px;border-bottom:1px solid #f0f0f0;'>
                    <strong style='color:#1a1a2e;'>{item.TourName}</strong><br/>
                    <span style='color:#888;font-size:13px;'>
                        📅 {item.Date} · ⏰ {item.Time}
                    </span><br/>
                    <span style='color:#888;font-size:13px;'>{item.PricingLabel}</span>
                </td>
                <td style='padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;'>
                    <strong style='color:#c9a84c;'>{item.Subtotal:F2} €</strong>
                </td>
            </tr>
        "));

        return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'/></head>
<body style='margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;'>
    <div style='max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);'>

        <!-- Header -->
        <div style='background:#1a1a2e;padding:32px;text-align:center;'>
            <h1 style='color:#c9a84c;margin:0;font-size:24px;letter-spacing:1px;'>Mémoire Nomade</h1>
            <p style='color:#888;margin:8px 0 0;font-size:13px;'>Tours exclusivos en París</p>
        </div>

        <!-- Confirmation badge -->
        <div style='background:#f0fdf4;padding:24px;text-align:center;border-bottom:1px solid #dcfce7;'>
            <div style='font-size:40px;margin-bottom:8px;'>✅</div>
            <h2 style='color:#166534;margin:0;font-size:20px;'>¡Reserva confirmada!</h2>
            <p style='color:#166534;margin:8px 0 0;font-size:14px;'>
                Gracias, <strong>{data.CustomerName}</strong>. Tu experiencia en París está reservada.
            </p>
        </div>

        <!-- Confirmation code -->
        <div style='background:#1a1a2e;padding:20px;text-align:center;'>
            <p style='color:#888;margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:2px;'>
                Código de confirmación
            </p>
            <p style='color:#c9a84c;font-family:monospace;font-size:28px;font-weight:bold;
                      letter-spacing:4px;margin:0;'>
                {data.ConfirmationCode}
            </p>
            <p style='color:#666;margin:8px 0 0;font-size:12px;'>
                Guarda este código para consultar tu reserva.
            </p>
        </div>

        <!-- Items -->
        <div style='padding:24px 24px 0;'>
            <h3 style='color:#1a1a2e;margin:0 0 16px;font-size:16px;'>Tours reservados</h3>
            <table style='width:100%;border-collapse:collapse;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;'>
                {itemsHtml}
                <tr style='background:#fafafa;'>
                    <td style='padding:14px 16px;font-weight:bold;color:#1a1a2e;'>Total pagado</td>
                    <td style='padding:14px 16px;text-align:right;font-size:20px;font-weight:bold;color:#c9a84c;'>
                        {data.TotalAmount:F2} €
                    </td>
                </tr>
            </table>
        </div>

        <!-- Next steps -->
        <div style='margin:24px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;'>
            <p style='color:#92400e;font-weight:bold;margin:0 0 6px;font-size:14px;'>📧 Próximo paso</p>
            <p style='color:#92400e;margin:0;font-size:13px;line-height:1.5;'>
                Nos pondremos en contacto contigo para indicarte el punto de encuentro y
                todos los detalles de tu tour. Por favor, revisa también tu carpeta de spam.
            </p>
        </div>

        <!-- Cancellation policy -->
        <div style='margin:0 24px 24px;background:#f9fafb;border-radius:12px;padding:16px;'>
            <p style='color:#374151;font-weight:bold;margin:0 0 8px;font-size:14px;'>
                📋 Política de cancelaciones
            </p>
            <ul style='color:#6b7280;font-size:13px;margin:0;padding-left:20px;line-height:1.8;'>
                <li>Más de 30 días antes: reembolso del 70%</li>
                <li>Entre 15 y 30 días antes: reembolso del 50%</li>
                <li>Menos de 15 días antes: sin reembolso</li>
            </ul>
        </div>

        <!-- Contact -->
        <div style='background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f0f0f0;'>
            <p style='color:#888;font-size:13px;margin:0;'>
                ¿Preguntas? Escríbenos a
                <a href='mailto:info@memoirenomade.com' style='color:#c9a84c;'>
                    info@memoirenomade.com
                </a>
            </p>
        </div>

        <!-- Footer -->
        <div style='background:#1a1a2e;padding:16px;text-align:center;'>
            <p style='color:#555;font-size:12px;margin:0;'>
                © {DateTime.UtcNow.Year} Mémoire Nomade · París, Francia
            </p>
        </div>
    </div>
</body>
</html>";
    }

    private string BuildAdminNotificationHtml(BookingConfirmationData data)
    {
        var itemsHtml = string.Join("", data.Items.Select(item => $@"
            <li style='margin-bottom:6px;color:#374151;font-size:14px;'>
                <strong>{item.TourName}</strong> — {item.Date} {item.Time}
                ({item.PricingLabel}) — {item.Subtotal:F2} €
            </li>
        "));

        return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'/></head>
<body style='font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;'>
    <div style='max-width:500px;margin:0 auto;background:#fff;border-radius:12px;
                overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);'>
        <div style='background:#1a1a2e;padding:20px;'>
            <h2 style='color:#c9a84c;margin:0;font-size:18px;'>🔔 Nueva reserva recibida</h2>
        </div>
        <div style='padding:20px;'>
            <p style='color:#374151;font-size:14px;margin:0 0 16px;'>
                Se ha realizado una nueva reserva en Mémoire Nomade.
            </p>

            <table style='width:100%;font-size:14px;border-collapse:collapse;'>
                <tr>
                    <td style='padding:6px 0;color:#888;'>Código</td>
                    <td style='padding:6px 0;font-family:monospace;font-weight:bold;color:#c9a84c;'>
                        {data.ConfirmationCode}
                    </td>
                </tr>
                <tr>
                    <td style='padding:6px 0;color:#888;'>Cliente</td>
                    <td style='padding:6px 0;color:#1a1a2e;font-weight:bold;'>{data.CustomerName}</td>
                </tr>
                <tr>
                    <td style='padding:6px 0;color:#888;'>Email</td>
                    <td style='padding:6px 0;'>
                        <a href='mailto:{data.CustomerEmail}' style='color:#c9a84c;'>
                            {data.CustomerEmail}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td style='padding:6px 0;color:#888;'>Total</td>
                    <td style='padding:6px 0;font-weight:bold;font-size:16px;color:#c9a84c;'>
                        {data.TotalAmount:F2} €
                    </td>
                </tr>
            </table>

            <div style='margin-top:16px;background:#f9fafb;border-radius:8px;padding:14px;'>
                <p style='color:#374151;font-weight:bold;margin:0 0 8px;font-size:13px;'>Tours:</p>
                <ul style='margin:0;padding-left:20px;'>
                    {itemsHtml}
                </ul>
            </div>

            <a href='http://localhost:5173/admin/bookings'
               style='display:block;margin-top:16px;background:#c9a84c;color:#1a1a2e;
                      text-align:center;padding:12px;border-radius:8px;
                      font-weight:bold;text-decoration:none;font-size:14px;'>
                Ver reserva en el panel
            </a>
        </div>
    </div>
</body>
</html>";
    }
}