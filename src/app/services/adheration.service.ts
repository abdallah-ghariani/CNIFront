import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { catchError, map, of, shareReplay, tap } from "rxjs";
import { Adheration } from "../models/adheration";
import { EmailService } from "./email.service";

const BACKEND_URL = environment.BACKEND_URL + "api/adheration/";

@Injectable({
  providedIn: "root",
})
export class AdherationService {
  constructor(private http: HttpClient, private emailService: EmailService) {}

  getAdherationRequests() {
    return this.http.get<Adheration[]>(BACKEND_URL + "requests").pipe(shareReplay());
  }

  // Define response type interface
  acceptRequest(id: string, message?: string) {
    return this.http.post<{message: string, requestId: string}>(BACKEND_URL + `accept/${id}`, { message }).pipe(shareReplay());
  }


  refuseRequest(id: string, message?: string) {
    return this.http.post(BACKEND_URL + `refuse/${id}`, { message }).pipe(shareReplay());
  }

  deleteRequest(id: string) {
    return this.http.delete(BACKEND_URL + `delete/${id}`).pipe(shareReplay());
  }

  createRequest(name: string, structure: string, secteur: string, role: string, message?: string) {
    return this.http.post(BACKEND_URL + 'request', { name, structure, secteur, role, message }).pipe(
      shareReplay(),
      catchError(error => {
        console.error('Error creating adheration request:', error);
        return of({ success: false, error: error.message || 'An error occurred' });
      })
    );
  }
}