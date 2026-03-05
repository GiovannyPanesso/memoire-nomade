using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using MemoireNomade.API.Data;
using MemoireNomade.API.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<AdminUser> _hasher;

        public AdminUsersController(AppDbContext context)
        {
            _context = context;
            _hasher = new PasswordHasher<AdminUser>();
        }

        // GET /api/admin/users — Solo superadmin
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            if (!IsSuperAdmin())
                return Forbid();

            var users = await _context.AdminUsers
                .OrderBy(u => u.Name)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Name,
                    u.IsSuperAdmin,
                    u.IsActive,
                    u.LastLogin,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // POST /api/admin/users — Solo superadmin
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserDto dto)
        {
            if (!IsSuperAdmin())
                return Forbid();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Verificar email único
            var exists = await _context.AdminUsers
                .AnyAsync(u => u.Email == dto.Email);

            if (exists)
                return BadRequest(new { message = "Ya existe un administrador con ese email." });

            var user = new AdminUser
            {
                Email = dto.Email,
                Name = dto.Name,
                IsSuperAdmin = dto.IsSuperAdmin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            _context.AdminUsers.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Name,
                user.IsSuperAdmin,
                user.IsActive,
                user.CreatedAt
            });
        }

        // PUT /api/admin/users/{id} — Solo superadmin
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateAdminUserDto dto)
        {
            if (!IsSuperAdmin())
                return Forbid();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.AdminUsers.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "Administrador no encontrado." });

            user.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.Email, user.Name, user.IsSuperAdmin, user.IsActive });
        }

        // PUT /api/admin/users/{id}/deactivate — Solo superadmin
        [HttpPut("{id:int}/deactivate")]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            if (!IsSuperAdmin())
                return Forbid();

            var currentAdminId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (id == currentAdminId)
                return BadRequest(new { message = "No puedes desactivar tu propia cuenta." });

            var user = await _context.AdminUsers.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "Administrador no encontrado." });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            var estado = user.IsActive ? "activado" : "desactivado";
            return Ok(new { message = $"Administrador {estado} correctamente." });
        }

        // PUT /api/admin/users/me/credentials — Cualquier admin autenticado
        [HttpPut("me/credentials")]
        public async Task<IActionResult> UpdateMyCredentials(
            [FromBody] UpdateCredentialsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentAdminId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var user = await _context.AdminUsers.FindAsync(currentAdminId);
            if (user == null)
                return NotFound(new { message = "Administrador no encontrado." });

            // Verificar contraseña actual
            var result = _hasher.VerifyHashedPassword(
                user, user.PasswordHash, dto.CurrentPassword);

            if (result == PasswordVerificationResult.Failed)
                return BadRequest(new { message = "La contraseña actual es incorrecta." });

            // Actualizar email si cambió
            if (!string.IsNullOrEmpty(dto.NewEmail) && dto.NewEmail != user.Email)
            {
                var emailExists = await _context.AdminUsers
                    .AnyAsync(u => u.Email == dto.NewEmail && u.Id != currentAdminId);

                if (emailExists)
                    return BadRequest(new { message = "Ese email ya está en uso." });

                user.Email = dto.NewEmail;
            }

            // Actualizar contraseña si se proporcionó
            if (!string.IsNullOrEmpty(dto.NewPassword))
                user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Credenciales actualizadas correctamente." });
        }

        // ── Helper privado ────────────────────────────────────────────────────

        private bool IsSuperAdmin()
        {
            var isSuperAdmin = User.FindFirstValue("IsSuperAdmin");
            return isSuperAdmin == "True";
        }
    }

    // ── DTOs locales ──────────────────────────────────────────────────────────

    public class CreateAdminUserDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public bool IsSuperAdmin { get; set; } = false;
    }

    public class UpdateAdminUserDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateCredentialsDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [EmailAddress]
        public string? NewEmail { get; set; }

        [MinLength(8)]
        public string? NewPassword { get; set; }
    }
}