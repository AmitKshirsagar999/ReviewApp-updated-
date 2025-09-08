// import { CanActivateFn, Router } from '@angular/router';
// import { inject } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { map, catchError, switchMap, take } from 'rxjs/operators';
// import { AuthService } from '../auth/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   const redirectToLogin = (returnUrl: string) => {
//     router.navigate(['/login'], { queryParams: { returnUrl } });
//     return false;
//   };

//   // Check if token exists
//   const token = authService.token;
//   if (!token) {
//     return redirectToLogin(state.url);
//   }

//   // If token exists but not authenticated (expired)
//   if (!authService.isAuthenticated()) {
//     return redirectToLogin(state.url);
//   }

//   // Token is valid - now check if user data is available
//   return authService.currentUser$.pipe(
//     take(1), // Take only the first emission
//     switchMap(currentUser => {
//       if (currentUser) {
//         // User data already loaded
//         return of(true);
//       }
      
//       // User data not loaded - fetch it
//       return authService.getCurrentUser().pipe(
//         map(user => {
//           if (user) {
//             return true; // User data loaded successfully
//           }
//           return redirectToLogin(state.url);
//         }),
//         catchError(() => {
//           return of(redirectToLogin(state.url));
//         })
//       );
//     }),
//     catchError(() => {
//       return of(redirectToLogin(state.url));
//     })
//   );
// };






// import { CanActivateFn, Router } from '@angular/router';
// import { inject } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { AuthService } from '../auth/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   const redirectToLogin = (returnUrl: string): Observable<boolean> => {
//     router.navigate(['/login'], { queryParams: { returnUrl } });
//     return of(false);
//   };

//   const token = authService.token;
//   if (!token) {
//     return redirectToLogin(state.url);
//   }

//   if (!authService.isAuthenticated()) {
//     return redirectToLogin(state.url);
//   }

//   return of(true);
// };




// visual studio

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // User is logged in, allow access
  }

  // User is not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};

