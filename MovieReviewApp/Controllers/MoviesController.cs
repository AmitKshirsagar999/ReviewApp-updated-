using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly IMovieService _movieService;

        public MoviesController(IMovieService movieService)
        {
            _movieService = movieService;
        }

        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<MovieSummaryDto>>> GetAll(int page = 1, int pageSize = 10)
        //{
        //    var movies = await _movieService.GetAllMoviesAsync(page, pageSize);
        //    return Ok(movies);
        //}

        // Also update your GetAllMovies endpoint
        [HttpGet]
        public async Task<ActionResult> GetAllMovies(int page = 1, int pageSize = 10)
        {
            var movies = await _movieService.GetAllMoviesAsync(page, pageSize);
            var totalCount = await _movieService.GetAllMoviesCountAsync();

            var response = new
            {
                movies = movies,
                totalCount = totalCount,
                currentPage = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }



        [HttpGet("{id}")]
        public async Task<ActionResult<MovieDto>> GetById(int id)
        {
            var movie = await _movieService.GetMovieByIdAsync(id);
            if (movie == null)
                return NotFound();

            return Ok(movie);
        }

        [HttpGet("search")]
        //public async Task<ActionResult<IEnumerable<MovieSummaryDto>>> Search(
        //    string? title, string? director, string? genre, int page = 1, int pageSize = 10)
        //{
        //    var movies = await _movieService.SearchMoviesAsync(title, director, genre, page, pageSize);
        //    return Ok(movies);
        //}

        public async Task<ActionResult> Search(
    string? title, string? director, string? genre, int page = 1, int pageSize = 10)
        {
            var movies = await _movieService.SearchMoviesAsync(title, director, genre, page, pageSize);
            var totalCount = await _movieService.GetSearchCountAsync(title, director, genre);

            var response = new
            {
                movies = movies,
                totalCount = totalCount,
                currentPage = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }






        [HttpPost]
        [Authorize]
        public async Task<ActionResult<MovieDto>> Create(CreateMovieRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var movie = await _movieService.CreateMovieAsync(request, userId);

                return CreatedAtAction(nameof(GetById), new { id = movie.MovieId },
                    await _movieService.GetMovieByIdAsync(movie.MovieId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<MovieDto>> Update(int id, UpdateMovieRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var movie = await _movieService.UpdateMovieAsync(id, request, userId);

                if (movie == null)
                    return NotFound();

                return Ok(await _movieService.GetMovieByIdAsync(movie.MovieId));
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
            var result = await _movieService.DeleteMovieAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MovieSummaryDto>>> GetUserMovies(int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var movies = await _movieService.GetMoviesByUserAsync(userId, page, pageSize);
            return Ok(movies);
        }





        // Add this new endpoint for the grid functionality
        [HttpGet("grid")]
        public async Task<ActionResult> GetMoviesForGrid(
            int page = 1,
            int pageSize = 10,
            string? sortBy = "createdDate",
            string? sortOrder = "desc",
            string? search = null,
            string? genre = null
        )
        {
            var (movies, totalCount) = await _movieService.GetMoviesWithSortingAsync(page, pageSize, sortBy, sortOrder, search, genre);

            var response = new
            {
                movies = movies,
                totalCount = totalCount,
                currentPage = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }
    }
}
