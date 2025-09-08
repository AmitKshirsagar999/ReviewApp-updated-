using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;

namespace MovieReviewApp.API.Services.Interfaces
{
    public interface IReviewService
    {
        Task<Review> CreateReviewAsync(int movieId, CreateReviewRequest request, string userId);
        Task<Review?> UpdateReviewAsync(int reviewId, UpdateReviewRequest request, string userId);
        Task<bool> DeleteReviewAsync(int reviewId, string userId);
        Task<ReviewDto?> GetReviewByIdAsync(int reviewId);
        Task<IEnumerable<ReviewDto>> GetReviewsForMovieAsync(int movieId, int page = 1, int pageSize = 10);
        Task<IEnumerable<ReviewDto>> GetReviewsByUserAsync(string userId, int page = 1, int pageSize = 10);
        Task<bool> CanUserReviewMovieAsync(string userId, int movieId);


        Task<int> GetReviewsCountForMovieAsync(int movieId);
        Task<int> GetReviewsCountByUserAsync(string userId);
    }
}
