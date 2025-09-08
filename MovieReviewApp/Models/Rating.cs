using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReviewApp.API.Models
{
    public class Rating
    {
        public int RatingId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int RatingValue { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Foreign Key to Movie
        [Required]
        public int MovieId { get; set; }

        // Foreign Key to ApplicationUser (rater)
        [Required]
        public string UserId { get; set; } = string.Empty;

        // Navigation properties
        [ForeignKey("MovieId")]
        public virtual Movie Movie { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
