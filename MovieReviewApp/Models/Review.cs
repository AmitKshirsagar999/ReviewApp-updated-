using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReviewApp.API.Models
{
    public class Review
    {
        public int ReviewId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string ReviewText { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Foreign Key to Movie
        [Required]
        public int MovieId { get; set; }

        // Foreign Key to ApplicationUser (reviewer)
        [Required]
        public string UserId { get; set; } = string.Empty;

        // Navigation properties
        [ForeignKey("MovieId")]
        public virtual Movie Movie { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
