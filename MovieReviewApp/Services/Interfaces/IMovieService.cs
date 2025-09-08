using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;

namespace MovieReviewApp.API.Services.Interfaces
{
    public interface IMovieService
    {
        Task<Movie> CreateMovieAsync(CreateMovieRequest request, string userId);
        Task<Movie?> UpdateMovieAsync(int movieId, UpdateMovieRequest request, string userId);
        Task<bool> DeleteMovieAsync(int movieId, string userId);
        Task<MovieDto?> GetMovieByIdAsync(int movieId);
        Task<IEnumerable<MovieSummaryDto>> GetAllMoviesAsync(int page = 1, int pageSize = 10);
        Task<IEnumerable<MovieSummaryDto>> SearchMoviesAsync(string? title, string? director, string? genre, int page = 1, int pageSize = 10);
        Task<IEnumerable<MovieSummaryDto>> GetMoviesByUserAsync(string userId, int page = 1, int pageSize = 10);

        //added new things   if error delete
        Task<int> GetSearchCountAsync(string? title, string? director, string? genre);
        Task<int> GetAllMoviesCountAsync();


        // Add this new method to IMovieService
        Task<(IEnumerable<MovieSummaryDto> Movies, int TotalCount)> GetMoviesWithSortingAsync(
            int page = 1,
            int pageSize = 10,
            string? sortBy = "createdDate",
            string? sortOrder = "desc",
            string? search = null,
            string? genre = null
        );

    }
}
