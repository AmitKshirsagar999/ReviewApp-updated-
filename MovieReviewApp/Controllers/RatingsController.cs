using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingsController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingsController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpPost("movie/{movieId}")]
        [Authorize]
        public async Task<ActionResult<RatingDto>> CreateOrUpdate(int movieId, CreateRatingRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var rating = await _ratingService.CreateOrUpdateRatingAsync(movieId, request, userId);

                var ratingDto = await _ratingService.GetUserRatingForMovieAsync(movieId, userId);
                return Ok(ratingDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("movie/{movieId}/user")]
        [Authorize]
        public async Task<ActionResult<RatingDto>> GetUserRating(int movieId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var rating = await _ratingService.GetUserRatingForMovieAsync(movieId, userId);

            if (rating == null)
                return NotFound();

            return Ok(rating);
        }

        [HttpGet("movie/{movieId}/average")]
        public async Task<ActionResult<double>> GetAverageRating(int movieId)
        {
            var average = await _ratingService.GetAverageRatingForMovieAsync(movieId);
            return Ok(average);
        }

        [HttpDelete("movie/{movieId}")]
        [Authorize]
        public async Task<IActionResult> Delete(int movieId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _ratingService.DeleteRatingAsync(movieId, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetUserRatings(int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ratings = await _ratingService.GetRatingsByUserAsync(userId, page, pageSize);
            return Ok(ratings);
        }
    }
}
