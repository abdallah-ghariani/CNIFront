import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Role, mapLegacyRole } from './models/roles';
import { map } from 'rxjs';

export const providerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.getLoggedInUser().pipe(
    map(user => {
      if (user) {
        // Support both new 'user' role and legacy roles by using the mapLegacyRole function
        const mappedRole = typeof user.role === 'string' ? mapLegacyRole(user.role) : user.role;
        
        // All users except admins can now access provider features
        // We still allow admins access as well for management purposes
        if (mappedRole === Role.user || mappedRole === Role.admin) {
          return true;
        }
      }
      
      // If not logged in or unexpected role, redirect to home page
      router.navigate(['']);
      return false;
    })
  );
};
