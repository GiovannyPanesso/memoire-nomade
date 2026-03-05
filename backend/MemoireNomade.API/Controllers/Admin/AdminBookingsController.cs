using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;
using System.Security.Claims;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/bookings")]
    [Authorize]
    public class AdminBookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public AdminBookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET /api/admin/bookings
        [HttpGet]
        public async Task<IActionResult> GetAllBookings(
            [FromQuery] string? status,
            [FromQuery] int? tourId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var bookings = await _bookingService
                .GetAllBookingsAsync(status, tourId, from, to);
            return Ok(bookings);
        }

        // GET /api/admin/bookings/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);

            if (booking == null)
                return NotFound(new { message = "Reserva no encontrada." });

            return Ok(booking);
        }

        // POST /api/admin/bookings
        [HttpPost]
        public async Task<IActionResult> CreateManualBooking(
            [FromBody] CreateManualBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";

            var (success, errorMessage, booking) =
                await _bookingService.CreateManualBookingAsync(dto, adminEmail);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return CreatedAtAction(
                nameof(GetBookingById),
                new { id = booking!.Id },
                booking);
        }

        // PUT /api/admin/bookings/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBooking(
            int id, [FromBody] UpdateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";

            var (success, errorMessage) =
                await _bookingService.UpdateBookingAsync(id, dto, adminEmail);

            if (!success)
                return BadRequest(new { message = errorMessage });

            var booking = await _bookingService.GetBookingByIdAsync(id);
            return Ok(booking);
        }
    }
}