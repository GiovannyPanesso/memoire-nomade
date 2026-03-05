using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.Services;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/messages")]
    [Authorize]
    public class AdminMessagesController : ControllerBase
    {
        private readonly IContactService _contactService;

        public AdminMessagesController(IContactService contactService)
        {
            _contactService = contactService;
        }

        // GET /api/admin/messages?isRead=false
        [HttpGet]
        public async Task<IActionResult> GetAllMessages([FromQuery] bool? isRead)
        {
            var messages = await _contactService.GetAllMessagesAsync(isRead);
            return Ok(messages);
        }

        // GET /api/admin/messages/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMessageById(int id)
        {
            var message = await _contactService.GetMessageByIdAsync(id);

            if (message == null)
                return NotFound(new { message = "Mensaje no encontrado." });

            return Ok(message);
        }

        // PUT /api/admin/messages/{id}/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> ToggleRead(int id)
        {
            var success = await _contactService.ToggleReadAsync(id);

            if (!success)
                return NotFound(new { message = "Mensaje no encontrado." });

            return Ok(new { message = "Estado de lectura actualizado." });
        }

        // DELETE /api/admin/messages/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var success = await _contactService.DeleteMessageAsync(id);

            if (!success)
                return NotFound(new { message = "Mensaje no encontrado." });

            return NoContent();
        }
    }
}