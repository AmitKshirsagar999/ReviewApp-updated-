// working one 

// import { Component ,inject} from '@angular/core';
// import { RouterLink , Router} from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../../core/auth/auth.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule,MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
//   templateUrl: './header.html',
//   styleUrls: ['./header.scss'],
// })
// export class HeaderComponent {
//    private authService = inject(AuthService); // Add this
//   private router = inject(Router); // Add this

//   // Add this getter
//   get isAuthenticated(): boolean {
//     return this.authService.isAuthenticated();
//   }

//   // Add this method
//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }


import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    RouterLink,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Check if user is authenticated
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

   // Check if current route is NOT home page
  get showHomeButton(): boolean {
    return this.router.url !== '/';
  }

  // Check if current route is NOT login page
  get showLoginButton(): boolean {
    return this.router.url !== '/login';
  }

  // Check if current route is NOT register page
  get showRegisterButton(): boolean {
    return this.router.url !== '/register';
  }

  // Get current user name for display
  get currentUsername(): string {
    return this.authService.currentUsername;
  }

  // Safe getter for current user (handles null)
  get currentUser() {
    return this.authService.currentUser;
  }

  // Safe getter for user email (handles null and undefined)
  get userEmail(): string | null {
    const user = this.currentUser;
    return user?.email && user.email.trim() ? user.email : null;
  }

  // Safe getter to check if user has email
  get hasUserEmail(): boolean {
    return !!this.userEmail;
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
