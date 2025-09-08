



import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { MovieService, MovieSummary,PaginationInfo } from '../../../core/services/movie.service';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.scss']
})
export class MovieListComponent implements OnInit {
  private movieService = inject(MovieService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // State
  movies = signal<MovieSummary[]>([]);
  loading = signal(false);
  searchForm: FormGroup;

  // ADD THIS - Missing pagination property   delete if error
  paginationInfo = signal<PaginationInfo>({
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Genre options matching backend
  genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance',
    'Sci-Fi', 'Thriller', 'War', 'Western'
  ];

  constructor() {
    // Only create form with title field since that's what you're using
    this.searchForm = this.fb.group({
      title: ['']
    });
  }

  ngOnInit() {
    this.loadMovies();
  }

  get isAuthenticated(): boolean {
    return !!this.authService.token;
  }

  //working one
  // loadMovies() {
  //   this.loading.set(true);
  //   this.movieService.getAllMovies().subscribe({
  //     next: (movies) => {
  //       this.movies.set(movies);
  //       this.loading.set(false);
  //     },
  //     error: (error) => {
  //       console.error('Error loading movies:', error);
  //       this.showError('Failed to load movies');
  //       this.loading.set(false);
  //     }
  //   });
  // }


  // Update loadMovies method
loadMovies(page: number = 1) {
  this.loading.set(true);
  this.movieService.getAllMovies(page, 10).subscribe({
    next: (response) => {
      this.movies.set(response.movies); // Extract movies array from response
      this.paginationInfo.set({
        totalCount: response.totalCount,
        currentPage: response.currentPage,
        pageSize: response.pageSize,
        totalPages: response.totalPages
      });
      this.loading.set(false);
    },
    error: (error) => {
      console.error('Error loading movies:', error);
      this.showError('Failed to load movies');
      this.loading.set(false);
    }
  });
}


  // onSearch() {
  //   this.loading.set(true);
  //   const searchTerm = this.searchForm.get('title')?.value?.trim();
    
  //   if (searchTerm) {
  //     // Search using the single search term - your backend should handle searching 
  //     // across title, director, and genre with this single parameter
  //     this.movieService.searchMovies(searchTerm, '', '').subscribe({
  //       next: (movies) => {
  //         this.movies.set(movies);
  //         this.loading.set(false);
  //       },
  //       error: (error) => {
  //         console.error('Error searching movies:', error);
  //         this.showError('Search failed');
  //         this.loading.set(false);
  //       }
  //     });
  //   } else {
  //     // If search is empty, load all movies
  //     this.loadMovies();
  //   }
  // }

//working one
//   onSearch() {
//   this.loading.set(true);
//   const searchTerm = this.searchForm.get('title')?.value?.trim();
  
//   if (searchTerm) {
//     this.movieService.searchMovies(searchTerm).subscribe({
//       next: (movies) => {
//         this.movies.set(movies);
//         this.loading.set(false);
//       },
//       error: (error) => {
//         console.error('Error searching movies:', error);
//         this.showError('Search failed');
//         this.loading.set(false);
//       }
//     });
//   } else {
//     this.loadMovies();
//   }
// }



goToPage(page: number) {
  if (page >= 1 && page <= this.paginationInfo().totalPages) {
    const searchTerm = this.searchForm.get('title')?.value?.trim();
    if (searchTerm) {
      this.onSearch(page);
    } else {
      this.loadMovies(page);
    }
  }
}

goToNextPage() {
  const currentPage = this.paginationInfo().currentPage;
  if (currentPage < this.paginationInfo().totalPages) {
    this.goToPage(currentPage + 1);
  }
}

goToPreviousPage() {
  const currentPage = this.paginationInfo().currentPage;
  if (currentPage > 1) {
    this.goToPage(currentPage - 1);
  }
}

// Add Math to make it available in template
Math = Math;



// Update onSearch method
onSearch(page: number = 1) {
  this.loading.set(true);
  const searchTerm = this.searchForm.get('title')?.value?.trim();
  
  if (searchTerm) {
    this.movieService.searchMovies(searchTerm, page, 10).subscribe({
      next: (response) => {
        this.movies.set(response.movies); // Extract movies array from response
        this.paginationInfo.set({
          totalCount: response.totalCount,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.showError('Search failed');
        this.loading.set(false);
      }
    });
  } else {
    this.loadMovies(page);
  }
}


  clearSearch() {
    this.searchForm.reset();
    this.loadMovies();
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

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
