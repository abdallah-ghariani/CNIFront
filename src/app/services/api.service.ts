import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Page } from '../models/page';
import { Api } from '../models/api';

const apiUrl = environment.BACKEND_URL + "api/"; 

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getApis(
    page: number = 0,
    size: number = 10,
    sort?: string,
    secteur?: string,
    srtucture?:string,
    availability?: number
  ) {
    let params = new HttpParams().appendAll({ page, size });
    if (sort) {
      params = params.append('sort', sort);
    }
    if (secteur) {
      params = params.append('secteur', secteur);
    }
    if (srtucture) {
        params = params.append('structure', srtucture);
      }
    if (availability) {
      params = params.append('availability', availability.toString());
    }
    return this.http.get<Page<Api>>(apiUrl, { params });
  }

  getApiById(id: string) {
    return this.http.get<Api>(`${apiUrl}/${id}`);
  }
}