using Stripe;
using Stripe.Checkout;

namespace MemoireNomade.API.Services;

public interface IStripeService
{
    Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string currency, int bookingId, string confirmationCode);
    Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId);
    Task<Refund> CreateRefundAsync(string paymentIntentId, decimal amount);
}

public class StripeService : IStripeService
{
    public StripeService(IConfiguration configuration)
    {
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
    }

    public async Task<PaymentIntent> CreatePaymentIntentAsync(
        decimal amount, string currency, int bookingId, string confirmationCode)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100), // Stripe trabaja en céntimos
            Currency = currency.ToLower(),
            Metadata = new Dictionary<string, string>
            {
                { "bookingId", bookingId.ToString() },
                { "confirmationCode", confirmationCode }
            },
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
        };

        var service = new PaymentIntentService();
        return await service.CreateAsync(options);
    }

    public async Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId)
    {
        var service = new PaymentIntentService();
        return await service.GetAsync(paymentIntentId);
    }

    public async Task<Refund> CreateRefundAsync(string paymentIntentId, decimal amount)
    {
        var options = new RefundCreateOptions
        {
            PaymentIntent = paymentIntentId,
            Amount = (long)(amount * 100),
        };

        var service = new RefundService();
        return await service.CreateAsync(options);
    }
}