using Microsoft.EntityFrameworkCore;
using MemoireNomade.API.Data;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Models;

namespace MemoireNomade.API.Services
{
    public interface IContactService
    {
        // Público
        Task<bool> CreateMessageAsync(CreateContactMessageDto dto);

        // Admin
        Task<List<ContactMessageDto>> GetAllMessagesAsync(bool? isRead);
        Task<ContactMessageDto?> GetMessageByIdAsync(int id);
        Task<bool> ToggleReadAsync(int id);
        Task<bool> DeleteMessageAsync(int id);
    }

    public class ContactService : IContactService
    {
        private readonly AppDbContext _context;

        public ContactService(AppDbContext context)
        {
            _context = context;
        }

        // ── Público ───────────────────────────────────────────────────────────

        public async Task<bool> CreateMessageAsync(CreateContactMessageDto dto)
        {
            var message = new ContactMessage
            {
                Name = dto.Name,
                Email = dto.Email,
                Message = dto.Message,
                IsRead = false,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactMessages.Add(message);
            await _context.SaveChangesAsync();

            return true;
        }

        // ── Admin ─────────────────────────────────────────────────────────────

        public async Task<List<ContactMessageDto>> GetAllMessagesAsync(bool? isRead)
        {
            var query = _context.ContactMessages
                .Where(m => !m.IsDeleted)
                .AsQueryable();

            if (isRead.HasValue)
                query = query.Where(m => m.IsRead == isRead.Value);

            return await query
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => MapToDto(m))
                .ToListAsync();
        }

        public async Task<ContactMessageDto?> GetMessageByIdAsync(int id)
        {
            var message = await _context.ContactMessages
                .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);

            return message == null ? null : MapToDto(message);
        }

        public async Task<bool> ToggleReadAsync(int id)
        {
            var message = await _context.ContactMessages
                .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);

            if (message == null) return false;

            message.IsRead = !message.IsRead;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteMessageAsync(int id)
        {
            var message = await _context.ContactMessages
                .FirstOrDefaultAsync(m => m.Id == id);

            if (message == null) return false;

            // Borrado lógico (no eliminamos el registro de la BD)
            message.IsDeleted = true;
            await _context.SaveChangesAsync();

            return true;
        }

        // ── Mapper ────────────────────────────────────────────────────────────

        private static ContactMessageDto MapToDto(ContactMessage m) => new()
        {
            Id = m.Id,
            Name = m.Name,
            Email = m.Email,
            Message = m.Message,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt
        };
    }
}