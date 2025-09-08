using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieReviewApp.API.Data;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Services
{
    public class RatingService : IRatingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public RatingService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Rating> CreateOrUpdateRatingAsync(int movieId, CreateRatingRequest request, string userId)
        {
            // Check if movie exists
            var movieExists = await _context.Movies.AnyAsync(m => m.MovieId == movieId);
            if (!movieExists)
                throw new ArgumentException("Movie not found");

            // Find existing rating from this user for this movie
            var existingRating = await _context.Ratings
                .Include(r => r.Movie)
                .FirstOrDefaultAsync(r => r.MovieId == movieId && r.UserId == userId);

            if (existingRating != null)
            {
                // Update existing rating
                existingRating.RatingValue = request.RatingValue;
                existingRating.CreatedDate = DateTime.UtcNow;
            }
            else
            {
                // Create new rating
                existingRating = _mapper.Map<Rating>(request);
                existingRating.MovieId = movieId;
                existingRating.UserId = userId;
                existingRating.CreatedDate = DateTime.UtcNow;
                _context.Ratings.Add(existingRating);
            }

            await _context.SaveChangesAsync();
            return existingRating;
        }

        public async Task<bool> DeleteRatingAsync(int movieId, string userId)
        {
            var rating = await _context.Ratings
                .FirstOrDefaultAsync(r => r.MovieId == movieId && r.UserId == userId);

            if (rating == null)
                return false;

            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RatingDto?> GetUserRatingForMovieAsync(int movieId, string userId)
        {
            var rating = await _context.Ratings
                .Include(r => r.User)
                .Include(r => r.Movie)
                .FirstOrDefaultAsync(r => r.MovieId == movieId && r.UserId == userId);

            return rating == null ? null : _mapper.Map<RatingDto>(rating);
        }

        public async Task<double> GetAverageRatingForMovieAsync(int movieId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.MovieId == movieId)
                .ToListAsync();

            return ratings.Any() ? ratings.Average(r => r.RatingValue) : 0.0;
        }

        public async Task<IEnumerable<RatingDto>> GetRatingsByUserAsync(string userId, int page = 1, int pageSize = 10)
        {
            var ratings = await _context.Ratings
                .Where(r => r.UserId == userId)
                .Include(r => r.User)
                .Include(r => r.Movie)
                .OrderByDescending(r => r.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<RatingDto>>(ratings);
        }
    }
}
