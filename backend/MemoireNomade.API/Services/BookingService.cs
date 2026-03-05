using Microsoft.EntityFrameworkCore;
using MemoireNomade.API.Data;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Models;

namespace MemoireNomade.API.Services
{
    public interface IBookingService
    {
        // Públicos
        Task<BookingDetailDto?> GetBookingByConfirmationCodeAsync(string confirmationCode);
        Task<(bool Success, string ErrorMessage, BookingDetailDto? Booking)> CreateBookingAsync(CreateBookingDto dto);

        // Admin
        Task<List<BookingSummaryDto>> GetAllBookingsAsync(string? status, int? tourId, DateTime? from, DateTime? to);
        Task<BookingDetailDto?> GetBookingByIdAsync(int id);
        Task<(bool Success, string ErrorMessage, BookingDetailDto? Booking)> CreateManualBookingAsync(CreateManualBookingDto dto, string adminEmail);
        Task<(bool Success, string ErrorMessage)> UpdateBookingAsync(int id, UpdateBookingDto dto, string adminEmail);
        Task ConfirmBookingAsync(int bookingId, string paymentIntentId, string paymentMethod);
    }

    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        // ── Públicos ──────────────────────────────────────────────────────────

        public async Task<BookingDetailDto?> GetBookingByConfirmationCodeAsync(string confirmationCode)
        {
            var booking = await GetBookingQueryable()
                .FirstOrDefaultAsync(b => b.ConfirmationCode == confirmationCode);

            return booking == null ? null : MapToDetailDto(booking);
        }

        public async Task<(bool Success, string ErrorMessage, BookingDetailDto? Booking)> CreateBookingAsync(CreateBookingDto dto)
        {
            return await CreateBookingInternalAsync(
                dto.Customer,
                dto.Items,
                "Pendiente",
                null,
                "Sistema");
        }

        // ── Admin ─────────────────────────────────────────────────────────────

        public async Task<List<BookingSummaryDto>> GetAllBookingsAsync(
            string? status, int? tourId, DateTime? from, DateTime? to)
        {
            var query = _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Items)
                    .ThenInclude(bi => bi.Session)
                        .ThenInclude(s => s.Tour)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(b => b.Status == status);

            if (tourId.HasValue)
                query = query.Where(b =>
                    b.Items.Any(bi => bi.Session.TourId == tourId.Value));

            if (from.HasValue)
                query = query.Where(b => b.BookingDate >= from.Value);

            if (to.HasValue)
                query = query.Where(b => b.BookingDate <= to.Value);

            return await query
                .OrderByDescending(b => b.BookingDate)
                .Select(b => MapToSummaryDto(b))
                .ToListAsync();
        }

        public async Task<BookingDetailDto?> GetBookingByIdAsync(int id)
        {
            var booking = await GetBookingQueryable()
                .FirstOrDefaultAsync(b => b.Id == id);

            return booking == null ? null : MapToDetailDto(booking);
        }

        public async Task<(bool Success, string ErrorMessage, BookingDetailDto? Booking)> CreateManualBookingAsync(
            CreateManualBookingDto dto, string adminEmail)
        {
            return await CreateBookingInternalAsync(
                dto.Customer,
                dto.Items,
                dto.Status,
                dto.Notes,
                adminEmail);
        }

        public async Task<(bool Success, string ErrorMessage)> UpdateBookingAsync(
            int id, UpdateBookingDto dto, string adminEmail)
        {
            var booking = await GetBookingQueryable()
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return (false, "Reserva no encontrada.");

            var previousStatus = booking.Status;

            if (!string.IsNullOrEmpty(dto.Notes))
                booking.Notes = dto.Notes;

            if (!string.IsNullOrEmpty(dto.Status) && dto.Status != previousStatus)
            {
                booking.Status = dto.Status;
                booking.StatusHistory.Add(new BookingStatusHistory
                {
                    BookingId = booking.Id,
                    PreviousStatus = previousStatus,
                    NewStatus = dto.Status,
                    ChangedAt = DateTime.UtcNow,
                    ChangedBy = adminEmail
                });
            }

            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task ConfirmBookingAsync(int bookingId, string paymentIntentId, string paymentMethod)
        {
            var booking = await GetBookingQueryable()
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return;

            var previousStatus = booking.Status;
            booking.Status = "Confirmada";
            booking.UpdatedAt = DateTime.UtcNow;

            if (paymentMethod == "Stripe")
                booking.StripePaymentIntentId = paymentIntentId;
            else
                booking.PaypalOrderId = paymentIntentId;

            // Registrar cambio de estado
            booking.StatusHistory.Add(new BookingStatusHistory
            {
                BookingId = booking.Id,
                PreviousStatus = previousStatus,
                NewStatus = "Confirmada",
                ChangedAt = DateTime.UtcNow,
                ChangedBy = "Sistema"
            });

            // Descontar plazas de cada sesión
            foreach (var item in booking.Items)
            {
                var session = await _context.Sessions.FindAsync(item.SessionId);
                if (session != null)
                {
                    session.AvailableSpots = Math.Max(0, session.AvailableSpots - item.NumAdults - item.NumChildren);
                }
            }

            await _context.SaveChangesAsync();
        }

        // ── Lógica interna compartida ─────────────────────────────────────────

        private async Task<(bool Success, string ErrorMessage, BookingDetailDto? Booking)> CreateBookingInternalAsync(
            CreateCustomerDto customerDto,
            List<CreateBookingItemDto> itemDtos,
            string initialStatus,
            string? notes,
            string createdBy)
        {
            // Buscar o crear cliente por email
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == customerDto.Email);

            if (customer == null)
            {
                customer = new Customer
                {
                    Name = customerDto.Name,
                    Email = customerDto.Email,
                    Phone = customerDto.Phone,
                    Country = customerDto.Country,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            // Validar ítems y calcular total
            decimal totalAmount = 0;
            var bookingItems = new List<BookingItem>();

            foreach (var itemDto in itemDtos)
            {
                var session = await _context.Sessions
                    .Include(s => s.Tour)
                    .FirstOrDefaultAsync(s => s.Id == itemDto.SessionId && s.Status == "Activa");

                if (session == null)
                    return (false, $"La sesión {itemDto.SessionId} no está disponible.", null);

                var pricing = await _context.SessionPricings
                    .FirstOrDefaultAsync(p =>
                        p.Id == itemDto.SessionPricingId &&
                        p.SessionId == itemDto.SessionId);

                if (pricing == null)
                    return (false, $"La tarifa {itemDto.SessionPricingId} no es válida para esta sesión.", null);

                // Calcular subtotal
                var subtotal = pricing.Price +
                    (itemDto.NumChildren * 0); // El precio de niños se calcula según tarifa child

                // Si hay tarifa infantil separada, buscarla
                if (itemDto.NumChildren > 0)
                {
                    var childPricing = await _context.SessionPricings
                        .FirstOrDefaultAsync(p =>
                            p.SessionId == itemDto.SessionId &&
                            p.Type == "child");

                    if (childPricing != null)
                        subtotal += childPricing.Price * itemDto.NumChildren;
                }

                totalAmount += subtotal;

                bookingItems.Add(new BookingItem
                {
                    SessionId = itemDto.SessionId,
                    SessionPricingId = itemDto.SessionPricingId,
                    NumAdults = itemDto.NumAdults,
                    NumChildren = itemDto.NumChildren,
                    Subtotal = subtotal
                });
            }

            // Generar código de confirmación único
            var confirmationCode = await GenerateConfirmationCodeAsync();

            var booking = new Booking
            {
                ConfirmationCode = confirmationCode,
                CustomerId = customer.Id,
                TotalAmount = totalAmount,
                Status = initialStatus,
                BookingDate = DateTime.UtcNow,
                Notes = notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = bookingItems
            };

            // Historial de estado inicial
            booking.StatusHistory.Add(new BookingStatusHistory
            {
                PreviousStatus = null,
                NewStatus = initialStatus,
                ChangedAt = DateTime.UtcNow,
                ChangedBy = createdBy
            });

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var result = await GetBookingByIdAsync(booking.Id);
            return (true, string.Empty, result);
        }

        // Genera código formato MN-2026-00142
        private async Task<string> GenerateConfirmationCodeAsync()
        {
            var year = DateTime.UtcNow.Year;

            // Contar reservas del año actual
            var countThisYear = await _context.Bookings
                .CountAsync(b => b.BookingDate.Year == year);

            var sequential = countThisYear + 1;
            return $"MN-{year}-{sequential:D5}";
        }

        // ── Query base con todas las relaciones ───────────────────────────────

        private IQueryable<Booking> GetBookingQueryable()
        {
            return _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Items)
                    .ThenInclude(bi => bi.Session)
                        .ThenInclude(s => s.Tour)
                .Include(b => b.Items)
                    .ThenInclude(bi => bi.SessionPricing)
                .Include(b => b.StatusHistory.OrderBy(h => h.ChangedAt))
                .Include(b => b.Payments);
        }

        // ── Mappers ───────────────────────────────────────────────────────────

        private static BookingSummaryDto MapToSummaryDto(Booking b) => new()
        {
            Id = b.Id,
            ConfirmationCode = b.ConfirmationCode,
            CustomerName = b.Customer.Name,
            CustomerEmail = b.Customer.Email,
            TotalAmount = b.TotalAmount,
            Status = b.Status,
            BookingDate = b.BookingDate,
            Items = b.Items.Select(i => new BookingItemSummaryDto
            {
                Id = i.Id,
                TourName = i.Session.Tour.Name,
                SessionDate = i.Session.Date,
                SessionTime = i.Session.Time,
                NumAdults = i.NumAdults,
                NumChildren = i.NumChildren,
                Subtotal = i.Subtotal
            }).ToList()
        };

        private static BookingDetailDto MapToDetailDto(Booking b) => new()
        {
            Id = b.Id,
            ConfirmationCode = b.ConfirmationCode,
            Customer = new CustomerDto
            {
                Id = b.Customer.Id,
                Name = b.Customer.Name,
                Email = b.Customer.Email,
                Phone = b.Customer.Phone,
                Country = b.Customer.Country
            },
            TotalAmount = b.TotalAmount,
            Status = b.Status,
            BookingDate = b.BookingDate,
            StripePaymentIntentId = b.StripePaymentIntentId,
            PaypalOrderId = b.PaypalOrderId,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            Items = b.Items.Select(i => new BookingItemDetailDto
            {
                Id = i.Id,
                SessionId = i.SessionId,
                TourName = i.Session.Tour.Name,
                SessionDate = i.Session.Date,
                SessionTime = i.Session.Time,
                IncludesSeineCruise = i.Session.IncludesSeineCruise,
                PricingLabel = i.SessionPricing.Label,
                PricingPrice = i.SessionPricing.Price,
                NumAdults = i.NumAdults,
                NumChildren = i.NumChildren,
                Subtotal = i.Subtotal
            }).ToList(),
            StatusHistory = b.StatusHistory.Select(h => new BookingStatusHistoryDto
            {
                PreviousStatus = h.PreviousStatus ?? string.Empty,
                NewStatus = h.NewStatus,
                ChangedAt = h.ChangedAt,
                ChangedBy = h.ChangedBy,
                Notes = h.Notes
            }).ToList(),
            Payments = b.Payments.Select(p => new PaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                RefundAmount = p.RefundAmount,
                RefundDate = p.RefundDate,
                CreatedAt = p.CreatedAt
            }).ToList()
        };
    }
}