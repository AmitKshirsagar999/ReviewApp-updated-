using System.ComponentModel.DataAnnotations;

namespace MovieReviewApp.API.DTOs
{
    public class CreateMovieRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Director { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Genre { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }
    }

    public class UpdateMovieRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Director { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Genre { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }
    }

    public class MovieDto
    {
        public int MovieId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
        public string? Genre { get; set; }
        public string? Description { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public List<ReviewDto> Reviews { get; set; } = new();
    }

    public class MovieSummaryDto
    {
        public int MovieId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
        public string? Genre { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public DateTime CreatedDate { get; set; }


        // ADD THESE PROPERTIES
        public string CreatedByUserId { get; set; } = string.Empty;
        public string? CreatedByUserName { get; set; }
        public string? CreatedByUserEmail { get; set; }

    }
}
