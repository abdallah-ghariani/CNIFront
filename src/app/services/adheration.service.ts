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
    //console.log(`Sending accept request for ID: ${id} to ${BACKEND_URL}accept/${id}`);
    
    // Define proper response type for consistent handling
    type AcceptResponse = {
      success: boolean;
      email?: string;
      error?: string;
      data?: any;
    };
    
    return this.http.post<any>(BACKEND_URL + `accept/${id}`, { message }).pipe(
     /* tap(response => {
        console.log('Raw backend response:', response);
      }),*/
      map(response => {
        // Just pass through the response data for component to handle
        if (response) {
          const result: AcceptResponse = {
            success: true,
            data: response
          };
          
          // Extract email from array or direct response
          if (Array.isArray(response)) {
            const acceptedRequest = response.find(req => req.id === id);
            if (acceptedRequest) {
              result.email = acceptedRequest.email;
            }
          } else if (response.email) {
            result.email = response.email;
          }
          
          return result;
        }
        return { success: false } as AcceptResponse;
      }),
      catchError(error => {
        //console.error('Error in acceptRequest:', error);
        const errorResponse: AcceptResponse = {
          success: false,
          error: error.message || 'Unknown error occurred',
          data: error
        };
        return of(errorResponse);
      }),
      shareReplay(1)
    );
  }


  refuseRequest(id: string, message?: string) {
    return this.http.post(BACKEND_URL + `refuse/${id}`, { message }).pipe(shareReplay());
  }

  deleteRequest(id: string) {
    return this.http.delete(BACKEND_URL + `delete/${id}`).pipe(shareReplay());
  }

  createRequest(name: string, email: string, structure: string, secteur: string, role: string, message?: string) {
    return this.http.post(BACKEND_URL + 'request', { name, email, structure, secteur, role, message }).pipe(
      shareReplay(),
      catchError(error => {
        console.error('Error creating adheration request:', error);
        return of({ success: false, error: error.message || 'An error occurred' });
      })
    );
  }
}