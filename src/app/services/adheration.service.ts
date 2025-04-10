import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { catchError, map, of, shareReplay, tap } from "rxjs";
import { Adheration } from "../models/adheration";

const BACKEND_URL = environment.BACKEND_URL + "adheration/";

@Injectable({
  providedIn: "root",
})
export class AdherationService {
  constructor(private http: HttpClient) {}

  getAdherationRequests() {
    return this.http.get<Adheration[]>(BACKEND_URL + "requests").pipe(shareReplay());
  }

  acceptRequest(id: string, message?: string) {
    return this.http.post(BACKEND_URL + `accept/${id}`, { message }).pipe(shareReplay());
  }


  refuseRequest(id: string, message?: string) {
    return this.http.post(BACKEND_URL + `refuse/${id}`, { message }).pipe(shareReplay());
  }

  deleteRequest(id: string) {
    return this.http.delete(BACKEND_URL + `delete/${id}`).pipe(shareReplay());
  }
}