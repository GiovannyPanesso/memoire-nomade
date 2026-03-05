using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoireNomade.API.Data;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/admin/dashboard
        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);

            // Reservas de hoy
            var bookingsToday = await _context.Bookings
                .CountAsync(b => b.BookingDate.Date == today);

            // Ingresos del mes (solo reservas confirmadas o completadas)
            var revenueThisMonth = await _context.Bookings
                .Where(b =>
                    b.BookingDate >= firstDayOfMonth &&
                    (b.Status == "Confirmada" || b.Status == "Completada"))
                .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

            // Tours activos
            var activeTours = await _context.Tours
                .CountAsync(t => t.IsActive);

            // Mensajes sin leer
            var unreadMessages = await _context.ContactMessages
                .CountAsync(m => !m.IsRead && !m.IsDeleted);

            // Últimas 5 reservas
            var recentBookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Items)
                    .ThenInclude(bi => bi.Session)
                        .ThenInclude(s => s.Tour)
                .OrderByDescending(b => b.BookingDate)
                .Take(5)
                .Select(b => new
                {
                    b.Id,
                    b.ConfirmationCode,
                    CustomerName = b.Customer.Name,
                    b.TotalAmount,
                    b.Status,
                    b.BookingDate,
                    Tours = b.Items.Select(i => i.Session.Tour.Name).Distinct()
                })
                .ToListAsync();

            // Sesiones próximas (próximos 7 días)
            var today2 = DateOnly.FromDateTime(now);
            var nextWeek = today2.AddDays(7);

            var upcomingSessions = await _context.Sessions
                .Include(s => s.Tour)
                .Where(s =>
                    s.Status == "Activa" &&
                    s.Date >= today2 &&
                    s.Date <= nextWeek)
                .OrderBy(s => s.Date)
                .ThenBy(s => s.Time)
                .Select(s => new
                {
                    s.Id,
                    TourName = s.Tour.Name,
                    s.Date,
                    s.Time,
                    s.AvailableSpots,
                    s.IncludesSeineCruise
                })
                .ToListAsync();

            return Ok(new
            {
                metrics = new
                {
                    bookingsToday,
                    revenueThisMonth,
                    activeTours,
                    unreadMessages
                },
                recentBookings,
                upcomingSessions
            });
        }
    }
}