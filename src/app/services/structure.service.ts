import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Structure } from '../models/structure';
import { Page } from '../models/page';

const apiUrl = environment.BACKEND_URL + 'api/structures';
// Log the structure service URL for debugging
console.log('Structure service URL:', apiUrl);

@Injectable({
  providedIn: 'root',
})
export class StructureService {
  constructor(private http: HttpClient) {}

  getStructures(page: number = 0, size: number = 10, sort?: string, name?: string) {
    let params = new HttpParams().appendAll({ page, size });
    if (sort) params = params.append('sort', sort);
    if (name) params = params.append('name', name);
    
    return this.http.get<Page<Structure>>(apiUrl, { params });
  }

  getStructureById(id: string) {
    return this.http.get<Structure>(`${apiUrl}/${id}`);
  }

  addStructure(structure: { name: string }) {
    return this.http.post<Structure>(apiUrl, structure);
  }

  updateStructure(id: string, structure: Structure) {
    return this.http.put<Structure>(`${apiUrl}/${id}`, structure);
  }

  deleteStructure(id: string) {
    return this.http.delete<Structure>(`${apiUrl}/${id}`);
  }
}
