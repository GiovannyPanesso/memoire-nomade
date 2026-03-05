using Microsoft.EntityFrameworkCore;
using MemoireNomade.API.Models;
using Microsoft.AspNetCore.Identity;

namespace MemoireNomade.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Tablas
        public DbSet<Tour> Tours { get; set; }
        public DbSet<TourImage> TourImages { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<SessionPricing> SessionPricings { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingItem> BookingItems { get; set; }
        public DbSet<BookingStatusHistory> BookingStatusHistories { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<AdminUser> AdminUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Tour ──────────────────────────────────────────────
            modelBuilder.Entity<Tour>(entity =>
            {
                entity.HasIndex(t => t.Name).IsUnique();
                entity.Property(t => t.CreatedAt).ValueGeneratedOnAdd();
            });

            // ── TourImage ─────────────────────────────────────────
            modelBuilder.Entity<TourImage>(entity =>
            {
                entity.HasOne(ti => ti.Tour)
                      .WithMany(t => t.Images)
                      .HasForeignKey(ti => ti.TourId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Session ───────────────────────────────────────────
            modelBuilder.Entity<Session>(entity =>
            {
                entity.HasOne(s => s.Tour)
                      .WithMany(t => t.Sessions)
                      .HasForeignKey(s => s.TourId)
                      .OnDelete(DeleteBehavior.Restrict); // No eliminar tour con sesiones

                entity.Property(s => s.Status)
                      .HasDefaultValue("Activa");
            });

            // ── SessionPricing ────────────────────────────────────
            modelBuilder.Entity<SessionPricing>(entity =>
            {
                entity.HasOne(sp => sp.Session)
                      .WithMany(s => s.Pricings)
                      .HasForeignKey(sp => sp.SessionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Customer ──────────────────────────────────────────
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasIndex(c => c.Email); // Índice para búsquedas rápidas por email
            });

            // ── Booking ───────────────────────────────────────────
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasIndex(b => b.ConfirmationCode).IsUnique();

                entity.HasOne(b => b.Customer)
                      .WithMany(c => c.Bookings)
                      .HasForeignKey(b => b.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(b => b.Status)
                      .HasDefaultValue("Pendiente");
            });

            // ── BookingItem ───────────────────────────────────────
            modelBuilder.Entity<BookingItem>(entity =>
            {
                entity.HasOne(bi => bi.Booking)
                      .WithMany(b => b.Items)
                      .HasForeignKey(bi => bi.BookingId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(bi => bi.Session)
                      .WithMany(s => s.BookingItems)
                      .HasForeignKey(bi => bi.SessionId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(bi => bi.SessionPricing)
                      .WithMany(sp => sp.BookingItems)
                      .HasForeignKey(bi => bi.SessionPricingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ── BookingStatusHistory ──────────────────────────────
            modelBuilder.Entity<BookingStatusHistory>(entity =>
            {
                entity.HasOne(bsh => bsh.Booking)
                      .WithMany(b => b.StatusHistory)
                      .HasForeignKey(bsh => bsh.BookingId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Payment ───────────────────────────────────────────
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.Booking)
                      .WithMany(b => b.Payments)
                      .HasForeignKey(p => p.BookingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ── AdminUser ─────────────────────────────────────────
            modelBuilder.Entity<AdminUser>(entity =>
            {
                entity.HasIndex(a => a.Email).IsUnique();
            });

            // ── Seed: Superadmin inicial ──────────────────────────
            var hasher = new PasswordHasher<AdminUser>();
            var superAdmin = new AdminUser
            {
                Id = 1,
                Email = "admin@memoirenomade.com",
                Name = "Super Admin",
                IsSuperAdmin = true,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };
            superAdmin.PasswordHash = hasher.HashPassword(superAdmin, "Admin1234");

            modelBuilder.Entity<AdminUser>().HasData(superAdmin);
        }
    }
}