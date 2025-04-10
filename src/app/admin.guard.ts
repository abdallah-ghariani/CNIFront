import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { map } from "rxjs";
import { Role } from "./models/roles";

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.getLoggedInUser().pipe(
    map((user) => {
      console.log(user); 
     if(user?.role === Role.admin)
        return true;
      return router.parseUrl('');
    })
  );
};
