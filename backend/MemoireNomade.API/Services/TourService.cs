using Microsoft.EntityFrameworkCore;
using MemoireNomade.API.Data;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Models;

namespace MemoireNomade.API.Services
{
    public interface ITourService
    {
        // Públicos
        Task<List<TourSummaryDto>> GetActiveToursAsync();
        Task<List<TourSummaryDto>> GetFeaturedToursAsync();
        Task<TourDetailDto?> GetTourByIdAsync(int id);

        // Admin
        Task<List<TourSummaryDto>> GetAllToursAsync();
        Task<TourDetailDto> CreateTourAsync(CreateTourDto dto);
        Task<TourDetailDto?> UpdateTourAsync(int id, UpdateTourDto dto);
        Task<(bool Success, string ErrorMessage)> DeleteTourAsync(int id);
        Task<(bool Success, string ErrorMessage)> ToggleFeaturedAsync(int id);
        Task<TourImageDto?> AddTourImageAsync(int tourId, string imageUrl, int order);
        Task<bool> DeleteTourImageAsync(int tourId, int imageId);
    }

    public class TourService : ITourService
    {
        private readonly AppDbContext _context;
        private const int MaxFeaturedTours = 3;
        private const int MaxGalleryImages = 10;

        public TourService(AppDbContext context)
        {
            _context = context;
        }

        // ── Endpoints públicos ────────────────────────────────────────────────

        public async Task<List<TourSummaryDto>> GetActiveToursAsync()
        {
            return await _context.Tours
                .Where(t => t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => MapToSummaryDto(t))
                .ToListAsync();
        }

        public async Task<List<TourSummaryDto>> GetFeaturedToursAsync()
        {
            return await _context.Tours
                .Where(t => t.IsActive && t.IsFeatured)
                .OrderBy(t => t.Name)
                .Take(MaxFeaturedTours)
                .Select(t => MapToSummaryDto(t))
                .ToListAsync();
        }

        public async Task<TourDetailDto?> GetTourByIdAsync(int id)
        {
            var tour = await _context.Tours
                .Include(t => t.Images.OrderBy(i => i.Order))
                .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);

            return tour == null ? null : MapToDetailDto(tour);
        }

        // ── Endpoints admin ───────────────────────────────────────────────────

        public async Task<List<TourSummaryDto>> GetAllToursAsync()
        {
            return await _context.Tours
                .Include(t => t.Sessions)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToSummaryDto(t))
                .ToListAsync();
        }

        public async Task<TourDetailDto> CreateTourAsync(CreateTourDto dto)
        {
            // Regla: máximo 3 destacados simultáneamente
            if (dto.IsFeatured)
            {
                var featuredCount = await _context.Tours.CountAsync(t => t.IsFeatured);
                if (featuredCount >= MaxFeaturedTours)
                    dto.IsFeatured = false; // Ignorar destacado si ya hay 3
            }

            var tour = new Tour
            {
                Name = dto.Name,
                Description = dto.Description,
                Includes = dto.Includes,
                NotIncludes = dto.NotIncludes,
                IsActive = dto.IsActive,
                IsFeatured = dto.IsFeatured,
                MainImageUrl = dto.MainImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();

            return MapToDetailDto(tour);
        }

        public async Task<TourDetailDto?> UpdateTourAsync(int id, UpdateTourDto dto)
        {
            var tour = await _context.Tours
                .Include(t => t.Images)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tour == null) return null;

            // Regla: máximo 3 destacados simultáneamente
            if (dto.IsFeatured && !tour.IsFeatured)
            {
                var featuredCount = await _context.Tours
                    .CountAsync(t => t.IsFeatured && t.Id != id);
                if (featuredCount >= MaxFeaturedTours)
                    dto.IsFeatured = false;
            }

            tour.Name = dto.Name;
            tour.Description = dto.Description;
            tour.Includes = dto.Includes;
            tour.NotIncludes = dto.NotIncludes;
            tour.IsActive = dto.IsActive;
            tour.IsFeatured = dto.IsFeatured;
            tour.MainImageUrl = dto.MainImageUrl;
            tour.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDetailDto(tour);
        }

        public async Task<(bool Success, string ErrorMessage)> DeleteTourAsync(int id)
        {
            var tour = await _context.Tours
                .Include(t => t.Sessions)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tour == null)
                return (false, "Tour no encontrado.");

            // Regla crítica: no eliminar si tiene sesiones
            if (tour.Sessions.Any())
                return (false, "No se puede eliminar un tour que tiene sesiones asociadas.");

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<(bool Success, string ErrorMessage)> ToggleFeaturedAsync(int id)
        {
            var tour = await _context.Tours.FindAsync(id);

            if (tour == null)
                return (false, "Tour no encontrado.");

            if (!tour.IsFeatured)
            {
                // Intentar marcar como destacado
                var featuredCount = await _context.Tours
                    .CountAsync(t => t.IsFeatured && t.Id != id);

                if (featuredCount >= MaxFeaturedTours)
                    return (false, $"Ya hay {MaxFeaturedTours} tours destacados. Desmarca uno antes.");

                tour.IsFeatured = true;
            }
            else
            {
                tour.IsFeatured = false;
            }

            tour.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<TourImageDto?> AddTourImageAsync(int tourId, string imageUrl, int order)
        {
            var tour = await _context.Tours
                .Include(t => t.Images)
                .FirstOrDefaultAsync(t => t.Id == tourId);

            if (tour == null) return null;

            // Regla: máximo 10 imágenes en galería
            if (tour.Images.Count >= MaxGalleryImages)
                return null;

            var image = new TourImage
            {
                TourId = tourId,
                ImageUrl = imageUrl,
                Order = order,
                CreatedAt = DateTime.UtcNow
            };

            _context.TourImages.Add(image);
            await _context.SaveChangesAsync();

            return new TourImageDto
            {
                Id = image.Id,
                ImageUrl = image.ImageUrl,
                Order = image.Order
            };
        }

        public async Task<bool> DeleteTourImageAsync(int tourId, int imageId)
        {
            var image = await _context.TourImages
                .FirstOrDefaultAsync(i => i.Id == imageId && i.TourId == tourId);

            if (image == null) return false;

            _context.TourImages.Remove(image);
            await _context.SaveChangesAsync();

            return true;
        }

        // ── Mappers privados ──────────────────────────────────────────────────

        private static TourSummaryDto MapToSummaryDto(Tour t) => new()
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description.Length > 200
                ? t.Description[..200] + "..."
                : t.Description,
            IsActive = t.IsActive,
            IsFeatured = t.IsFeatured,
            MainImageUrl = t.MainImageUrl,
            SessionCount = t.Sessions?.Count ?? 0,
            AvailableSpots = t.Sessions?
                .Where(s => s.Status == "Activa")
                .Sum(s => s.AvailableSpots) ?? 0
        };

        private static TourDetailDto MapToDetailDto(Tour t) => new()
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Includes = t.Includes,
            NotIncludes = t.NotIncludes,
            IsActive = t.IsActive,
            IsFeatured = t.IsFeatured,
            MainImageUrl = t.MainImageUrl,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            Images = t.Images?
                .OrderBy(i => i.Order)
                .Select(i => new TourImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    Order = i.Order
                }).ToList() ?? new()
        };
    }
}