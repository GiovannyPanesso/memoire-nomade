using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;

namespace MemoireNomade.API.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET /api/bookings/{confirmationCode}
        [HttpGet("{confirmationCode}")]
        public async Task<IActionResult> GetByConfirmationCode(string confirmationCode)
        {
            var booking = await _bookingService
                .GetBookingByConfirmationCodeAsync(confirmationCode);

            if (booking == null)
                return NotFound(new { message = "Reserva no encontrada." });

            return Ok(booking);
        }

        // POST /api/bookings
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage, booking) =
                await _bookingService.CreateBookingAsync(dto);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return CreatedAtAction(
                nameof(GetByConfirmationCode),
                new { confirmationCode = booking!.ConfirmationCode },
                booking);
        }
    }
}