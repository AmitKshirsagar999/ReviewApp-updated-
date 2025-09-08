
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { MovieListComponent } from './features/movies/movie-list/movie-list';
import { MovieDetailComponent } from './features/movies/movie-detail/movie-detail';
import { AddMovieComponent } from './features/movies/add-movie/add-movie';
import { HomeComponent } from './features/home/home';
import { authGuard } from './core/guards/auth.guard';
import { MovieManagementComponent } from './features/movies/movie-management/movie-management';

export const routes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'movies', component: MovieListComponent },

  {
    path: 'manage-movies',component: MovieManagementComponent,canActivate: [authGuard] },
  

  // Protected Routes - require login
  { path: 'movies/add', component: AddMovieComponent,canActivate: [authGuard] },
    { path: 'movies/:id/edit', component: AddMovieComponent, canActivate: [authGuard] },
    { path: 'movies/:id', component: MovieDetailComponent, canActivate: [authGuard] }

];






