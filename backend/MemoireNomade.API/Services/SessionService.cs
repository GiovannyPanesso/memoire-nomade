using Microsoft.EntityFrameworkCore;
using MemoireNomade.API.Data;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Models;

namespace MemoireNomade.API.Services
{
    public interface ISessionService
    {
        // Públicos
        Task<List<SessionSummaryDto>> GetAvailableSessionsByTourAsync(int tourId);

        // Admin
        Task<List<SessionSummaryDto>> GetAllSessionsAsync(int? tourId, string? status);
        Task<SessionSummaryDto?> GetSessionByIdAsync(int id);
        Task<(bool Success, string ErrorMessage, SessionSummaryDto? Session)> CreateSessionAsync(CreateSessionDto dto);
        Task<(bool Success, string ErrorMessage, SessionSummaryDto? Session)> UpdateSessionAsync(int id, UpdateSessionDto dto);
        Task<(bool Success, string ErrorMessage)> DeleteSessionAsync(int id);
        Task<(bool Success, string ErrorMessage)> UpdateSessionStatusAsync(int id, string newStatus, string changedBy, string? notes);
        Task MarkCompletedSessionsAsync(); // Ejecutado automáticamente
    }

    public class SessionService : ISessionService
    {
        private readonly AppDbContext _context;

        public SessionService(AppDbContext context)
        {
            _context = context;
        }

        // ── Endpoints públicos ────────────────────────────────────────────────

        public async Task<List<SessionSummaryDto>> GetAvailableSessionsByTourAsync(int tourId)
        {
            // Solo sesiones activas con plazas disponibles y fecha futura
            return await _context.Sessions
                .Include(s => s.Tour)
                .Include(s => s.Pricings)
                .Where(s =>
                    s.TourId == tourId &&
                    s.Status == "Activa" &&
                    s.AvailableSpots > 0 &&
                    s.Date >= DateOnly.FromDateTime(DateTime.UtcNow))
                .OrderBy(s => s.Date)
                .ThenBy(s => s.Time)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        // ── Endpoints admin ───────────────────────────────────────────────────

        public async Task<List<SessionSummaryDto>> GetAllSessionsAsync(int? tourId, string? status)
        {
            var query = _context.Sessions
                .Include(s => s.Tour)
                .Include(s => s.Pricings)
                .AsQueryable();

            if (tourId.HasValue)
                query = query.Where(s => s.TourId == tourId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status == status);

            return await query
                .OrderByDescending(s => s.Date)
                .ThenBy(s => s.Time)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        public async Task<SessionSummaryDto?> GetSessionByIdAsync(int id)
        {
            var session = await _context.Sessions
                .Include(s => s.Tour)
                .Include(s => s.Pricings)
                .FirstOrDefaultAsync(s => s.Id == id);

            return session == null ? null : MapToDto(session);
        }

        public async Task<(bool Success, string ErrorMessage, SessionSummaryDto? Session)> CreateSessionAsync(CreateSessionDto dto)
        {
            // Verificar que el tour existe
            var tourExists = await _context.Tours.AnyAsync(t => t.Id == dto.TourId && t.IsActive);
            if (!tourExists)
                return (false, "Tour no encontrado o inactivo.", null);

            // Verificar que la fecha no es pasada
            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                return (false, "No se puede crear una sesión con fecha pasada.", null);

            var session = new Session
            {
                TourId = dto.TourId,
                Date = dto.Date,
                Time = dto.Time,
                AvailableSpots = dto.AvailableSpots,
                IncludesSeineCruise = dto.IncludesSeineCruise,
                Status = "Activa",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Añadir tarifas
            foreach (var pricingDto in dto.Pricings)
            {
                session.Pricings.Add(new SessionPricing
                {
                    Label = pricingDto.Label,
                    Price = pricingDto.Price,
                    Type = pricingDto.Type,
                    MinPersons = pricingDto.MinPersons,
                    MaxPersons = pricingDto.MaxPersons
                });
            }

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();

            // Recargar con relaciones para devolver DTO completo
            await _context.Entry(session).Reference(s => s.Tour).LoadAsync();

            return (true, string.Empty, MapToDto(session));
        }

        public async Task<(bool Success, string ErrorMessage, SessionSummaryDto? Session)> UpdateSessionAsync(int id, UpdateSessionDto dto)
        {
            var session = await _context.Sessions
                .Include(s => s.Tour)
                .Include(s => s.Pricings)
                .Include(s => s.BookingItems)
                    .ThenInclude(bi => bi.Booking)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
                return (false, "Sesión no encontrada.", null);

            // Regla: no editar si tiene reservas activas
            var hasActiveBookings = session.BookingItems.Any(bi =>
                bi.Booking.Status == "Pendiente" ||
                bi.Booking.Status == "Confirmada");

            if (hasActiveBookings)
                return (false, "No se puede editar una sesión con reservas activas.", null);

            session.Date = dto.Date;
            session.Time = dto.Time;
            session.AvailableSpots = dto.AvailableSpots;
            session.IncludesSeineCruise = dto.IncludesSeineCruise;
            session.UpdatedAt = DateTime.UtcNow;

            // Reemplazar tarifas completamente
            _context.SessionPricings.RemoveRange(session.Pricings);
            session.Pricings.Clear();

            foreach (var pricingDto in dto.Pricings)
            {
                session.Pricings.Add(new SessionPricing
                {
                    SessionId = session.Id,
                    Label = pricingDto.Label,
                    Price = pricingDto.Price,
                    Type = pricingDto.Type,
                    MinPersons = pricingDto.MinPersons,
                    MaxPersons = pricingDto.MaxPersons
                });
            }

            await _context.SaveChangesAsync();

            return (true, string.Empty, MapToDto(session));
        }

        public async Task<(bool Success, string ErrorMessage)> DeleteSessionAsync(int id)
        {
            var session = await _context.Sessions
                .Include(s => s.BookingItems)
                    .ThenInclude(bi => bi.Booking)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
                return (false, "Sesión no encontrada.");

            // Regla crítica: no eliminar con reservas pendientes o confirmadas
            var hasActiveBookings = session.BookingItems.Any(bi =>
                bi.Booking.Status == "Pendiente" ||
                bi.Booking.Status == "Confirmada");

            if (hasActiveBookings)
                return (false, "No se puede eliminar una sesión con reservas pendientes o confirmadas.");

            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<(bool Success, string ErrorMessage)> UpdateSessionStatusAsync(
            int id, string newStatus, string changedBy, string? notes)
        {
            var validStatuses = new[] { "Activa", "Completada", "Cancelada" };
            if (!validStatuses.Contains(newStatus))
                return (false, "Estado no válido. Use: Activa, Completada o Cancelada.");

            var session = await _context.Sessions
                .Include(s => s.BookingItems)
                    .ThenInclude(bi => bi.Booking)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
                return (false, "Sesión no encontrada.");

            var previousStatus = session.Status;
            session.Status = newStatus;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (true, string.Empty);
        }

        // Marca automáticamente como "Completada" las sesiones cuya fecha/hora ya pasó
        public async Task MarkCompletedSessionsAsync()
        {
            var now = DateTime.UtcNow;
            var today = DateOnly.FromDateTime(now);
            var currentTime = TimeOnly.FromDateTime(now);

            var sessionsToComplete = await _context.Sessions
                .Where(s =>
                    s.Status == "Activa" &&
                    (s.Date < today || (s.Date == today && s.Time < currentTime)))
                .ToListAsync();

            foreach (var session in sessionsToComplete)
            {
                session.Status = "Completada";
                session.UpdatedAt = DateTime.UtcNow;
            }

            if (sessionsToComplete.Any())
                await _context.SaveChangesAsync();
        }

        // ── Mapper privado ────────────────────────────────────────────────────

        private static SessionSummaryDto MapToDto(Session s) => new()
        {
            Id = s.Id,
            TourId = s.TourId,
            TourName = s.Tour?.Name ?? string.Empty,
            Date = s.Date,
            Time = s.Time,
            AvailableSpots = s.AvailableSpots,
            IncludesSeineCruise = s.IncludesSeineCruise,
            Status = s.Status,
            Pricings = s.Pricings?.Select(p => new SessionPricingDto
            {
                Id = p.Id,
                Label = p.Label,
                Price = p.Price,
                Type = p.Type,
                MinPersons = p.MinPersons,
                MaxPersons = p.MaxPersons
            }).ToList() ?? new()
        };
    }
}