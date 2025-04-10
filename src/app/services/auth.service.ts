import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Login } from "../models/login";
import { AuthResponse } from "../models/auth-response";
import { environment } from "../../environments/environment";
<<<<<<< HEAD
//import { Signup } from '../models/signup';
import { catchError, map, Observable, of, shareReplay, switchMap, tap } from "rxjs";
=======
import { Signup } from '../models/signup';
import { catchError, map, of, shareReplay, tap } from "rxjs";
>>>>>>> 8a1db98e5894d0bdbaea46b367805ae039a22cb5
import { JwtHelperService } from "@auth0/angular-jwt";
import { Router } from "@angular/router";
import { JwtToken, User } from "../models/user";
import { Role } from "../models/roles";

const BACKEND_URL = environment.BACKEND_URL + "auth/";

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

  signup(signup: Signup){
    return this.http.post<AuthResponse>(BACKEND_URL+'register',signup);
  }

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
            this.router.navigate(["login"]);
            return of(null);
          })
        );
    return of(this.accessToken);
  }
}
