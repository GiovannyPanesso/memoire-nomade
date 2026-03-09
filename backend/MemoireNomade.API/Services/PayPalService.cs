using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using PayPalCheckoutSdk.Payments;
using PayPalHttp;

namespace MemoireNomade.API.Services;

public interface IPayPalService
{
    Task<string> CreateOrderAsync(decimal amount, string currency, int bookingId, string confirmationCode);
    Task<bool> CaptureOrderAsync(string orderId);
    Task<bool> RefundCaptureAsync(string captureId, decimal amount);
}

public class PayPalService : IPayPalService
{
    private readonly PayPalHttpClient _client;
    private readonly ILogger<PayPalService> _logger;

    public PayPalService(IConfiguration configuration, ILogger<PayPalService> logger)
    {
        _logger = logger;
        var clientId = configuration["PayPal:ClientId"]!;
        var clientSecret = configuration["PayPal:ClientSecret"]!;
        var mode = configuration["PayPal:Mode"] ?? "sandbox";

        PayPalEnvironment environment = mode == "live"
            ? new LiveEnvironment(clientId, clientSecret)
            : new SandboxEnvironment(clientId, clientSecret);

        _client = new PayPalHttpClient(environment);
    }

    public async Task<string> CreateOrderAsync(
        decimal amount, string currency, int bookingId, string confirmationCode)
    {
        var orderRequest = new OrdersCreateRequest();
        orderRequest.Prefer("return=representation");
        orderRequest.RequestBody(new OrderRequest
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>
            {
                new PurchaseUnitRequest
                {
                    AmountWithBreakdown = new AmountWithBreakdown
                    {
                        CurrencyCode = currency.ToUpper(),
                        Value = amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)
                    },
                    Description = $"Mémoire Nomade — Reserva {confirmationCode}",
                    CustomId = $"{bookingId}|{confirmationCode}"
                }
            },
            ApplicationContext = new ApplicationContext
            {
                BrandName = "Mémoire Nomade",
                LandingPage = "NO_PREFERENCE",
                UserAction = "PAY_NOW",
                ReturnUrl = "http://localhost:5173/checkout/paypal-return",
                CancelUrl = "http://localhost:5173/checkout/paypal-cancel"
            }
        });

        try
        {
            var response = await _client.Execute(orderRequest);
            var order = response.Result<Order>();
            return order.Id;
        }
        catch (HttpException ex)
        {
            _logger.LogError("PayPal error: {StatusCode} {Message}", ex.StatusCode, ex.Message);
            throw;
        }

        
    }

    public async Task<bool> CaptureOrderAsync(string orderId)
    {
        var request = new OrdersCaptureRequest(orderId);
        request.RequestBody(new OrderActionRequest());

        try
        {
            var response = await _client.Execute(request);
            var order = response.Result<Order>();
            return order.Status == "COMPLETED";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error capturing PayPal order {OrderId}", orderId);
            return false;
        }
    }

    public async Task<bool> RefundCaptureAsync(string captureId, decimal amount)
    {
        var request = new CapturesRefundRequest(captureId);
        request.RequestBody(new RefundRequest
        {
            Amount = new PayPalCheckoutSdk.Payments.Money
            {
                CurrencyCode = "EUR",
                Value = amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)
            }
        });

        try
        {
            await _client.Execute(request);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding PayPal capture {CaptureId}", captureId);
            return false;
        }
    }
}