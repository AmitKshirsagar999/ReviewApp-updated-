import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { 
  MovieService, 
  MovieDetail, 
  CreateReviewRequest, 
  CreateRatingRequest,
  ReviewDto ,
  PaginationInfo
} from '../../../core/services/movie.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Location } from '@angular/common';  // ✅ Already added


@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    
  ],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.scss']
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private location = inject(Location);  // ✅ ADD THIS LINE

  // State
  movie = signal<MovieDetail | null>(null);
  loading = signal(true);
  reviewLoading = signal(false);
  ratingLoading = signal(false);

  // ✅ ADD THIS NEW SIGNAL
  reviewsLoading = signal(false);



  // newly added here
  reviewsPagination = signal<PaginationInfo>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 5,
  totalPages: 0
});

// Add Math for template use
Math = Math;
  
  // Forms
  reviewForm: FormGroup;
  selectedRating = signal(0);

  // Rating options
  ratingOptions = [1, 2, 3, 4, 5];

  constructor() {
    this.reviewForm = this.fb.group({
      reviewText: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  ngOnInit() {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(+movieId);
    } else {
      this.router.navigate(['/movies']);
    }
  }

  get isAuthenticated(): boolean {
    return !!this.authService.token;
  }

  get canAddReview(): boolean {
    return this.isAuthenticated && this.movie() !== null;
  }

  // loadMovieDetails(movieId: number) {
  //   this.loading.set(true);
  //   this.movieService.getMovieById(movieId).subscribe({
  //     next: (movie) => {
  //       this.movie.set(movie);
  //       this.loading.set(false);
  //       // Load paginated reviews separately
  //       this.loadReviews(movieId, 1);
  //     },
  //     error: (error) => {
  //       console.error('Error loading movie details:', error);
  //       this.showError('Failed to load movie details');
  //       this.loading.set(false);
  //       this.router.navigate(['/movies']);
  //     }
  //   });
  // }


  loadMovieDetails(movieId: number) {
  this.loading.set(true);
  const startTime = Date.now();

  this.movieService.getMovieById(movieId).subscribe({
    next: (movie) => {
      this.movie.set(movie);

      const elapsed = Date.now() - startTime;
      const minLoadingTime = 700;
      
      setTimeout(() => {
        this.loading.set(false);
        // Now load reviews only AFTER loader hides
        this.loadReviews(movieId, 1);
      }, Math.max(minLoadingTime - elapsed, 0));
    },
    error: (error) => {
      console.error('Error loading movie:', error);
      this.showError('Failed to load movie details');

      const elapsed = Date.now() - startTime;
      const minLoadingTime = 700;
      setTimeout(() => {
        this.loading.set(false);
        this.router.navigate(['/movies']);
      }, Math.max(minLoadingTime - elapsed, 0));
    }
  });
}



isMovieOwner(): boolean {
  console.log('=== isMovieOwner Debug ===');
  console.log('1. Is authenticated:', this.isAuthenticated);
  console.log('2. Movie exists:', !!this.movie());
  
  if (!this.isAuthenticated) {
    console.log('User not authenticated');
    return false;
  }
  
  if (!this.movie()) {
    console.log('No movie data');
    return false;
  }
  
  const currentUsername = this.getCurrentUsername();
  const movieCreator = this.movie()!.createdByUserName;
  
  console.log('3. Current user:', `"${currentUsername}"`);
  console.log('4. Movie creator:', `"${movieCreator}"`);
  console.log('5. Are equal?', currentUsername === movieCreator);
  console.log('6. Are equal (case insensitive)?', currentUsername.toLowerCase() === movieCreator.toLowerCase());
  
  return currentUsername === movieCreator;
}

getCurrentUsername(): string {
  const token = this.authService.token;
  console.log('JWT Token exists:', !!token);
  
  if (!token) return '';
  
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    
    console.log('JWT Payload:', payload);
    
    // Try all possible username claims
    const possibleUsernames = [
      payload.unique_name,
      payload.username, 
      payload.name,
      payload.sub,
      payload.email,
      payload.UniqueName, // Sometimes case matters
      payload.UserName
    ];
    
    console.log('All possible usernames:', possibleUsernames);
    
    const username = possibleUsernames.find(u => u && u.trim()) || '';
    console.log('Selected username:', `"${username}"`);
    
    return username;
  } catch (error) {
    console.error('JWT decode error:', error);
    return '';
  }
}



editMovie() {
  const movieId = this.movie()?.movieId;
  if (movieId) {
    console.log('Navigating to:', ['/movies', movieId, 'edit']); // Debug log
    this.router.navigate(['/movies', movieId, 'edit']);
  }
}

deleteMovie() {
  const movie = this.movie();
  if (!movie) return;

  if (confirm(`Are you sure you want to delete "${movie.title}"?`)) {
    this.movieService.deleteMovie(movie.movieId).subscribe({
      next: () => {
        this.showSuccess('Movie deleted successfully');
        this.router.navigate(['/manage-movies']);
      },
      error: (error) => {
        this.showError('Failed to delete movie');
      }
    });
  }
}




  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    const stars: string[] = [];
    for (let i = 0; i < fullStars; i++) stars.push('star');
    if (hasHalf) stars.push('star_half');
    for (let i = 0; i < emptyStars; i++) stars.push('star_border');
    
    return stars;
  }


  // Add this method to movie-detail.component.ts
getStarsForRating(rating: number): string[] {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  const stars: string[] = [];
  for (let i = 0; i < fullStars; i++) stars.push('star');
  if (hasHalf) stars.push('star_half');
  for (let i = 0; i < emptyStars; i++) stars.push('star_border');
  
  return stars;
}


  onRatingClick(rating: number) {
    if (!this.isAuthenticated) {
      this.showError('Please login to rate movies');
      return;
    }

    this.selectedRating.set(rating);
    this.submitRating(rating);
  }

  submitRating(rating: number) {
    const movieId = this.movie()?.movieId;
    if (!movieId) return;

    this.ratingLoading.set(true);
    const ratingData: CreateRatingRequest = { ratingValue: rating };

    this.movieService.addOrUpdateRating(movieId, ratingData).subscribe({
      next: () => {
        this.showSuccess(`Movie rated ${rating} stars!`);
        this.ratingLoading.set(false);
        // Refresh movie details to get updated rating
        this.loadMovieDetails(movieId);
      },
      error: (error) => {
        console.error('Error adding rating:', error);
        this.showError('Failed to add rating');
        this.ratingLoading.set(false);
      }
    });
  }

  // newly addded here
  onSubmitReview() {
  if (!this.reviewForm.valid || !this.isAuthenticated) return;

  const movieId = this.movie()?.movieId;
  if (!movieId) return;

  this.reviewLoading.set(true);
  const reviewData: CreateReviewRequest = {
    reviewText: this.reviewForm.value.reviewText.trim()
  };

  this.movieService.addReview(movieId, reviewData).subscribe({
    next: () => {
      this.showSuccess('Review added successfully!');
      this.reviewForm.reset();
      this.reviewLoading.set(false);
      // Refresh reviews with pagination (go to first page to see new review)
      this.loadReviews(movieId, 1);
    },
    error: (error) => {
      console.error('Error adding review:', error);
      const errorMsg = error.error?.message || 'Failed to add review. You may have already reviewed this movie.';
      this.showError(errorMsg);
      this.reviewLoading.set(false);
    }
  });
}


  goBack() {
    // this.router.navigate(['/manage-movies']);
    this.location.back();
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  // Add these pagination methods  for reviews  newly added here
loadReviews(movieId: number, page: number = 1) {
  this.reviewsLoading.set(true); // ✅ START LOADING

  this.movieService.getReviewsForMovie(movieId, page, 5).subscribe({
    next: (response) => {
      // Update the movie reviews with paginated data
     setTimeout(() => { 
      const currentMovie = this.movie();
      if (currentMovie) {
        const updatedMovie = {
          ...currentMovie,
          reviews: response.reviews
        };
        this.movie.set(updatedMovie);
        
        this.reviewsPagination.set({
          totalCount: response.totalCount,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages
        });
      }
      this.reviewsLoading.set(false); // ✅ STOP LOADING
      }, 600); // ✅ 600ms delay for smoother experience

    },
    error: (error) => {
      console.error('Error loading reviews:', error);
      this.showError('Failed to load reviews');
      this.reviewsLoading.set(false); // ✅ STOP LOADING ON ERROR
    }
  });
}

goToReviewPage(page: number) {
  const movieId = this.movie()?.movieId;
  if (movieId && page >= 1 && page <= this.reviewsPagination().totalPages) {
    this.loadReviews(movieId, page);
  }
}

goToNextReviewPage() {
  const currentPage = this.reviewsPagination().currentPage;
  if (currentPage < this.reviewsPagination().totalPages) {
    this.goToReviewPage(currentPage + 1);
  }
}

goToPreviousReviewPage() {
  const currentPage = this.reviewsPagination().currentPage;
  if (currentPage > 1) {
    this.goToReviewPage(currentPage - 1);
  }
}

// trackByReview(index: number, r: ReviewDto) { return r.reviewId; }


}


