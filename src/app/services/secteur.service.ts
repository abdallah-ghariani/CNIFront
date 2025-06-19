import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Secteur } from "../models/secteur";
import { Page } from "../models/page";

const apiUrl = environment.BACKEND_URL + "api/secteurs";
// Log the secteur service URL for debugging
console.log('Secteur service URL:', apiUrl);

@Injectable({
  providedIn: "root",
})
export class SecteurService {
  constructor(private http: HttpClient) {}

  getSecteurs(page: number = 0, size: number = 10, sort?: string, name?: string) {
    let params = new HttpParams().appendAll({ page, size });
    if (sort) params = params.append("sort", sort);
    if (name) params = params.append("name", name);
    
    return this.http.get<Page<Secteur>>(apiUrl, { params });
  }

  getSecteurById(id: string) {
    return this.http.get<Secteur>(`${apiUrl}/${id}`);
  }

  addSecteur(secteur: { name: string }) {
    return this.http.post<Secteur>(apiUrl, secteur);
  }

  updateSecteur(id: string, secteur: Secteur) {
    return this.http.put<Secteur>(`${apiUrl}/${id}`, secteur);
  }

  deleteSecteur(id: string) {
    return this.http.delete<Secteur>(`${apiUrl}/${id}`);
  }
}
