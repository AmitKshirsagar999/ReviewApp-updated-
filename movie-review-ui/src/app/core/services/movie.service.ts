import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

// Interface definitions
export interface MovieSummary {
  movieId: number;
  title: string;
  director: string;
  genre?: string;
  averageRating: number;
  reviewCount: number;
  createdDate: string;

  createdByUserId: string; // ← IMPORTANT: This must be included
  createdByUserName?: string;
  createdByUserEmail?: string;
}

export interface MovieDetail {
  movieId: number;
  title: string;
  director: string;
  genre?: string;
  description?: string;
  averageRating: number;
  reviewCount: number;
  createdDate: string;
  createdByUserName: string;
  reviews: ReviewDto[];
}

export interface ReviewDto {
  reviewId: number;
  reviewText: string;
  createdDate: string;
  userName: string;
  movieId: number;
  movieTitle: string;

  ratingValue?: number; // ✅ ADD THIS LINE
}

export interface RatingDto {
  ratingId: number;
  ratingValue: number;
  averageRating: number;
  createdDate: string;
  userName: string;
  movieId: number;
  movieTitle: string;
}

export interface CreateMovieRequest {
  title: string;
  director: string;
  genre?: string;
  description?: string;
}

export interface CreateReviewRequest {
  reviewText: string;
}

export interface CreateRatingRequest {
  ratingValue: number;
}

export interface UserProfileDto {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdDate: string;
  moviesAddedCount: number;
  reviewsCount: number;
  ratingsCount: number;
}


// Add these interfaces to your movie.service.ts
export interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  movies: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}


// Add this interface after your existing interfaces in movie.service.ts
export interface PaginatedReviewResponse {
  reviews: ReviewDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}


@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ===== MOVIE OPERATIONS =====

  /**
   * Get all movies with pagination
   */   //working
  // getAllMovies(page: number = 1, pageSize: number = 10): Observable<MovieSummary[]> {
  //   const params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('pageSize', pageSize.toString());
    
  //   return this.http.get<MovieSummary[]>(`${this.baseUrl}/movies`, { params });
  // }


/// delete if error
  getAllMovies(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<MovieSummary>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
  
  return this.http.get<PaginatedResponse<MovieSummary>>(`${this.baseUrl}/movies`, { params });
}

  /**
   * Get movie by ID with full details including reviews
   */
  getMovieById(id: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`${this.baseUrl}/movies/${id}`);
  }

  /**
   * Search movies by title, director, or genre
   */

// working
//   searchMovies(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<MovieSummary[]> {
//   let params = new HttpParams()
//     .set('page', page.toString())
//     .set('pageSize', pageSize.toString());
  
//   if (searchTerm?.trim()) {
    
//     params = params
//       .set('title', searchTerm.trim())
//       .set('director', searchTerm.trim())
//       .set('genre', searchTerm.trim());
//   }

//   return this.http.get<MovieSummary[]>(`${this.baseUrl}/movies/search`, { params });
// }

searchMovies(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<MovieSummary>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
  
  if (searchTerm?.trim()) {
    params = params
      .set('title', searchTerm.trim())
      .set('director', searchTerm.trim())
      .set('genre', searchTerm.trim());
  }

  return this.http.get<PaginatedResponse<MovieSummary>>(`${this.baseUrl}/movies/search`, { params });
}








  /**
   * Create a new movie (authenticated users only)
   */
  createMovie(movie: CreateMovieRequest): Observable<MovieDetail> {
    return this.http.post<MovieDetail>(`${this.baseUrl}/movies`, movie, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a movie (only the creator can update)
   */
  updateMovie(id: number, movie: CreateMovieRequest): Observable<MovieDetail> {
    return this.http.put<MovieDetail>(`${this.baseUrl}/movies/${id}`, movie, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a movie (only the creator can delete)
   */
  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/movies/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get movies added by the current user
   */
  getUserMovies(page: number = 1, pageSize: number = 10): Observable<MovieSummary[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<MovieSummary[]>(`${this.baseUrl}/movies/user`, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  // ===== REVIEW OPERATIONS =====

  /**
   * Get all reviews for a specific movie
   */
  // getReviewsForMovie(movieId: number, page: number = 1, pageSize: number = 10): Observable<ReviewDto[]> {
  //   const params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('pageSize', pageSize.toString());
    
  //   return this.http.get<ReviewDto[]>(`${this.baseUrl}/reviews/movie/${movieId}`, { params });
  // }

  // newly added method
  getReviewsForMovie(movieId: number, page: number = 1, pageSize: number =4): Observable<PaginatedReviewResponse> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
  
  return this.http.get<PaginatedReviewResponse>(`${this.baseUrl}/reviews/movie/${movieId}`, { params });
}

  /**
   * Add a review for a movie (authenticated users only)
   */
  addReview(movieId: number, review: CreateReviewRequest): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(`${this.baseUrl}/reviews/movie/${movieId}`, review, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a review (only the author can update)
   */
  updateReview(reviewId: number, review: CreateReviewRequest): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(`${this.baseUrl}/reviews/${reviewId}`, review, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a review (only the author can delete)
   */
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reviews/${reviewId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Check if the current user can review a specific movie
   */
  canUserReview(movieId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/reviews/can-review/${movieId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get reviews by the current user
   */
  getUserReviews(page: number = 1, pageSize: number = 10): Observable<ReviewDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<ReviewDto[]>(`${this.baseUrl}/reviews/user`, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  // ===== RATING OPERATIONS =====

  /**
   * Add or update a rating for a movie (authenticated users only)
   */
  addOrUpdateRating(movieId: number, rating: CreateRatingRequest): Observable<RatingDto> {
    return this.http.post<RatingDto>(`${this.baseUrl}/ratings/movie/${movieId}`, rating, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get the current user's rating for a specific movie
   */
  getUserRating(movieId: number): Observable<RatingDto> {
    return this.http.get<RatingDto>(`${this.baseUrl}/ratings/movie/${movieId}/user`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get average rating for a movie
   */
  getAverageRating(movieId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/ratings/movie/${movieId}/average`);
  }

  /**
   * Delete a rating (only the user who rated can delete)
   */
  deleteRating(movieId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/ratings/movie/${movieId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get ratings by the current user
   */
  getUserRatings(page: number = 1, pageSize: number = 10): Observable<RatingDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<RatingDto[]>(`${this.baseUrl}/ratings/user`, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  // ===== USER PROFILE OPERATIONS =====

  /**
   * Get current user's profile with statistics
   */
  getUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authService.token;
  }

  /**
   * Get current user's token
   */
  getCurrentUserToken(): string | null {
    return this.authService.token;
  }

  /**
   * Format rating as stars array for display
   */
  getStarsArray(rating: number): { type: 'full' | 'half' | 'empty' }[] {
    const stars: { type: 'full' | 'half' | 'empty' }[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push({ type: 'full' });
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push({ type: 'half' });
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push({ type: 'empty' });
    }

    return stars;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Validate rating value (1-5)
   */
  isValidRating(rating: number): boolean {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
  }

  /**
   * Get genre color for UI display
   */
  getGenreColor(genre: string): string {
    const colors: { [key: string]: string } = {
      'Action': '#ef4444',
      'Adventure': '#f97316',
      'Animation': '#eab308',
      'Comedy': '#84cc16',
      'Crime': '#22c55e',
      'Documentary': '#06b6d4',
      'Drama': '#3b82f6',
      'Family': '#8b5cf6',
      'Fantasy': '#a855f7',
      'Horror': '#e11d48',
      'Music': '#f59e0b',
      'Mystery': '#64748b',
      'Romance': '#ec4899',
      'Sci-Fi': '#10b981',
      'Thriller': '#6366f1',
      'War': '#dc2626',
      'Western': '#92400e'
    };
    
    return colors[genre] || '#64748b';
  }



  // Add this method to your existing MovieService class
getMoviesForGrid(
  page: number = 1, 
  pageSize: number = 10,
  sortBy: string = 'createdDate',
  sortOrder: string = 'desc',
  search?: string,
  genre?: string
): Observable<PaginatedResponse<MovieSummary>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString())
    .set('sortBy', sortBy)
    .set('sortOrder', sortOrder);

  if (search?.trim()) {
    params = params.set('search', search.trim());
  }
  if (genre?.trim() && genre !== 'all') {
    params = params.set('genre', genre.trim());
  }

  return this.http.get<PaginatedResponse<MovieSummary>>(`${this.baseUrl}/movies/grid`, { params });
}
}
