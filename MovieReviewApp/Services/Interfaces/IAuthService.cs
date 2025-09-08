using MovieReviewApp.API.DTOs;

namespace MovieReviewApp.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserProfileDto?> GetUserProfileAsync(string userId);
    }
}
