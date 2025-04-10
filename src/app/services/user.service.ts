import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { User } from "../models/user";
import { Page } from "../models/page";
import { Role } from "../models/roles";
const apiUrl = environment.BACKEND_URL + "users";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(page: number = 0, size: number = 10, sort?: string, username?: string, role?: string) {
    let params = new HttpParams().appendAll({ page, size });
    if (sort) params = params.append("sort", sort);
    if (username) params = params.append("username", username);
    if (role) params = params.append("role", role);
    return this.http.get<Page<User>>(apiUrl, { params });
  }

  getUserById(id: string) {
    return this.http.get<User>(`${apiUrl}/${id}`);
  }

  addUser(user: { username: string; password: string; role: Role }) {
    return this.http.post<User>(apiUrl, user);
  }

  updateUser(id: string, user: User) {
    return this.http.put<User>(`${apiUrl}/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${apiUrl}/${id}`);
  }
}