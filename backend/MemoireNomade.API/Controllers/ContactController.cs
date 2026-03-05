using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;

namespace MemoireNomade.API.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        // POST /api/contact
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateContactMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _contactService.CreateMessageAsync(dto);

            return Ok(new { message = "Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto." });
        }
    }
}