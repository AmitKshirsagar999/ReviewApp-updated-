using System.ComponentModel.DataAnnotations;

namespace MovieReviewApp.API.DTOs
{
    public class CreateRatingRequest
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int RatingValue { get; set; }
    }

    public class RatingDto
    {
        public int RatingId { get; set; }
        public int RatingValue { get; set; }
        public double AverageRating { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int MovieId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
    }
}
