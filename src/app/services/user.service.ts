import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
const apiUrl =environment.BACKEND_URL+ 'users'; 

@Injectable({
  providedIn: 'root'

})
export class UserService {
  

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(apiUrl);
  }

  getUserById(id: string) {
    return this.http.get<User>(`${apiUrl}/${id}`);
  }

  addUser(user: User) {
    return this.http.post<User>(apiUrl, user);
  }

  updateUser(id: string, user: User) {
    return this.http.put<User>(`${apiUrl}/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${apiUrl}/${id}`);
  }
}
