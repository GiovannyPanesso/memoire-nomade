using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;
using System.Security.Claims;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/sessions")]
    [Authorize]
    public class AdminSessionsController : ControllerBase
    {
        private readonly ISessionService _sessionService;

        public AdminSessionsController(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        // GET /api/admin/sessions?tourId=1&status=Activa
        [HttpGet]
        public async Task<IActionResult> GetAllSessions(
            [FromQuery] int? tourId,
            [FromQuery] string? status)
        {
            var sessions = await _sessionService.GetAllSessionsAsync(tourId, status);
            return Ok(sessions);
        }

        // GET /api/admin/sessions/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSessionById(int id)
        {
            var session = await _sessionService.GetSessionByIdAsync(id);

            if (session == null)
                return NotFound(new { message = "Sesión no encontrada." });

            return Ok(session);
        }

        // POST /api/admin/sessions
        [HttpPost]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage, session) = await _sessionService.CreateSessionAsync(dto);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return CreatedAtAction(nameof(GetSessionById), new { id = session!.Id }, session);
        }

        // PUT /api/admin/sessions/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSession(int id, [FromBody] UpdateSessionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage, session) = await _sessionService.UpdateSessionAsync(id, dto);

            if (!success)
                return BadRequest(new { message = errorMessage });

            if (session == null)
                return NotFound(new { message = "Sesión no encontrada." });

            return Ok(session);
        }

        // DELETE /api/admin/sessions/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSession(int id)
        {
            var (success, errorMessage) = await _sessionService.DeleteSessionAsync(id);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return NoContent();
        }

        // PUT /api/admin/sessions/{id}/status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateSessionStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Obtener el email del admin autenticado desde el token JWT
            var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Sistema";

            var (success, errorMessage) = await _sessionService.UpdateSessionStatusAsync(
                id, dto.Status, adminEmail, dto.Notes);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = $"Estado actualizado a '{dto.Status}'." });
        }
    }
}