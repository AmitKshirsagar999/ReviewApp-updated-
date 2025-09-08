using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;

namespace MovieReviewApp.API.Services.Interfaces
{
    public interface IRatingService
    {
        Task<Rating> CreateOrUpdateRatingAsync(int movieId, CreateRatingRequest request, string userId);
        Task<bool> DeleteRatingAsync(int movieId, string userId);
        Task<RatingDto?> GetUserRatingForMovieAsync(int movieId, string userId);
        Task<double> GetAverageRatingForMovieAsync(int movieId);
        Task<IEnumerable<RatingDto>> GetRatingsByUserAsync(string userId, int page = 1, int pageSize = 10);
    }
}
