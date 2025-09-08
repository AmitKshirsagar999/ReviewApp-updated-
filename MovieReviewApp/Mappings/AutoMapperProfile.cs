using AutoMapper;
using MovieReviewApp.API.Models;
using MovieReviewApp.API.DTOs;

namespace MovieReviewApp.API.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Movie mappings
            CreateMap<CreateMovieRequest, Movie>();
            CreateMap<UpdateMovieRequest, Movie>();

            CreateMap<Movie, MovieDto>()
                .ForMember(dest => dest.CreatedByUserName, opt => opt.MapFrom(src => src.CreatedByUser.UserName))
                .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.AverageRating))
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.ReviewCount));

            CreateMap<Movie, MovieSummaryDto>()
                .ForMember(dest => dest.CreatedByUserId,
                          opt => opt.MapFrom(src => src.CreatedByUserId))
                .ForMember(dest => dest.CreatedByUserName,
                          opt => opt.MapFrom(src => src.CreatedByUser != null ? src.CreatedByUser.UserName : "System"))
                .ForMember(dest => dest.CreatedByUserEmail,
                          opt => opt.MapFrom(src => src.CreatedByUser != null ? src.CreatedByUser.Email : null))

                .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.AverageRating))
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.ReviewCount));

            // Review mappings
            CreateMap<CreateReviewRequest, Review>();

            CreateMap<UpdateReviewRequest, Review>();

            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Movie.Title))
                .ForMember(dest => dest.RatingValue, opt => opt.MapFrom(src =>
                    src.User.Ratings.FirstOrDefault(r => r.MovieId == src.MovieId).RatingValue)); // ✅ ADD THIS LINE



            // Rating mappings
            CreateMap<CreateRatingRequest, Rating>();

            CreateMap<Rating, RatingDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Movie.Title))
                .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.Movie.AverageRating));

            // User mappings
            CreateMap<RegisterRequest, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName));

            CreateMap<ApplicationUser, UserProfileDto>()
                .ForMember(dest => dest.MoviesAddedCount, opt => opt.MapFrom(src => src.Movies.Count))
                .ForMember(dest => dest.ReviewsCount, opt => opt.MapFrom(src => src.Reviews.Count))
                .ForMember(dest => dest.RatingsCount, opt => opt.MapFrom(src => src.Ratings.Count));
        }
    }
}
