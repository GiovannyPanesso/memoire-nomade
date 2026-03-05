using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.Services;

namespace MemoireNomade.API.Controllers
{
    [ApiController]
    [Route("api/tours")]
    public class SessionsController : ControllerBase
    {
        private readonly ISessionService _sessionService;

        public SessionsController(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        // GET /api/tours/{id}/sessions
        [HttpGet("{id:int}/sessions")]
        public async Task<IActionResult> GetAvailableSessions(int id)
        {
            var sessions = await _sessionService.GetAvailableSessionsByTourAsync(id);
            return Ok(sessions);
        }
    }
}