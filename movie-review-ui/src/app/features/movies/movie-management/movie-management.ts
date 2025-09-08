import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MovieService, MovieSummary, PaginationInfo } from '../../../core/services/movie.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-movie-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './movie-management.html',
  styleUrls: ['./movie-management.scss']
})
export class MovieManagementComponent implements OnInit {
  
  Math = Math;
  
  movies = signal<MovieSummary[]>([]);
  loading = signal(false);
  
  paginationInfo = signal<PaginationInfo>({
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0
  });

  currentSort = signal<{sortBy: string, sortOrder: string}>({
    sortBy: 'createdDate',
    sortOrder: 'desc'
  });

  displayedColumns: string[] = ['title', 'director', 'genre', 'averageRating', 'reviewCount', 'createdDate', 'createdBy', 'actions'];
  
  searchControl = new FormControl('');

  genreControl = new FormControl('All'); 

   genres = ['All','Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Fantasy', 'Adventure'];


  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMovies();
    
   
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadMovies(1);
    });

    this.genreControl.valueChanges.subscribe(() => {
      this.loadMovies(1);
    });
  }

  private minLoadingTime = 500; // Minimum loading time in ms

loadMovies(page: number = this.paginationInfo().currentPage) {
  this.loading.set(true);
  const startTime = Date.now();
  
  const search = this.searchControl.value || '';


   const genreValue = this.genreControl.value ?? 'All';
   const genre = genreValue === 'All' ? undefined : genreValue;



  const sort = this.currentSort();
  
  this.movieService.getMoviesForGrid(
    page,
    this.paginationInfo().pageSize,
    sort.sortBy,
    sort.sortOrder,
    search,
    genre 
  ).subscribe({
    next: (response) => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, this.minLoadingTime - elapsed);
      
      setTimeout(() => {
        this.movies.set(response.movies);
        this.paginationInfo.set({
          totalCount: response.totalCount,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages
        });
        this.loading.set(false);
      }, remaining);
    },
    error: (error) => {
      console.error('Error loading movies:', error);
      setTimeout(() => {
        this.loading.set(false);
      }, Math.max(0, this.minLoadingTime - (Date.now() - startTime)));
    }
  });
}


  onSort(sortBy: string) {
    const currentSort = this.currentSort();
    let sortOrder = 'asc';
    
    if (currentSort.sortBy === sortBy && currentSort.sortOrder === 'asc') {
      sortOrder = 'desc';
    }
    
    this.currentSort.set({ sortBy, sortOrder });
    this.loadMovies(1);
  }

  onPageChange(page: number) {
    this.loadMovies(page);
  }

  viewMovie(movieId: number) {
    this.router.navigate(['/movies', movieId]);
  }

  editMovie(movieId: number) {
    this.router.navigate(['/movies', movieId, 'edit'], { 
      queryParams: { source: 'grid' } 
    });
  }

  addMovie() {
  this.router.navigate(['/movies/add']); 
}

  deleteMovie(movieId: number) {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(movieId).subscribe({
        next: () => {
          this.loadMovies();
        },
        error: (error) => {
          console.error('Error deleting movie:', error);
        }
      });
    }
  }


  // RESTORED: Your original getSortIcon method
  getSortIcon(column: string): string {
    const currentSort = this.currentSort();
    if (currentSort.sortBy !== column) return 'unfold_more';
    return currentSort.sortOrder === 'asc' ? 'expand_less' : 'expand_more';
  }

  // UPDATED: Check if current user can edit/delete specific movie
  canEditMovie(movie: MovieSummary): boolean {
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    
    // Get current user ID from auth service
    const currentUserId = this.authService.getCurrentUserId();
    
    // Only show edit/delete if current user created this movie
    return currentUserId === movie.createdByUserId;
  }
}












// import { Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { FormControl, ReactiveFormsModule } from '@angular/forms';

// // Angular Material imports
// import { MatCardModule } from '@angular/material/card';
// import { MatTableModule } from '@angular/material/table';
// import { MatSortModule } from '@angular/material/sort';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// import { MovieService, MovieSummary, PaginationInfo } from '../../../core/services/movie.service';
// import { AuthService } from '../../../core/auth/auth.service';

// @Component({
//   selector: 'app-movie-management',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatTableModule,
//     MatSortModule,
//     MatPaginatorModule,
//     MatButtonModule,
//     MatIconModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatProgressSpinnerModule
//   ],
//   templateUrl: './movie-management.html',
//   styleUrls: ['./movie-management.scss']
// })
// export class MovieManagementComponent implements OnInit {
  
//   Math = Math;
  
//   movies = signal<MovieSummary[]>([]);
//   loading = signal(false);
  
//   paginationInfo = signal<PaginationInfo>({
//     totalCount: 0,
//     currentPage: 1,
//     pageSize: 10,
//     totalPages: 0
//   });

//   currentSort = signal<{sortBy: string, sortOrder: string}>({
//     sortBy: 'createdDate',
//     sortOrder: 'desc'
//   });

//   displayedColumns: string[] = ['title', 'director', 'genre', 'averageRating', 'reviewCount', 'createdDate', 'createdBy', 'actions'];
  
//   searchControl = new FormControl('');

//   constructor(
//     private movieService: MovieService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadMovies();
//   }

//   private minLoadingTime = 500;

//   // ✅ SIMPLE: Use same logic as MovieList
//   onSearch(page: number = 1) {
//     this.loading.set(true);
//     const startTime = Date.now();
//     const searchTerm = this.searchControl.value?.trim();
    
//     if (searchTerm) {
//       this.movieService.searchMovies(searchTerm, page, 10).subscribe({
//         next: (response) => {
//           const elapsed = Date.now() - startTime;
//           const remaining = Math.max(0, this.minLoadingTime - elapsed);
          
//           setTimeout(() => {
//             this.movies.set(response.movies);
//             this.paginationInfo.set({
//               totalCount: response.totalCount,
//               currentPage: response.currentPage,
//               pageSize: response.pageSize,
//               totalPages: response.totalPages
//             });
//             this.loading.set(false);
//           }, remaining);
//         },
//         error: (error) => {
//           console.error('Error searching movies:', error);
//           setTimeout(() => {
//             this.loading.set(false);
//           }, Math.max(0, this.minLoadingTime - (Date.now() - startTime)));
//         }
//       });
//     } else {
//       this.loadMovies(page);
//     }
//   }

//   loadMovies(page: number = 1) {
//     this.loading.set(true);
//     const startTime = Date.now();
    
//     this.movieService.getAllMovies(page, 10).subscribe({
//       next: (response) => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(0, this.minLoadingTime - elapsed);
        
//         setTimeout(() => {
//           this.movies.set(response.movies);
//           this.paginationInfo.set({
//             totalCount: response.totalCount,
//             currentPage: response.currentPage,
//             pageSize: response.pageSize,
//             totalPages: response.totalPages
//           });
//           this.loading.set(false);
//         }, remaining);
//       },
//       error: (error) => {
//         console.error('Error loading movies:', error);
//         setTimeout(() => {
//           this.loading.set(false);
//         }, Math.max(0, this.minLoadingTime - (Date.now() - startTime)));
//       }
//     });
//   }

//   onSort(sortBy: string) {
//     const currentSort = this.currentSort();
//     let sortOrder = 'asc';
    
//     if (currentSort.sortBy === sortBy && currentSort.sortOrder === 'asc') {
//       sortOrder = 'desc';
//     }
    
//     this.currentSort.set({ sortBy, sortOrder });
//     this.loadMovies(1);
//   }

//   onPageChange(page: number) {
//     const searchTerm = this.searchControl.value?.trim();
//     if (searchTerm) {
//       this.onSearch(page);
//     } else {
//       this.loadMovies(page);
//     }
//   }

//   viewMovie(movieId: number) {
//     this.router.navigate(['/movies', movieId]);
//   }

//   editMovie(movieId: number) {
//     this.router.navigate(['/movies', movieId, 'edit'], { 
//       queryParams: { source: 'grid' } 
//     });
//   }

//   addMovie() {
//     this.router.navigate(['/movies/add']); 
//   }

//   deleteMovie(movieId: number) {
//     if (confirm('Are you sure you want to delete this movie?')) {
//       this.movieService.deleteMovie(movieId).subscribe({
//         next: () => {
//           const searchTerm = this.searchControl.value?.trim();
//           if (searchTerm) {
//             this.onSearch();
//           } else {
//             this.loadMovies();
//           }
//         },
//         error: (error) => {
//           console.error('Error deleting movie:', error);
//         }
//       });
//     }
//   }

//   getSortIcon(column: string): string {
//     const currentSort = this.currentSort();
//     if (currentSort.sortBy !== column) return 'unfold_more';
//     return currentSort.sortOrder === 'asc' ? 'expand_less' : 'expand_more';
//   }

//   canEditMovie(movie: MovieSummary): boolean {
//     if (!this.authService.isAuthenticated()) {
//       return false;
//     }
    
//     const currentUserId = this.authService.getCurrentUserId();
//     return currentUserId === movie.createdByUserId;
//   }
// }




