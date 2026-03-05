using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.DTOs;
using MemoireNomade.API.Services;

namespace MemoireNomade.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/tours")]
    [Authorize] // Requiere JWT válido
    public class AdminToursController : ControllerBase
    {
        private readonly ITourService _tourService;

        public AdminToursController(ITourService tourService)
        {
            _tourService = tourService;
        }

        // GET /api/admin/tours
        [HttpGet]
        public async Task<IActionResult> GetAllTours()
        {
            var tours = await _tourService.GetAllToursAsync();
            return Ok(tours);
        }

        // POST /api/admin/tours
        [HttpPost]
        public async Task<IActionResult> CreateTour([FromBody] CreateTourDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var tour = await _tourService.CreateTourAsync(dto);
            return CreatedAtAction(nameof(GetAllTours), new { id = tour.Id }, tour);
        }

        // PUT /api/admin/tours/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTour(int id, [FromBody] UpdateTourDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var tour = await _tourService.UpdateTourAsync(id, dto);

            if (tour == null)
                return NotFound(new { message = "Tour no encontrado." });

            return Ok(tour);
        }

        // DELETE /api/admin/tours/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var (success, errorMessage) = await _tourService.DeleteTourAsync(id);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return NoContent();
        }

        // PUT /api/admin/tours/{id}/featured
        [HttpPut("{id:int}/featured")]
        public async Task<IActionResult> ToggleFeatured(int id)
        {
            var (success, errorMessage) = await _tourService.ToggleFeaturedAsync(id);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = "Estado de destacado actualizado." });
        }

        // POST /api/admin/tours/{id}/images
        [HttpPost("{id:int}/images")]
        public async Task<IActionResult> AddImage(int id, [FromBody] AddTourImageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var image = await _tourService.AddTourImageAsync(id, dto.ImageUrl, dto.Order);

            if (image == null)
                return BadRequest(new { message = "No se pudo añadir la imagen. Verifica que el tour existe y no supera el límite de 10 imágenes." });

            return Ok(image);
        }

        // DELETE /api/admin/tours/{id}/images/{imageId}
        [HttpDelete("{id:int}/images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int id, int imageId)
        {
            var success = await _tourService.DeleteTourImageAsync(id, imageId);

            if (!success)
                return NotFound(new { message = "Imagen no encontrada." });

            return NoContent();
        }
    }

    // DTO local para añadir imagen
    public class AddTourImageDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public int Order { get; set; } = 0;
    }
}