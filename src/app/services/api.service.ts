import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Page } from '../models/page';
import { Api } from '../models/api';
import { ApiRequest } from '../models/api-request';
import { Role } from '../models/roles';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * ApiService - Handles all API-related operations including:
 * - Fetching and filtering APIs
 * - Managing API requests (creation and access)
 * - Handling approval workflows
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // API Endpoints
  private readonly endpoints = {
    // Core API endpoints
    api: `${environment.BACKEND_URL}api/api`,
    
    // API request endpoints
    apiRequest: `${environment.BACKEND_URL}api/api-request`,
    apiCreationRequest: `${environment.BACKEND_URL}api/api-creation-request`,
    // The api-access-request endpoint doesn't exist on the backend
    // Use apiRequest endpoint instead for API access requests
    adminRequests: `${environment.BACKEND_URL}api/admin/requests`,
    
    // Support endpoints
    structures: `${environment.BACKEND_URL}structures`,
    services: `${environment.BACKEND_URL}services`,
    secteurs: `${environment.BACKEND_URL}api/secteurs`
  };
  
  // Cache for names to avoid repeated lookups
  private structureNameCache: {[id: string]: string} = {};
  private serviceNameCache: {[id: string]: string} = {};
  private secteurNameCache: {[id: string]: string} = {};
  
  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('ApiService initialized with endpoints:', this.endpoints);
  }

  // Helper method to get auth options for authenticated requests
  private getAuthOptions(): { withCredentials: boolean, headers: HttpHeaders } {
    // Get token from localStorage instead of trying to use the Observable directly
    const token = localStorage.getItem('jwt_token');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Add Authorization header with JWT token if available
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return {
      withCredentials: true,  // Keep this for cookie-based auth as backup
      headers: headers
    };
  }

  /**
   * Get APIs with optional filtering parameters
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @param globalFilter Global search term
   * @param structure Filter by structure ID
   * @param sectorId Filter by sector ID (preferred over providerId)
   * @param serviceId Filter by service ID
   * @param sortField Field to sort by
   * @param sortOrder Sort order ('asc' or 'desc')
   * @param name Filter by API name
   * @param secteur Filter by secteur (legacy, prefer sectorId)
   * @param description Filter by description
   * @param updatedAt Filter by last updated date
   * @returns Page of APIs matching the filters
   */
  getApis(
    page: number = 0,
    size: number = 10,
    globalFilter?: string | null,
    structure?: string | null,
    sectorId?: string | null,
    serviceId?: string | null,
    sortField?: string | null,
    sortOrder?: string | null,
    name?: string | null,
    secteur?: string | null,
    description?: string | null,
    updatedAt?: string | null
  ): Observable<Page<Api>> {
    // Build query parameters
    let params = new HttpParams().appendAll({ page, size });
    
    // Add optional filters if provided
    if (globalFilter) params = params.append('search', globalFilter);
    if (structure) params = params.append('structure', structure);
    if (sortField && sortOrder) params = params.append('sort', `${sortField},${sortOrder}`);
    if (name) params = params.append('name', name);
    if (secteur) params = params.append('secteur', secteur);
    if (description) params = params.append('description', description);
    if (updatedAt) params = params.append('updatedAt', updatedAt);
    
    // Handle sector and service filters
    if (sectorId) {
      params = params.append('sectorId', sectorId);
      
      // Validate MongoDB ObjectId format
      if (!/^[0-9a-f]{24}$/i.test(sectorId)) {
        console.warn(`Warning: sectorId '${sectorId}' doesn't match MongoDB ObjectId format`);
      }
    }
    
    if (serviceId) {
      params = params.append('serviceId', serviceId);
      
      // Validate MongoDB ObjectId format
      if (!/^[0-9a-f]{24}$/i.test(serviceId)) {
        console.warn(`Warning: serviceId '${serviceId}' doesn't match MongoDB ObjectId format`);
      }
    }
    
    // Standard API request
    return this.http.get<Page<Api>>(this.endpoints.api, { params });
  }



  /**
   * Get a specific API by UUID
   * @param uuid API UUID
   * @returns Observable of the API
   */
  getApiByCode(uuid: string): Observable<Api> {
    return this.http.get<Api>(`${this.endpoints.api}/code/${uuid}`, this.getAuthOptions());
  }

  /**
   * Get API request details by ID
   * @param requestId The ID of the request to retrieve
   * @returns Observable of the API request details
   */
  getApiRequestDetails(requestId: string): Observable<ApiRequest> {
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    return this.http.get<ApiRequest>(
      `${this.endpoints.apiRequest}/${requestId}`,
      this.getAuthOptions()
    );
  }

  /**
   * Get all API requests for the current user's sector with pagination
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @param status Optional status filter
   * @returns Observable of paginated API requests
   */
  getSectorApiRequests(page: number = 0, size: number = 10, status?: string): Observable<Page<ApiRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<Page<ApiRequest>>(
      `${this.endpoints.apiRequest}/sector`,
      { ...this.getAuthOptions(), params }
    );
  }

  /**
   * Get current user's API requests with pagination
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @param status Optional status filter
   * @returns Observable of paginated API requests
   */
  getMyApiRequests(page: number = 0, size: number = 10, status?: string): Observable<Page<ApiRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<Page<ApiRequest>>(
      `${this.endpoints.apiRequest}/my-requests`,
      { ...this.getAuthOptions(), params }
    );
  }

  /**
   * Get only API creation requests made by the current user
   * This filters out API usage requests to only show requests for creating new APIs
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @param status Optional status filter
   * @returns Observable of paginated API creation requests
   */
  getMyApiCreationRequests(page: number = 0, size: number = 10, status?: string): Observable<Page<ApiRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('type', 'CREATION'); // Only get creation requests, not usage requests
  
    if (status) {
      params = params.set('status', status);
    }
  
    // Use the specific endpoint for API creation requests
    return this.http.get<Page<ApiRequest>>(
      `${this.endpoints.apiCreationRequest}/my-requests`,
      { ...this.getAuthOptions(), params }
    );
  }

  /**
   * Get all API requests (admin endpoint) with pagination
   * This is primarily used as a fallback when my-requests endpoint returns no data
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @param status Optional status filter
   * @returns Observable of paginated API requests
   */
  getAllApiRequests(page: number = 0, size: number = 10, status?: string): Observable<Page<ApiRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<Page<ApiRequest>>(
      `${this.endpoints.apiRequest}`, 
      { ...this.getAuthOptions(), params }
    ).pipe(
      catchError(error => {
        console.error('Error getting all API requests:', error);
        // Create a properly formed Page object
        return of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageable: {
            pageNumber: 0,
            pageSize: size,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            paged: true,
            unpaged: false
          },
          last: true,
          size: size,
          number: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          first: true,
          numberOfElements: 0,
          empty: true
        } as Page<ApiRequest>);
      })
    );
  }
  
  /**
   * Get pending API creation requests (specifically for dashboard)
   * This uses the dedicated endpoint for pending creation requests
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @returns Observable of paginated API creation requests with PENDING status
   */
  getPendingApiCreationRequests(page: number = 0, size: number = 10): Observable<Page<ApiRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<ApiRequest>>(
      `${environment.BACKEND_URL}api/api-creation-request/pending`, 
      { ...this.getAuthOptions(), params }
    ).pipe(
      catchError(error => {
        console.error('Error getting pending API creation requests:', error);
        // Create a properly formed Page object
        return of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageable: {
            pageNumber: 0,
            pageSize: size,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            paged: true,
            unpaged: false
          },
          last: true,
          size: size,
          number: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          first: true,
          numberOfElements: 0,
          empty: true
        } as Page<ApiRequest>);
      })
    );
  }

  /**
   * Approve an API usage request (admin only)
   * @param requestId Request ID to approve
   * @param feedback Optional feedback message
   * @returns Observable of the approved API request
   */
  approveApiUsageRequest(requestId: string, feedback: string = 'API usage request approved'): Observable<ApiRequest> {
    if (!requestId) throw new Error('Request ID is required for API usage approval');
    
    const body = { 
      timestamp: new Date().toISOString(),
      feedback
    };
      
    return this.http.put<ApiRequest>(
      `${this.endpoints.apiRequest}/${requestId}/approve`, 
      body, 
      this.getAuthOptions()
    ).pipe(
      catchError(error => {
        // Convert 404 errors to a more specific error
        if (error.status === 404) {
          throw new Error('API request not found. It may have been already processed or deleted.');
        }
        throw error;
      })
    );
  }


  
  /**
   * Get details of a specific API creation request (admin only)
   * @param requestId Request ID to get details for
   * @returns Observable of the API creation request details
   */
  getApiCreationRequestDetails(requestId: string): Observable<ApiRequest> {
    if (!requestId) throw new Error('Request ID is required');
    
    return this.http.get<ApiRequest>(
      `${this.endpoints.adminRequests}/creation/${requestId}`,
      this.getAuthOptions()
    );
  }
  
  /**
   * Reject an API usage request (admin only)
   * @param requestId Request ID to reject
   * @param feedback Feedback message explaining the rejection
   * @returns Observable of the rejected API request
   */
  rejectApiUsageRequest(requestId: string, feedback: string): Observable<ApiRequest> {
    if (!requestId) throw new Error('Request ID is required for API usage rejection');
    if (!feedback) throw new Error('Feedback is required when rejecting an API request');
    
    const body = { 
      timestamp: new Date().toISOString(),
      feedback
    };
      
    return this.http.put<ApiRequest>(
      `${this.endpoints.apiRequest}/${requestId}/reject`, 
      body, 
      this.getAuthOptions()
    ).pipe(
      catchError(error => {
        // Convert 404 errors to a more specific error
        if (error.status === 404) {
          throw new Error('API request not found. It may have been already processed or deleted.');
        }
        throw error;
      })
    );
  }

  /**
   * Request access to an existing API
   * @param apiId API ID to request access to
   * @param formData Request details
   * @returns Observable of the created API request
   */
  requestApiAccess(apiId: string, formData: any): Observable<ApiRequest> {
    // Basic validation
    if (!apiId) {
      throw new Error('API ID is required when requesting API access');
    }
    
    // Build the request payload
    const payload = {
      apiId: apiId,
      name: formData.name || '',
      email: formData.email || '',
      reason: formData.reason || '',
      description: formData.description || '',
      structure: formData.structure || '',
      secteur: formData.secteur || '',
      requestType: 'access',
      requestDate: new Date().toISOString()
    };
    
    // Submit the request
    return this.http.post<ApiRequest>(
      `${this.endpoints.apiRequest}/access`, 
      payload, 
      this.getAuthOptions()
    );
  }

  /**
   * Get all pending API creation requests (admin view)
   * @returns Observable of pending API creation requests in the system
   */
  getAdminApiRequests(): Observable<ApiRequest[]> {
    return this.http.get<ApiRequest[]>(
      `${this.endpoints.adminRequests}/pending-creation`,
      this.getAuthOptions()
    );
  }
  
  /**
   * @deprecated Use getAdminApiRequests() instead
   * This method is kept for backward compatibility
   */
  getUserApiRequests(): Observable<ApiRequest[]> {
    console.warn('getUserApiRequests is deprecated. Use getAdminApiRequests instead.');
    return this.getAdminApiRequests();
  }

  /**
   * Approve an API access request
   * @param requestId Request ID to approve
   * @returns Observable of the approved API request
   */
  approveApiAccessRequest(requestId: string | undefined): Observable<ApiRequest> {
    if(!requestId) throw new Error('Request ID is required for approval');
    
    // Simple body with timestamp
    const body = { timestamp: new Date().toISOString() };
    
    return this.http.put<ApiRequest>(
      `${this.endpoints.apiRequest}/access/${requestId}/approve`, 
      body, 
      this.getAuthOptions()
    );
  }

  /**
   * Reject an API access request
   * @param requestId Request ID to reject
   * @returns Observable of the rejected API request
   */
  rejectApiAccessRequest(requestId: string | undefined): Observable<ApiRequest> {
    if(!requestId) throw new Error('Request ID is required for rejection');
    
    // Simple body with timestamp
    const body = { timestamp: new Date().toISOString() };
    
    return this.http.put<ApiRequest>(
      `${this.endpoints.apiRequest}/access/${requestId}/reject`, 
      body, 
      this.getAuthOptions()
    );
  }
  
  /**
   * Submit a new API creation request
   * @param api The API to create/publish
   * @param details Additional details about the request and requester
   * @returns Observable of the created API request
   */
  submitApiRequest(api: Api, details?: { 
    reason?: string, 
    requesterName?: string, 
    requesterEmail?: string,
    // Additional fields that may be passed from the component
    secteur?: string,
    structure?: string,
    service?: string,
    apiName?: string,
    message?: string
  }): Observable<ApiRequest> {
    // Validate that we're creating a new API, not requesting access
    if (api.id) {
      console.warn('submitApiRequest should only be used for new API creation. Use requestApiAccess for existing APIs.');
    }
    
    console.log('Submitting API creation request with data:', { api, details });
    
    // Extract endpoint details for the first endpoint (if available)
    let endpointMethod = 'GET';
    let endpointPath = '';
    let endpointDescription = '';
    let pathParameters: any[] = [];
    let authRequired = false;
    let authMethods: string[] = [];
    let responseCodes: any[] = [];
    let exampleRequest = '';
    
    // Process endpoint information if available
    if (api.endpoints && api.endpoints.length > 0) {
      const firstEndpoint = api.endpoints[0];
      
      // Check if it's a structured ApiEndpoint object
      if (typeof firstEndpoint !== 'string') {
        endpointMethod = firstEndpoint.method || 'GET';
        endpointPath = firstEndpoint.path || '';
        endpointDescription = firstEndpoint.description || '';
        pathParameters = firstEndpoint.parameters || [];
        authRequired = firstEndpoint.requiresAuth || false;
        authMethods = firstEndpoint.authMethods || [];
        responseCodes = firstEndpoint.responses || [];
      } else {
        // It's a string endpoint, try to extract method and path
        if (firstEndpoint.includes(':')) {
          const parts = firstEndpoint.split(':', 2);
          endpointMethod = parts[0].trim();
          endpointPath = parts[1]?.trim() || '';
        } else {
          endpointPath = firstEndpoint;
        }
        endpointDescription = `Endpoint for ${api.name}`;
      }
      
      // Create example request if not provided
      if (!exampleRequest && endpointPath) {
        exampleRequest = `curl -X ${endpointMethod} ${authRequired ? '-H \'Authorization: Bearer YOUR_TOKEN\' ' : ''}${api.baseUrl || ''}${endpointPath}`;
      }
    }
    
    // Build the request payload with a flat structure (no nested properties)
    // Using 'any' type to allow dynamic properties like inputExample and outputExample
    const apiRequestDTO: any = {
      // Request metadata
      requestType: 'create',
      requestDate: new Date().toISOString(),
      
      // User information
      name: details?.requesterName || '',
      email: details?.requesterEmail || '',
      
      // API details (flat structure)
      apiName: api.name || details?.apiName || 'Unnamed API',
      description: api.description || '',
      baseUrl: api.baseUrl || '',
      version: api.version || '1.0',
      requiresAuth: api.requiresAuth || false,
      authType: api.authType || '',
      documentation: api.documentation || '',
      
      // Organization fields
      secteur: api.secteur || details?.secteur || '',
      structure: api.structure || details?.structure || '',
      service: api.service || details?.service || '',
      
      // Message/reason for the request
      message: details?.message || details?.reason || 'New API creation request',
      reason: details?.reason || 'New API creation request',
      
      // Endpoint details
      endpointMethod: endpointMethod || 'GET',
      endpointPath: endpointPath || '/api/resource',
      endpointDescription: endpointDescription || `Endpoint for ${api.name || 'API'}`,
      pathParameters: pathParameters && pathParameters.length > 0 ? pathParameters : [],
      authRequired: authRequired !== undefined ? authRequired : false,
      authMethods: authMethods && authMethods.length > 0 ? authMethods : [],
      responseCodes: responseCodes && responseCodes.length > 0 ? responseCodes : [
        { statusCode: '200', description: 'Success', resource: 'Result' }
      ],
      
      // Example data
      exampleRequest: exampleRequest || `curl -X ${endpointMethod || 'GET'} ${api.baseUrl || ''}${endpointPath || '/api/resource'}`
    };
    
    // Add any additional API details that might be needed
    if (api.inputExamples && api.inputExamples.length > 0) {
      apiRequestDTO.inputExample = api.inputExamples[0];
    }
    
    if (api.outputExamples && api.outputExamples.length > 0) {
      apiRequestDTO.outputExample = api.outputExamples[0];
    }
    
    console.log('Final payload being sent to backend:', apiRequestDTO);

    return this.http.post<ApiRequest>(
      `${this.endpoints.apiCreationRequest}/new-api`,
      apiRequestDTO, 
      this.getAuthOptions()
    );
  }
  
  // ... (rest of the code remains the same)
  // rejectApiRequest method consolidated above
  
  /**
   * Get approved APIs for the current user's sector with pagination
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @returns Observable of paginated approved APIs for the user's sector
   */
  getMyApis(page: number = 0, size: number = 10): Observable<Page<Api>> {
    console.log('Fetching approved APIs for current user sector');
    
    // Use the new endpoint with pagination
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Api>>(
      `${environment.BACKEND_URL}api/api/approved/my-sector`,
      { ...this.getAuthOptions(), params }
    ).pipe(
      catchError(error => {
        console.error('Error fetching approved APIs:', error);
        // Return an empty page with the same structure on error
        return of({
          content: [],
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: {
              empty: true,
              sorted: false,
              unsorted: true
            },
            offset: page * size,
            paged: true,
            unpaged: false
          },
          last: true,
          totalElements: 0,
          totalPages: 0,
          size: size,
          number: page,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true
          },
          first: page === 0,
          numberOfElements: 0,
          empty: true
        });
      })
    );
  }
  
  /**
   * @deprecated Use getMyApiRequests(page, size, status) with pagination instead
   * Get all API requests made by the current user
   * @returns Observable of API requests made by current user
   */
  getMyApiRequestsLegacy(): Observable<ApiRequest[]> {
    console.warn('getMyApiRequestsLegacy is deprecated. Use getMyApiRequests(page, size, status) instead.');
    return this.http.get<ApiRequest[]>(
      `${this.endpoints.apiRequest}/my`, 
      this.getAuthOptions()
    );
  }
  
  /**
   * Get pending API access requests for the current user's sector
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @returns Observable of paginated pending API access requests for the user's sector
   */
  getPendingApiRequests(page: number = 0, size: number = 10): Observable<Page<ApiRequest>> {
    console.log(`Fetching pending API access requests for sector (page ${page}, size ${size})...`);
    
    const params = new HttpParams()
      .set('status', 'PENDING') // Using UPPERCASE to match MongoDB document format
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<ApiRequest>>(
      `${this.endpoints.apiRequest}/sector`,
      { ...this.getAuthOptions(), params }
    ).pipe(
      tap(() => console.log('Successfully fetched pending API requests for sector')),
      catchError(error => {
        console.error('Error fetching pending API requests for sector:', error);
        // Return an empty page on error with all required Page interface properties
        const emptyPage: Page<ApiRequest> = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: size,
          number: page,
          first: true,
          last: true,
          empty: true,
          pageable: {
            sort: {
              empty: true,
              sorted: false,
              unsorted: true
            },
            offset: page * size,
            pageNumber: page,
            pageSize: size,
            paged: true,
            unpaged: false
          },
          sort: {
            empty: true,
            sorted: false,
            unsorted: true
          },
          numberOfElements: 0
        };
        return of(emptyPage);
      })
    );
  }

  /**
   * Get approved APIs for the current user
   * @returns Observable of approved API access requests
   */
  getUserApprovedApis(): Observable<ApiRequest[]> {
    return this.http.get<Page<ApiRequest>>(
      `${this.endpoints.apiRequest}/approved/my`,
      this.getAuthOptions()
    ).pipe(
      map(response => {
        console.log('Approved APIs response:', response);
        // Extract the content array from the paginated response
        return response && response.content ? response.content : [];
      }),
      catchError(error => {
        console.error('Error fetching approved APIs:', error);
        return of([]);
      })
    );
  }



  /**
   * Get API statistics (like total count, etc.)
   * @returns Observable of API statistics
   */
  getApiStats(): Observable<any> {
    return this.http.get(`${this.endpoints.api}/stats`, this.getAuthOptions());
  }
  
  /**
   * Approve a new API creation request (admin only)
   * @param requestId Request ID to approve
   * @param feedback Optional feedback message
   * @returns Observable of the approved API request
   */
  approveNewApiRequest(requestId: string, feedback: string = 'New API request approved'): Observable<ApiRequest> {
    if (!requestId) throw new Error('Request ID is required for new API approval');
    
    return this.http.put<ApiRequest>(
      `${this.endpoints.adminRequests}/creation/${requestId}/approve`,
      { 
        timestamp: new Date().toISOString(),
        feedback
      },
      this.getAuthOptions()
    ).pipe(
      catchError(error => {
        // Convert 404 errors to a more specific error
        if (error.status === 404) {
          throw new Error('API request not found. It may have been already processed or deleted.');
        }
        throw error;
      })
    );
  }
  
  /**
   * Reject a new API creation request (admin only)
   * @param requestId Request ID to reject
   * @param feedback Feedback message explaining the rejection
   * @returns Observable of the rejected API request
   */
  rejectNewApiRequest(requestId: string, feedback: string): Observable<ApiRequest> {
    if (!requestId) throw new Error('Request ID is required for new API rejection');
    if (!feedback) throw new Error('Feedback is required when rejecting an API request');
    
    return this.http.put<ApiRequest>(
      `${this.endpoints.adminRequests}/creation/${requestId}/reject`,
      { 
        timestamp: new Date().toISOString(),
        feedback
      },
      this.getAuthOptions()
    ).pipe(
      catchError(error => {
        // Convert 404 errors to a more specific error
        if (error.status === 404) {
          throw new Error('API request not found. It may have been already processed or deleted.');
        }
        throw error;
      })
    );
  }
  
  // Method already defined above - removing duplicate

  /**
   * Get the name of a structure using its ID
   * @param structureId Structure ID
   * @returns Observable of structure name
   */
  getStructureName(structureId: string): Observable<string> {
    // Return from cache if available
    if (this.structureNameCache[structureId]) {
      return new Observable<string>(observer => {
        observer.next(this.structureNameCache[structureId]);
        observer.complete();
      });
    }

    // Otherwise, fetch from API
    return this.http.get<any>(`${this.endpoints.structures}/${structureId}`).pipe(
      map(response => {
        const name = response?.name || 'Unknown Structure';
        this.structureNameCache[structureId] = name;
        return name;
      }),
      catchError(error => {
        console.error('Error fetching structure name:', error);
        return new Observable<string>(observer => {
          observer.next('Unknown Structure');
          observer.complete();
        });
      })
    );
  }

  /**
   * Get the name of a service using its ID
   * @param serviceId Service ID
   * @returns Observable of service name
   */
  getServiceName(serviceId: string): Observable<string> {
    // Return from cache if available
    if (this.serviceNameCache[serviceId]) {
      return new Observable<string>(observer => {
        observer.next(this.serviceNameCache[serviceId]);
        observer.complete();
      });
    }

    // Otherwise, fetch from API
    return this.http.get<any>(`${this.endpoints.services}/${serviceId}`).pipe(
      map(response => {
        const name = response?.name || 'Unknown Service';
        this.serviceNameCache[serviceId] = name;
        return name;
      }),
      catchError(error => {
        console.error('Error fetching service name:', error);
        return new Observable<string>(observer => {
          observer.next('Unknown Service');
          observer.complete();
        });
      })
    );
  }

  /**
   * Get the name of a sector using its ID
   * @param secteurId Sector ID
   * @returns Observable of sector name
   */
  getSecteurName(secteurId: string): Observable<string> {
    // Return from cache if available
    if (this.secteurNameCache[secteurId]) {
      return new Observable<string>(observer => {
        observer.next(this.secteurNameCache[secteurId]);
        observer.complete();
      });
    }

    // Otherwise, fetch from API
    return this.http.get<any>(`${this.endpoints.secteurs}/${secteurId}`).pipe(
      map(response => {
        const name = response?.name || 'Unknown Sector';
        this.secteurNameCache[secteurId] = name;
        return name;
      }),
      catchError(error => {
        console.error('Error fetching secteur name:', error);
        return new Observable<string>(observer => {
          observer.next('Unknown Sector');
          observer.complete();
        });
      })
    );
  }

  /**
   * @deprecated Use getAdminApiRequests() instead
   * This method will be removed in future versions.
   * @returns Observable of provider API requests
   */
  getProviderApiRequests(): Observable<ApiRequest[]> {
    console.warn('getProviderApiRequests is deprecated. Use getAdminApiRequests instead.');
    return this.getAdminApiRequests();
  }
}
