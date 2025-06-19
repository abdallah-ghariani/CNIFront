import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Role, mapLegacyRole } from './models/roles';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class consumerGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getLoggedInUser().pipe(
      map(user => {
        if (user) {
          // Support both new 'user' role and legacy roles by using the mapLegacyRole function
          const mappedRole = typeof user.role === 'string' ? mapLegacyRole(user.role) : user.role;
          
          // All users except admins can now access consumer features
          // We still allow admins access as well for convenience
          if (mappedRole === Role.user || mappedRole === Role.admin) {
            return true;
          }
        }
        
        // Redirect to login or home page if not logged in or unexpected role
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
