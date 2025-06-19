import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Service } from '../models/service';

@Injectable({
  providedIn: 'root'
})
export class ServiceManagementService {
  // Fix the URL to avoid double slashes
  private apiUrl = `${environment.BACKEND_URL.endsWith('/') ? environment.BACKEND_URL.slice(0, -1) : environment.BACKEND_URL}/api/services`;

  constructor(private http: HttpClient) {
    // Log the service management URL for debugging
    console.log('Service management URL:', this.apiUrl);
  }

  getServices(page = 0, size = 10): Observable<{ content: Service[], totalElements: number }> {
    return this.http.get<{ content: Service[], totalElements: number }>(`${this.apiUrl}?page=${page}&size=${size}`);
  }
  
  // Get services in hierarchical format (main services with their sub-services)
  getServicesHierarchy(): Observable<Service[]> {
    return this.getServices(0, 1000).pipe(
      map(response => {
        if (!response.content) return [];
        
        // First, filter to get top-level services (those without parent IDs)
        const mainServices = response.content.filter(service => !service.parentId);
        
        // Then, add children to each main service
        mainServices.forEach(mainService => {
          mainService.children = response.content.filter(s => s.parentId === mainService.id);
          // Mark children as sub-services
          mainService.children.forEach(child => {
            child.isSubService = true;
          });
        });
        
        return mainServices;
      })
    );
  }
  
  // Get all sub-services for a given parent service
  getSubServices(parentId: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/sub/${parentId}`);
  }
  
  // Create a sub-service for a parent service
  createSubService(parentId: string, service: Service): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/${parentId}/sub`, service);
  }

  getService(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  createService(service: Service): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  updateService(id: string, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
