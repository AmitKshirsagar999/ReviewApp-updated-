using System.ComponentModel.DataAnnotations;

namespace MovieReviewApp.API.DTOs
{
    public class CreateReviewRequest
    {
        [Required]
        [MaxLength(2000)]
        public string ReviewText { get; set; } = string.Empty;
    }

    public class UpdateReviewRequest
    {
        [Required]
        [MaxLength(2000)]
        public string ReviewText { get; set; } = string.Empty;
    }

    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public string ReviewText { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int MovieId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;

        public int? RatingValue { get; set; } // ✅ ADD THIS LINE
    }
}
