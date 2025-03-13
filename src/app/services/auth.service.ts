import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Login } from '../models/login';
import { AuthResponse } from '../models/auth-response';
import { environment } from '../../environments/environment';
import { Signup } from '../models/signup';
import { shareReplay, tap } from 'rxjs';

const BACKEND_URL = environment.BACKEND_URL + "auth/"; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn() {
    localStorage.getItem("access_token");
    
  }
  
  constructor(private http: HttpClient) { }

  login(login: Login){
    return this.http.post<AuthResponse>(BACKEND_URL+'login',login)
    .pipe(
      shareReplay(),
      tap(response =>{ localStorage.setItem("access_token", response.token)})
    );
  }

  signup(signup: Signup){
    return this.http.post<AuthResponse>(BACKEND_URL+'register',signup);
  }

}