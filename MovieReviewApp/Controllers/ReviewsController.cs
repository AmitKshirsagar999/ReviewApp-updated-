using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetById(int id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
                return NotFound();

            return Ok(review);
        }

        //[HttpGet("movie/{movieId}")]
        //public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByMovie(int movieId, int page = 1, int pageSize = 10)
        //{
        //    var reviews = await _reviewService.GetReviewsForMovieAsync(movieId, page, pageSize);
        //    return Ok(reviews);
        //}



        // newly added method
        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult> GetByMovie(int movieId, int page = 1, int pageSize = 5)
        {
            var reviews = await _reviewService.GetReviewsForMovieAsync(movieId, page, pageSize);
            var totalCount = await _reviewService.GetReviewsCountForMovieAsync(movieId);

            var response = new
            {
                reviews = reviews,
                totalCount = totalCount,
                currentPage = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }

        [HttpPost("movie/{movieId}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> Create(int movieId, CreateReviewRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var review = await _reviewService.CreateReviewAsync(movieId, request, userId);

                return CreatedAtAction(nameof(GetById), new { id = review.ReviewId },
                    await _reviewService.GetReviewByIdAsync(review.ReviewId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> Update(int id, UpdateReviewRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var review = await _reviewService.UpdateReviewAsync(id, request, userId);

                if (review == null)
                    return NotFound();

                return Ok(await _reviewService.GetReviewByIdAsync(review.ReviewId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _reviewService.DeleteReviewAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        //[HttpGet("user")]
        //[Authorize]
        //public async Task<ActionResult<IEnumerable<ReviewDto>>> GetUserReviews(int page = 1, int pageSize = 10)
        //{
        //    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        //    var reviews = await _reviewService.GetReviewsByUserAsync(userId, page, pageSize);
        //    return Ok(reviews);
        //}


        // newly added method 
        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult> GetUserReviews(int page = 1, int pageSize = 5)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var reviews = await _reviewService.GetReviewsByUserAsync(userId, page, pageSize);
            var totalCount = await _reviewService.GetReviewsCountByUserAsync(userId);

            var response = new
            {
                reviews = reviews,
                totalCount = totalCount,
                currentPage = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }




        [HttpGet("can-review/{movieId}")]
        [Authorize]
        public async Task<ActionResult<bool>> CanUserReview(int movieId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var canReview = await _reviewService.CanUserReviewMovieAsync(userId, movieId);
            return Ok(canReview);
        }
    }
}
