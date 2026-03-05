using Microsoft.AspNetCore.Mvc;
using MemoireNomade.API.Services;

namespace MemoireNomade.API.Controllers
{
    [ApiController]
    [Route("api/tours")]
    public class ToursController : ControllerBase
    {
        private readonly ITourService _tourService;

        public ToursController(ITourService tourService)
        {
            _tourService = tourService;
        }

        // GET /api/tours
        [HttpGet]
        public async Task<IActionResult> GetActiveTours()
        {
            var tours = await _tourService.GetActiveToursAsync();
            return Ok(tours);
        }

        // GET /api/tours/featured
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedTours()
        {
            var tours = await _tourService.GetFeaturedToursAsync();
            return Ok(tours);
        }

        // GET /api/tours/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetTourById(int id)
        {
            var tour = await _tourService.GetTourByIdAsync(id);

            if (tour == null)
                return NotFound(new { message = "Tour no encontrado." });

            return Ok(tour);
        }
    }
}