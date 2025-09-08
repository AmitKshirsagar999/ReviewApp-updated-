using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieReviewApp.API.Data;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ReviewService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Review> CreateReviewAsync(int movieId, CreateReviewRequest request, string userId)
        {
            // Check if movie exists
            var movieExists = await _context.Movies.AnyAsync(m => m.MovieId == movieId);
            if (!movieExists)
                throw new ArgumentException("Movie not found");

            // Check if user already reviewed this movie (composite unique constraint)
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.MovieId == movieId && r.UserId == userId);

            if (existingReview != null)
                throw new InvalidOperationException("User has already reviewed this movie.");

            var review = _mapper.Map<Review>(request);
            review.MovieId = movieId;
            review.UserId = userId;
            review.CreatedDate = DateTime.UtcNow;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return review;
        }

        public async Task<Review?> UpdateReviewAsync(int reviewId, UpdateReviewRequest request, string userId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId);

            if (review == null)
                return null;

            _mapper.Map(request, review);
            await _context.SaveChangesAsync();

            return review;
        }

        public async Task<bool> DeleteReviewAsync(int reviewId, string userId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId);

            if (review == null)
                return false;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ReviewDto?> GetReviewByIdAsync(int reviewId)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Movie)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);

            return review == null ? null : _mapper.Map<ReviewDto>(review);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsForMovieAsync(int movieId, int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.MovieId == movieId)
                .Include(r => r.User)
                .ThenInclude(u => u.Ratings.Where(rt => rt.MovieId == movieId)) // ✅ ADD THIS
                .Include(r => r.User)
                .Include(r => r.Movie)
                .OrderByDescending(r => r.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ReviewDto>>(reviews);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByUserAsync(string userId, int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.User)
                .Include(r => r.Movie)
                .OrderByDescending(r => r.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ReviewDto>>(reviews);
        }


        // newly added method sfor counting reviews for a movie
        public async Task<int> GetReviewsCountForMovieAsync(int movieId)
        {
            return await _context.Reviews
                .Where(r => r.MovieId == movieId)
                .CountAsync();
        }


        public async Task<int> GetReviewsCountByUserAsync(string userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .CountAsync();
        }


        public async Task<bool> CanUserReviewMovieAsync(string userId, int movieId)
        {
            return !await _context.Reviews
                .AnyAsync(r => r.UserId == userId && r.MovieId == movieId);
        }
    }
}
