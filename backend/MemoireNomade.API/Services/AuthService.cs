using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using MemoireNomade.API.Data;
using MemoireNomade.API.Models;

namespace MemoireNomade.API.Services
{
    // Configuración JWT mapeada desde appsettings
    public class JwtSettings
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpirationHours { get; set; } = 8;
    }

    public class RefreshTokenSettings
    {
        public int ExpirationDays { get; set; } = 30;
    }

    public class LoginResult
    {
        public bool Success { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public string? ErrorMessage { get; set; }
        public AdminUserInfo? User { get; set; }
    }

    public class AdminUserInfo
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsSuperAdmin { get; set; }
    }

    public interface IAuthService
    {
        Task<LoginResult> LoginAsync(string email, string password);
        Task<LoginResult> RefreshTokenAsync(string refreshToken);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly RefreshTokenSettings _refreshSettings;
        private readonly PasswordHasher<AdminUser> _hasher;

        public AuthService(
            AppDbContext context,
            IOptions<JwtSettings> jwtSettings,
            IOptions<RefreshTokenSettings> refreshSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _refreshSettings = refreshSettings.Value;
            _hasher = new PasswordHasher<AdminUser>();
        }

        public async Task<LoginResult> LoginAsync(string email, string password)
        {
            // Buscar admin por email
            var admin = await _context.AdminUsers
                .FirstOrDefaultAsync(a => a.Email == email && a.IsActive);

            if (admin == null)
                return new LoginResult { Success = false, ErrorMessage = "Credenciales incorrectas." };

            // Verificar contraseña
            var result = _hasher.VerifyHashedPassword(admin, admin.PasswordHash, password);
            if (result == PasswordVerificationResult.Failed)
                return new LoginResult { Success = false, ErrorMessage = "Credenciales incorrectas." };

            // Generar tokens
            var accessToken = GenerateAccessToken(admin);
            var refreshToken = GenerateRefreshToken();

            // Guardar refresh token en BD
            admin.RefreshToken = refreshToken;
            admin.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_refreshSettings.ExpirationDays);
            admin.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new LoginResult
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new AdminUserInfo
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    Name = admin.Name,
                    IsSuperAdmin = admin.IsSuperAdmin
                }
            };
        }

        public async Task<LoginResult> RefreshTokenAsync(string refreshToken)
        {
            var admin = await _context.AdminUsers
                .FirstOrDefaultAsync(a =>
                    a.RefreshToken == refreshToken &&
                    a.RefreshTokenExpiry > DateTime.UtcNow &&
                    a.IsActive);

            if (admin == null)
                return new LoginResult { Success = false, ErrorMessage = "Refresh token inválido o expirado." };

            // Rotar el refresh token (cada uso genera uno nuevo)
            var newAccessToken = GenerateAccessToken(admin);
            var newRefreshToken = GenerateRefreshToken();

            admin.RefreshToken = newRefreshToken;
            admin.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_refreshSettings.ExpirationDays);
            await _context.SaveChangesAsync();

            return new LoginResult
            {
                Success = true,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new AdminUserInfo
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    Name = admin.Name,
                    IsSuperAdmin = admin.IsSuperAdmin
                }
            };
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
        {
            var admin = await _context.AdminUsers
                .FirstOrDefaultAsync(a => a.RefreshToken == refreshToken);

            if (admin == null) return false;

            // Invalidar el refresh token
            admin.RefreshToken = null;
            admin.RefreshTokenExpiry = null;
            await _context.SaveChangesAsync();

            return true;
        }

        // ── Métodos privados ──────────────────────────────────────────────────

        private string GenerateAccessToken(AdminUser admin)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Email, admin.Email),
                new Claim(ClaimTypes.Name, admin.Name),
                new Claim("IsSuperAdmin", admin.IsSuperAdmin.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(_jwtSettings.ExpirationHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            // Token aleatorio criptográficamente seguro
            var bytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}