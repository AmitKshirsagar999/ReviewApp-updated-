using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MovieReviewApp.API.Data;
using MovieReviewApp.API.DTOs;
using MovieReviewApp.API.Models;
using MovieReviewApp.API.Services.Interfaces;

namespace MovieReviewApp.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            IMapper mapper,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _mapper = mapper;
            _context = context;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email is already registered");

            var existingUsername = await _userManager.FindByNameAsync(request.UserName);
            if (existingUsername != null)
                throw new InvalidOperationException("Username is already taken");

            var user = _mapper.Map<ApplicationUser>(request);
            user.CreatedDate = DateTime.UtcNow;

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                Expiration = DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:ExpireDays"] ?? "30")),
                UserName = user.UserName!,
                Email = user.Email!
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null)
                throw new InvalidOperationException("Invalid username or password");

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
                throw new InvalidOperationException("Invalid username or password");

            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                Expiration = DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:ExpireDays"] ?? "30")),
                UserName = user.UserName!,
                Email = user.Email!
            };
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
        {
            var user = await _context.Users
                .Include(u => u.Movies)
                .Include(u => u.Reviews)
                .Include(u => u.Ratings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user == null ? null : _mapper.Map<UserProfileDto>(user);
        }

        private string GenerateJwtToken(ApplicationUser user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(int.Parse(jwtSettings["ExpireDays"] ?? "30")),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
