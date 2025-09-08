using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReviewApp.API.Models
{
    public class Movie
    {
        public int MovieId { get; set; }

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

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Foreign Key to ApplicationUser (who added the movie)
        [Required]
        public string CreatedByUserId { get; set; } = string.Empty;

        // Navigation property to the user who created this movie
        [ForeignKey("CreatedByUserId")]
        public virtual ApplicationUser CreatedByUser { get; set; } = null!;

        // Navigation properties for one-to-many relationships
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

        // Calculated properties
        [NotMapped]
        public double AverageRating => Ratings.Any() ? Ratings.Average(r => r.RatingValue) : 0.0;

        [NotMapped]
        public int ReviewCount => Reviews.Count;
    }
}
