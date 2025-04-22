import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedAsync().pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        // Redirect to login page
        router.navigate(['/login']);
      }
    })
  );
};

export const publicOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedAsync().pipe(
    map(isAuthenticated => !isAuthenticated),
    tap(isPublicOnly => {
      if (!isPublicOnly) {
        // Redirect to dashboard if already logged in
        router.navigate(['/dashboard']);
      }
    })
  );
};