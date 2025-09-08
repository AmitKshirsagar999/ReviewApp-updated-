using Microsoft.AspNetCore.Identity;

namespace MovieReviewApp.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties for one-to-many relationships
        public virtual ICollection<Movie> Movies { get; set; } = new List<Movie>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    }
}
