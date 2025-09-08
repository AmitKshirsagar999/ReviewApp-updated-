using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MovieReviewApp.API.Models;

namespace MovieReviewApp.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Rating> Ratings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Movie entity
            modelBuilder.Entity<Movie>(entity =>
            {
                entity.HasKey(e => e.MovieId);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Director)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Genre)
                    .HasMaxLength(50);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                // Configure relationship with ApplicationUser (who added the movie)
                entity.HasOne(m => m.CreatedByUser)
                    .WithMany(u => u.Movies)
                    .HasForeignKey(m => m.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Create index for better search performance
                entity.HasIndex(e => e.Title)
                    .HasDatabaseName("IX_Movie_Title");

                entity.HasIndex(e => e.Director)
                    .HasDatabaseName("IX_Movie_Director");

                entity.HasIndex(e => e.Genre)
                    .HasDatabaseName("IX_Movie_Genre");
            });

            // Configure Review entity
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.ReviewId);

                entity.Property(e => e.ReviewText)
                    .IsRequired()
                    .HasMaxLength(2000);

                // Configure relationship with Movie
                entity.HasOne(r => r.Movie)
                    .WithMany(m => m.Reviews)
                    .HasForeignKey(r => r.MovieId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with ApplicationUser (reviewer)
                entity.HasOne(r => r.User)
                    .WithMany(u => u.Reviews)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Prevent duplicate reviews from same user for same movie
                entity.HasIndex(e => new { e.UserId, e.MovieId })
                    .IsUnique()
                    .HasDatabaseName("IX_Review_UserId_MovieId");
            });

            // Configure Rating entity
            modelBuilder.Entity<Rating>(entity =>
            {
                entity.HasKey(e => e.RatingId);

                entity.Property(e => e.RatingValue)
                    .IsRequired();

                // Configure relationship with Movie
                entity.HasOne(r => r.Movie)
                    .WithMany(m => m.Ratings)
                    .HasForeignKey(r => r.MovieId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with ApplicationUser (rater)
                entity.HasOne(r => r.User)
                    .WithMany(u => u.Ratings)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Prevent duplicate ratings from same user for same movie
                entity.HasIndex(e => new { e.UserId, e.MovieId })
                    .IsUnique()
                    .HasDatabaseName("IX_Rating_UserId_MovieId");
            });

            // Configure ApplicationUser additional properties
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.FirstName)
                    .HasMaxLength(50);

                entity.Property(e => e.LastName)
                    .HasMaxLength(50);
            });
        }
    }
}
