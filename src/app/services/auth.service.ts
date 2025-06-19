import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Login } from "../models/login";
import { AuthResponse } from "../models/auth-response";
import { environment } from "../../environments/environment";
//import { Signup } from '../models/signup';
import { catchError, map, Observable, of, shareReplay, switchMap, tap } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Router } from "@angular/router";
import { JwtToken, User } from "../models/user";
import { Role, mapLegacyRole } from "../models/roles";

const BACKEND_URL = environment.BACKEND_URL + "api/auth/";
// Log the auth URL for debugging
console.log('Auth URL:', BACKEND_URL);

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private accessToken: string | null = null;

  constructor(
    private http: HttpClient,
    private jwt: JwtHelperService,
    private router: Router
  ) {}
  
  // Methods to check user roles - updated for new role system
  // All regular users are both providers and consumers
  /*isUserProvider(): boolean {
    let isRegularUser = false;
    this.getLoggedInUser().subscribe(user => {
      if (user) {
        // Support both new 'user' role and legacy roles by using the mapLegacyRole function
        const mappedRole = typeof user.role === 'string' ? mapLegacyRole(user.role) : user.role;
        if (mappedRole === Role.user) {
          isRegularUser = true;
        }
      }
    });
    return isRegularUser;
  }
  
  isUserConsumer(): boolean {
    let isRegularUser = false;
    this.getLoggedInUser().subscribe(user => {
      if (user) {
        // Support both new 'user' role and legacy roles by using the mapLegacyRole function
        const mappedRole = typeof user.role === 'string' ? mapLegacyRole(user.role) : user.role;
        if (mappedRole === Role.user) {
          isRegularUser = true;
        }
      }
    });
    return isRegularUser;
  }
  
  // New helper method - checks if user is authenticated (non-admin)
  isRegularUser(): boolean {
    let isUser = false;
    this.getLoggedInUser().subscribe(user => {
      if (user && user.role !== Role.admin) {
        isUser = true;
      }
    });
    return isUser;
  }*/

  login(login: Login) {
    return this.http.post<AuthResponse>(BACKEND_URL + "login", login,{withCredentials:true}).pipe(
      shareReplay(),
      tap((response) => {
        this.accessToken = response.token;
      }),
      switchMap( _ => this.getLoggedInUser()),
    );
  }

  logout() {
    return this.http
      .post<void>(BACKEND_URL + "logout", null,{withCredentials:true})
      .pipe(tap((_) => (this.accessToken = null)));
  }

  /*signup(signup: Signup){
    return this.http.post<AuthResponse>(BACKEND_URL+'register',signup);
  }*/

  getLoggedInUser():Observable<JwtToken|undefined|null> {
    if (this.accessToken) {
      return of(this.jwt.decodeToken<JwtToken>(this.accessToken));
    }
    return this.getToken().pipe(map(token => {
      if(token)
        return this.jwt.decodeToken<JwtToken>(token)
      return undefined;
    }));
  }

  getToken() {
    if (this.jwt.isTokenExpired(this.accessToken))
      return this.http
        .post<AuthResponse>(BACKEND_URL + "refreshToken", null,{withCredentials:true})
        .pipe(
          shareReplay(),
          map((response) => response.token),
          tap((token) => (this.accessToken = token)),
          catchError((_) => {
            //this.router.navigate(["login"]);
            return of(null);
          })
        );
    return of(this.accessToken);
  }
  
  // Get the role of the currently logged-in user
  getCurrentUserRole(): Role | undefined {
    // If we have a token in memory, decode it and return the role
    if (this.accessToken) {
      const decodedToken = this.jwt.decodeToken<JwtToken>(this.accessToken);
      return decodedToken?.role;
    }
    return undefined;
  }
  
  // Check if the user is logged in
  isLoggedIn(): boolean {
    return !!this.accessToken && !this.jwt.isTokenExpired(this.accessToken);
  }
  
  // Get the username of the currently logged-in user
  getCurrentUsername(): string | undefined {
    if (this.accessToken) {
      const decodedToken = this.jwt.decodeToken<JwtToken>(this.accessToken);
      return decodedToken?.username || decodedToken?.email || undefined;
    }
    
    // Otherwise, return undefined
    return undefined;
  }
}
