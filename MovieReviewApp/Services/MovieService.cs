using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieReviewApp.API.Data;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Services
{
    public class MovieService : IMovieService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public MovieService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Movie> CreateMovieAsync(CreateMovieRequest request, string userId)
        {
            var movie = _mapper.Map<Movie>(request);
            movie.CreatedByUserId = userId;
            movie.CreatedDate = DateTime.UtcNow;

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return movie;
        }

        public async Task<Movie?> UpdateMovieAsync(int movieId, UpdateMovieRequest request, string userId)
        {
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.MovieId == movieId && m.CreatedByUserId == userId);

            if (movie == null)
                return null;

            _mapper.Map(request, movie);
            await _context.SaveChangesAsync();

            return movie;
        }

        public async Task<bool> DeleteMovieAsync(int movieId, string userId)
        {
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.MovieId == movieId && m.CreatedByUserId == userId);

            if (movie == null)
                return false;

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MovieDto?> GetMovieByIdAsync(int movieId)
        {
            var movie = await _context.Movies
                .Include(m => m.CreatedByUser)
                .Include(m => m.Reviews)
                    .ThenInclude(r => r.User)
                .Include(m => m.Ratings)
                .FirstOrDefaultAsync(m => m.MovieId == movieId);

            return movie == null ? null : _mapper.Map<MovieDto>(movie);
        }

        public async Task<IEnumerable<MovieSummaryDto>> GetAllMoviesAsync(int page = 1, int pageSize = 10)
        {
            var movies = await _context.Movies
                .Include(m => m.Reviews)
                .Include(m => m.Ratings)
                .OrderByDescending(m => m.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MovieSummaryDto>>(movies);
        }

        //public async Task<IEnumerable<MovieSummaryDto>> SearchMoviesAsync(string? title, string? director, string? genre, int page = 1, int pageSize = 10)
        //{
        //    var query = _context.Movies
        //        .Include(m => m.Reviews)
        //        .Include(m => m.Ratings)
        //        .AsQueryable();

        //    if (!string.IsNullOrEmpty(title))
        //        query = query.Where(m => m.Title.Contains(title));

        //    if (!string.IsNullOrEmpty(director))
        //        query = query.Where(m => m.Director.Contains(director));

        //    if (!string.IsNullOrEmpty(genre))
        //        query = query.Where(m => m.Genre != null && m.Genre.Contains(genre));

        //    var movies = await query
        //        .OrderByDescending(m => m.CreatedDate)
        //        .Skip((page - 1) * pageSize)
        //        .Take(pageSize)
        //        .ToListAsync();

        //    return _mapper.Map<IEnumerable<MovieSummaryDto>>(movies);
        //}


        public async Task<IEnumerable<MovieSummaryDto>> SearchMoviesAsync(string? title, string? director, string? genre, int page = 1, int pageSize = 10)
        {
            var query = _context.Movies
                .Include(m => m.Reviews)
                .Include(m => m.Ratings)
                .AsQueryable();

            // Since frontend passes same search term to all parameters, use OR logic
            if (!string.IsNullOrEmpty(title))
            {
                query = query.Where(m =>
                    m.Title.Contains(title) ||
                    m.Director.Contains(title) ||
                    (m.Genre != null && m.Genre.Contains(title))
                );
            }

            var movies = await query
                .OrderByDescending(m => m.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MovieSummaryDto>>(movies);
        }


        // Add this method to your MovieService class   if error delete
        public async Task<int> GetSearchCountAsync(string? title, string? director, string? genre)
        {
            var query = _context.Movies.AsQueryable();

            // Use the same logic as your SearchMoviesAsync method
            if (!string.IsNullOrEmpty(title))
            {
                query = query.Where(m =>
                    m.Title.Contains(title) ||
                    m.Director.Contains(title) ||
                    (m.Genre != null && m.Genre.Contains(title))
                );
            }

            return await query.CountAsync();
        }

        // Also add count method for GetAllMoviesAsync   if error delete
        public async Task<int> GetAllMoviesCountAsync()
        {
            return await _context.Movies.CountAsync();
        }



        public async Task<IEnumerable<MovieSummaryDto>> GetMoviesByUserAsync(string userId, int page = 1, int pageSize = 10)
        {
            var movies = await _context.Movies
                .Where(m => m.CreatedByUserId == userId)
                .Include(m => m.Reviews)
                .Include(m => m.Ratings)
                .OrderByDescending(m => m.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MovieSummaryDto>>(movies);
        }


        // Add this new method to your MovieService class
        // Fix the search method to use single search parameter
        public async Task<(IEnumerable<MovieSummaryDto> Movies, int TotalCount)> GetMoviesWithSortingAsync(
    int page = 1,
    int pageSize = 10,
    string? sortBy = "createdDate",
    string? sortOrder = "desc",
    string? search = null,
    string? genre = null
)
        {
            var query = _context.Movies
                .Include(m => m.Reviews)
                .Include(m => m.Ratings)
                .Include(m => m.CreatedByUser)
                .AsQueryable();

            // FIXED: Proper search logic for title and director only
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                query = query.Where(m =>
                    m.Title.ToLower().Contains(search) ||
                    m.Director.ToLower().Contains(search)
                );
            }

            // Apply genre filter (optional)
            if (!string.IsNullOrWhiteSpace(genre) && genre.ToLower() != "all")
            {
                query = query.Where(m => m.Genre != null && m.Genre.ToLower().Contains(genre.ToLower()));
            }

            // Apply sorting - keep your existing ApplySorting method as it was
            query = ApplySorting(query, sortBy, sortOrder);

            var totalCount = await query.CountAsync();

            var movies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (_mapper.Map<IEnumerable<MovieSummaryDto>>(movies), totalCount);
        }

        // Helper method for sorting logic
        // Fix the sorting case sensitivity and search logic
        private IQueryable<Movie> ApplySorting(IQueryable<Movie> query, string? sortBy, string? sortOrder)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                sortBy = "createdDate";
            if (string.IsNullOrWhiteSpace(sortOrder))
                sortOrder = "desc";

            var isAscending = sortOrder.ToLower() == "asc";

            return sortBy.ToLower() switch
            {
                "title" => isAscending
                    ? query.OrderBy(m => m.Title)
                    : query.OrderByDescending(m => m.Title),
                "director" => isAscending
                    ? query.OrderBy(m => m.Director)
                    : query.OrderByDescending(m => m.Director),
                "genre" => isAscending
                    ? query.OrderBy(m => m.Genre ?? "")
                    : query.OrderByDescending(m => m.Genre ?? ""),
                // FIX: Handle averageRating as calculated field
                "averagerating" => isAscending
                    ? query.OrderBy(m => m.Ratings.Any() ? m.Ratings.Average(r => r.RatingValue) : 0.0)
                    : query.OrderByDescending(m => m.Ratings.Any() ? m.Ratings.Average(r => r.RatingValue) : 0.0),
                "reviewcount" => isAscending
                    ? query.OrderBy(m => m.Reviews.Count)
                    : query.OrderByDescending(m => m.Reviews.Count),
                "createddate" => isAscending
                    ? query.OrderBy(m => m.CreatedDate)
                    : query.OrderByDescending(m => m.CreatedDate),
                _ => query.OrderByDescending(m => m.CreatedDate)
            };
        }




    }
}
