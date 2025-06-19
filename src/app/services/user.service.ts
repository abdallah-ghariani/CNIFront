import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { User } from "../models/user";
import { Page } from "../models/page";
import { Role } from "../models/roles";
const apiUrl = environment.BACKEND_URL + "api/users";
// Log the user service URL for debugging
console.log('User service URL:', apiUrl);

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(page: number = 0, size:number = 10, sort?: string, username?: string, role?: string, structureId?: string, secteurId?: string) {
    let params = new HttpParams().appendAll({page, size});
    if(sort)
      params = params.append("sort", sort);
    if(username)
      params = params.append("username", username);
    if(role)
      params = params.append("role", role);
    if(structureId)
      params = params.append("structureId", structureId);
    if(secteurId)
      params = params.append("secteurId", secteurId);
    
    console.log('Querying users with params:', params.toString());
    return this.http.get<Page<User>>(apiUrl, {params});
  }

  getUserById(id: string) {
    return this.http.get<User>(`${apiUrl}/${id}`);
  }

  addUser(user: { username: string; password: string; role: Role; structure?: string; secteur?: string }) {
    // Create a clean copy of the user object with only non-empty values
    const cleanUser: any = {
      username: user.username,
      password: user.password,
      role: user.role
    };

    // Map frontend field names to what the backend expects
    // Frontend has 'structure' but backend expects 'structureId'
    if (user.structure !== undefined && user.structure !== null && user.structure !== '') {
      // Validate structure ID has correct MongoDB ObjectID format (24 hex chars)
      if (/^[0-9a-f]{24}$/i.test(user.structure)) {
        // Use 'structureId' as expected by the backend
        cleanUser.structureId = user.structure;
        console.log('✓ Valid structure ID format - mapped to structureId');
      } else {
        console.warn('⚠️ Invalid structure ID format:', user.structure);
        // Still include it, but with the correct field name
        cleanUser.structureId = user.structure;
      }
    }

    // Frontend has 'secteur' but backend expects 'secteurId'
    if (user.secteur !== undefined && user.secteur !== null && user.secteur !== '') {
      // Validate secteur ID has correct MongoDB ObjectID format (24 hex chars)
      if (/^[0-9a-f]{24}$/i.test(user.secteur)) {
        // Use 'secteurId' as expected by the backend
        cleanUser.secteurId = user.secteur;
        console.log('✓ Valid secteur ID format - mapped to secteurId');
      } else {
        console.warn('⚠️ Invalid secteur ID format:', user.secteur);
        // Still include it, but with the correct field name
        cleanUser.secteurId = user.secteur;
      }
    }

    console.log('User service sending to API:', JSON.stringify(cleanUser, (key, value) => 
      key === 'password' ? '******' : value));
      
    return this.http.post<User>(apiUrl, cleanUser);
  }

  updateUser(id: string, user: User) {
    return this.http.put<User>(`${apiUrl}/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${apiUrl}/${id}`);
  }
}
