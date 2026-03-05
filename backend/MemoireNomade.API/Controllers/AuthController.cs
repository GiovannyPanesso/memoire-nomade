using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.Services;
using System.ComponentModel.DataAnnotations;

namespace MemoireNomade.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private const string RefreshTokenCookieName = "refreshToken";

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);

            if (!result.Success)
                return Unauthorized(new { message = result.ErrorMessage });

            // Guardar refresh token en HttpOnly Cookie (no accesible desde JS)
            SetRefreshTokenCookie(result.RefreshToken!);

            return Ok(new
            {
                accessToken = result.AccessToken,
                user = result.User
            });
        }

        // POST /api/auth/refresh
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "No se encontró el refresh token." });

            var result = await _authService.RefreshTokenAsync(refreshToken);

            if (!result.Success)
            {
                DeleteRefreshTokenCookie();
                return Unauthorized(new { message = result.ErrorMessage });
            }

            SetRefreshTokenCookie(result.RefreshToken!);

            return Ok(new
            {
                accessToken = result.AccessToken,
                user = result.User
            });
        }

        // POST /api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (!string.IsNullOrEmpty(refreshToken))
                await _authService.RevokeRefreshTokenAsync(refreshToken);

            DeleteRefreshTokenCookie();

            return Ok(new { message = "Sesión cerrada correctamente." });
        }

        // ── Métodos privados ──────────────────────────────────────────────────

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,   // No accesible desde JavaScript
                Secure = true,     // Solo HTTPS
                SameSite = SameSiteMode.None, // Necesario para frontend en distinto origen
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
        }

        private void DeleteRefreshTokenCookie()
        {
            Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });
        }
    }

    // DTOs locales del controlador
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}