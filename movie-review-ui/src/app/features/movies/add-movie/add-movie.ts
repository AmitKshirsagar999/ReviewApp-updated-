
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MovieService, CreateMovieRequest, MovieDetail } from '../../../core/services/movie.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Location } from '@angular/common';  // ✅ ADD this import

@Component({
  selector: 'app-add-movie',
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
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-movie.html',
  styleUrls: ['./add-movie.scss']
})
export class AddMovieComponent implements OnInit {
  private movieService = inject(MovieService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  private location = inject(Location);  // ✅ ADD THIS LINE

  // State
  loading = signal(false);
  movieForm!: FormGroup;
  
  // Edit mode properties
  isEditMode = signal(false);
  movieId: number | null = null;
  currentMovie = signal<MovieDetail | null>(null);

  // Genre options matching backend
  genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance',
    'Sci-Fi', 'Thriller', 'War', 'Western'
  ];

  constructor() {
    // Check authentication
    if (!this.authService.token) {
      this.router.navigate(['/login']);
      return;
    }

    // Initialize form
    this.movieForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      director: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      genre: [''],
      description: ['', Validators.maxLength(1000)]
    });


    
  }

  ngOnInit() {
    // Check if we're in edit mode
    const movieIdParam = this.route.snapshot.paramMap.get('id');
    if (movieIdParam) {
      this.movieId = +movieIdParam;
      this.isEditMode.set(true);
      this.loadMovieForEdit(this.movieId);
    }
  }

  get isFormValid(): boolean {
    return this.movieForm.valid;
  }

  get pageTitle(): string {
    return this.isEditMode() ? 'Edit Movie' : 'Add New Movie';
  }

  get pageSubtitle(): string {
    return this.isEditMode() 
      ? 'Update movie information' 
      : 'Share your favorite movie with the community';
  }

  get submitButtonText(): string {
    return this.isEditMode() ? 'Update Movie' : 'Add Movie';
  }

  loadMovieForEdit(movieId: number) {
    this.loading.set(true);
    this.movieService.getMovieById(movieId).subscribe({
      next: (movie) => {
        this.currentMovie.set(movie);
        
        // Pre-fill the form with existing movie data
        this.movieForm.patchValue({
          title: movie.title,
          director: movie.director,
          genre: movie.genre || '',
          description: movie.description || ''
        });
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.showError('Failed to load movie details');
        this.router.navigate(['/movies']);
        this.loading.set(false);
      }
    });
  }


  
// working
  // onSubmit() {
  //   if (!this.isFormValid || this.loading()) return;

  //   this.loading.set(true);

  //   const movieData: CreateMovieRequest = {
  //     title: this.movieForm.value.title.trim(),
  //     director: this.movieForm.value.director.trim(),
  //     genre: this.movieForm.value.genre || undefined,
  //     description: this.movieForm.value.description?.trim() || undefined
  //   };

  //   if (this.isEditMode() && this.movieId) {
  //     // Update existing movie
  //     this.movieService.updateMovie(this.movieId, movieData).subscribe({
  //       next: (updatedMovie) => {
  //         this.showSuccess(`"${updatedMovie.title}" has been updated successfully!`);
  //         this.loading.set(false);
  //         // Navigate back to the updated movie's detail page
  //         this.router.navigate(['/movies', updatedMovie.movieId]);
  //       },
  //       error: (error) => {
  //         console.error('Error updating movie:', error);
  //         const errorMsg = error.error?.message || 'Failed to update movie. Please try again.';
  //         this.showError(errorMsg);
  //         this.loading.set(false);
  //       }
  //     });
  //   } else {
  //     // Create new movie (existing logic)
  //     this.movieService.createMovie(movieData).subscribe({
  //       next: (newMovie) => {
  //         this.showSuccess(`"${newMovie.title}" has been added successfully!`);
  //         this.loading.set(false);
  //         // Navigate to the new movie's detail page
  //         this.router.navigate(['/movies', newMovie.movieId]);
  //       },
  //       error: (error) => {
  //         console.error('Error adding movie:', error);
  //         const errorMsg = error.error?.message || 'Failed to add movie. Please try again.';
  //         this.showError(errorMsg);
  //         this.loading.set(false);
  //       }
  //     });
  //   }
  // }


onSubmit() {
  if (!this.isFormValid || this.loading()) return;

  this.loading.set(true);

  const movieData: CreateMovieRequest = {
    title: this.movieForm.value.title.trim(),
    director: this.movieForm.value.director.trim(),
    genre: this.movieForm.value.genre || undefined,
    description: this.movieForm.value.description?.trim() || undefined
  };

  if (this.isEditMode() && this.movieId) {
    // Update existing movie - go to movie detail page
    this.movieService.updateMovie(this.movieId, movieData).subscribe({
      next: (updatedMovie) => {
        this.showSuccess(`"${updatedMovie.title}" has been updated successfully!`);
        this.loading.set(false);
        // ✅ FIXED: Navigate to movie detail page
        this.router.navigate(['/movies', updatedMovie.movieId]);
      },
      error: (error) => {
        console.error('Error updating movie:', error);
        const errorMsg = error.error?.message || 'Failed to update movie. Please try again.';
        this.showError(errorMsg);
        this.loading.set(false);
      }
    });
  } else {
    // Create new movie - go to manage movies page
    this.movieService.createMovie(movieData).subscribe({
      next: (newMovie) => {
        this.showSuccess(`"${newMovie.title}" has been added successfully!`);
        this.loading.set(false);
        // ✅ CORRECT: Navigate to manage movies page
        this.router.navigate(['/manage-movies']);
      },
      error: (error) => {
        console.error('Error adding movie:', error);
        const errorMsg = error.error?.message || 'Failed to add movie. Please try again.';
        this.showError(errorMsg);
        this.loading.set(false);
      }
    });
  }
}








  onCancel() {
    if (this.isEditMode() && this.movieId) {
      // Go back to movie details if editing
      this.router.navigate(['/movies', this.movieId]);
    } else {
      // Go back to movies list if adding
      // this.router.navigate(['/manage-movies']);

      // ✅ CHANGE THIS: Go back to previous URL if adding
    this.location.back();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.movieForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    
    return 'Invalid input';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.movieForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Title',
      'director': 'Director', 
      'genre': 'Genre',
      'description': 'Description'
    };
    return labels[fieldName] || fieldName;
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
}
