import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

const BACKEND_URL = environment.BACKEND_URL + 'email/';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private http: HttpClient) {}

  /**
   * Sends a password email to a user after their membership request has been approved
   * @param email The user's email address
   * @param username The user's username
   * @param password The generated password for the user
   * @returns Observable with the result of the email sending operation
   */
  sendPasswordEmail(email: string, username: string, password: string): Observable<any> {
    return this.http.post(BACKEND_URL + 'send-password', {
      email,
      username,
      password
    });
  }
}
