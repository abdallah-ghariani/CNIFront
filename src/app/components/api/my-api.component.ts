import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { StructureService } from '../../services/structure.service';
import { SecteurService } from '../../services/secteur.service';
import { ServiceManagementService } from '../../services/service.service';
import { Api } from '../../models/api';
import { ApiRequest } from '../../models/api-request';
import { Page } from '../../models/page';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { AvatarModule } from 'primeng/avatar';
import { environment } from '../../../environments/environment';

// Import the role model
import { Role } from '../../models/roles';

@Component({
  selector: 'app-my-api',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    ToastModule,
    DialogModule,
    CardModule,
    DropdownModule,
    TabViewModule,
    InputSwitchModule,
    BadgeModule,
    TagModule,
    PaginatorModule,
    AvatarModule
  ],
  providers: [MessageService],
  templateUrl: './my-api.component.html',
  styleUrls: ['./my-api.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyApiComponent implements OnInit, OnDestroy {
  // Maps for storing structure, sector, and service names by ID
  private structureMap: Map<string, string> = new Map();
  private sectorMap: Map<string, string> = new Map();
  private serviceMap: Map<string, string> = new Map();
  
  // Keep track of IDs we're already fetching to avoid duplicate requests
  private fetchingStructureIds: Set<string> = new Set();
  private fetchingSectorIds: Set<string> = new Set();
  private fetchingServiceIds: Set<string> = new Set();
  /**
   * Cleanup when component is destroyed
   */
  ngOnDestroy(): void {
    // Cleanup subscriptions when component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }
  // Maps for readable sector and structure names
  // User information from JWT token
  userId: string = '';
  userName: string = '';
  userEmail: string = '';
  userRole: Role | null = null;
  userStructure: string = '';
  userSector: string = '';
  userStructureId: string = '';
  userSectorId: string = '';
  
  // Helper property to check if user has admin privileges
  get hasAdminPrivileges(): boolean {
    return this.userRole === Role.admin || this.userEmail.includes('admin');
  }
  
  /**
   * Get structure name from ID
   */
  getStructureName(structureId: string | undefined): string {
    if (!structureId) return 'Not specified';
    
    // First check if we have this ID in our mapping
    const mappedName = this.structureMap.get(structureId);
    if (mappedName) {
      return mappedName;
    }
    
    // Try to find the structure in our loaded structures array
    const structure = this.structures.find(s => s.id === structureId);
    if (structure) {
      // Store in map for future use
      this.structureMap.set(structureId, structure.name);
      return structure.name;
    }
    
    // If we can't find it and it's a MongoDB ID, fetch it from the service
    if (/^[0-9a-f]{24}$/i.test(structureId)) {
      // Trigger an async fetch but return a placeholder for now
      this.fetchStructureName(structureId);
      return 'Loading...';
    }
    
    // Return the user's structure as fallback
    if (this.userStructure) {
      return this.userStructure;
    }
    
    return 'Ministry of Interior - Civil Status';
  }
  
  /**
   * Filter APIs based on search text
   * Use this to search for existing APIs before creating a new one
   */
  filterApis(): void {
    if (!this.searchText.trim()) {
      this.filteredApis = [...this.myApis];
      return;
    }
    
    const searchLower = this.searchText.toLowerCase().trim();
    this.filteredApis = this.myApis.filter(api => {
      return (
        (api.name && api.name.toLowerCase().includes(searchLower)) ||
        (api.description && api.description.toLowerCase().includes(searchLower)) ||
        (api.secteur && api.secteur.toLowerCase().includes(searchLower)) ||
        (api.service && api.service.toLowerCase().includes(searchLower))
      );
    });
    
    console.log(`Found ${this.filteredApis.length} APIs matching "${searchLower}"`);
    
    // If no results found, suggest creating a new API
    if (this.filteredApis.length === 0 && this.searchText.trim().length > 2) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Existing APIs Found',
        detail: `No APIs found matching "${this.searchText}". You may want to request a new API.`,
        life: 5000
      });
    }
  }
  
  /**
   * Clear the API search
   */
  clearSearch(): void {
    this.searchText = '';
    this.filteredApis = [...this.myApis];
  }
  
  /**
   * Get sector name from ID
   */
  getSectorName(sectorId: string | undefined): string {
    if (!sectorId) return 'Not specified';
    
    // First check if we have this ID in our mapping
    const mappedName = this.sectorMap.get(sectorId);
    if (mappedName) {
      return mappedName;
    }
    
    // Try to find the sector in our loaded sectors array
    const sector = this.sectors.find(s => s.id === sectorId);
    if (sector) {
      // Store in map for future use
      this.sectorMap.set(sectorId, sector.name);
      return sector.name;
    }
    
    // If we can't find it and it's a MongoDB ID, fetch it from the service
    if (/^[0-9a-f]{24}$/i.test(sectorId)) {
      // Trigger an async fetch but return a placeholder for now
      this.fetchSectorName(sectorId);
      return 'Loading...';
    }
    
    // Return the user's sector as fallback
    if (this.userSector) {
      return this.userSector;
    }
    
    return 'Civil Status and Official Documents';
  }
  
  /**
   * Get service name from ID
   */
  getServiceName(serviceId: string | undefined): string {
    if (!serviceId) return 'Not specified';
    
    // First check if we have this ID in our mapping
    const mappedName = this.serviceMap.get(serviceId);
    if (mappedName) {
      return mappedName;
    }
    
    // Try to find the service in our loaded services array
    const service = this.services.find(s => s.id === serviceId);
    if (service) {
      // Store in map for future use
      this.serviceMap.set(serviceId, service.name);
      return service.name;
    }
    
    // If we can't find it and it's a MongoDB ID, fetch it from the service
    if (/^[0-9a-f]{24}$/i.test(serviceId)) {
      // Trigger an async fetch but return a placeholder for now
      this.fetchServiceName(serviceId);
      return 'Loading...';
    }
    
    // Default specific to API type if possible
    if (this.selectedApi && this.selectedApi.name) {
      if (this.selectedApi.name.toLowerCase().includes('nationality')) {
        return 'Nationality Certificate Service';
      }
    }
    
    return 'Nationality Certificate Service';
  }
  // Loading flag for API data
  loading: boolean = true;
  // API list properties
  myApis: Api[] = [];
  filteredApis: Api[] = [];
  selectedApi: Api | null = null;
  totalItems = 0; // Total number of APIs
  searchText: string = '';  // For API search
  // API Requests data
  myApiRequests: ApiRequest[] = [];
  loadingRequests = false;
  totalRequests = 0;
  requestPage = 1;
  requestsPerPage = 5;
  requestSearchText = '';
  
  // Computed properties for request filtering
  get filteredApiRequests(): ApiRequest[] {
    if (!this.requestSearchText) {
      return this.myApiRequests;
    }
    
    const searchTerm = this.requestSearchText.toLowerCase().trim();
    return this.myApiRequests.filter(req => 
      (req.apiName?.toLowerCase().includes(searchTerm) || req.apiId?.toLowerCase().includes(searchTerm)) ||
      req.structure?.toLowerCase().includes(searchTerm) ||
      req.secteur?.toLowerCase().includes(searchTerm) ||
      req.service?.toLowerCase().includes(searchTerm) ||
      req.status?.toLowerCase().includes(searchTerm)
    );
  }
  
  get pendingRequestsCount(): number {
    return this.myApiRequests.filter(req => req.status === 'pending').length;
  }
  
  get approvedRequestsCount(): number {
    return this.myApiRequests.filter(req => req.status === 'approved').length;
  }
  
  get rejectedRequestsCount(): number {
    return this.myApiRequests.filter(req => req.status === 'rejected').length;
  }
  
  // Pagination
  page = 1; // 1-based for UI
  itemsPerPage = 10;
  globalFilter = '';
  
  // Make Math available to the template
  Math = Math;
  
  // API request related properties
  displayApiRequestSection = false;
  // selectedApi is already defined above
  requestInProgress = false;
  requestType: 'access' | 'new' | 'modify' = 'new'; // Default to new API request
  
  // API details properties
  apiDetailsVisible = false;
  selectedApiDetails: Api | null = null;
  
  // Form model for API requests
  requestForm: any = {
    // Requester details
    name: '',
    email: '',
    structure: '',
    secteur: '',
    service: '',
    
    // API details
    apiName: '',
    description: '',
    apiVersion: 'v1',
    baseUrl: '',
    requiresAuth: false,
    authType: 'Bearer Token',
    apiKey: ''
  };
  
  // Endpoint array for structured endpoint data
  endpoints: any[] = [];
  
  // Selected authentication method for the dropdown
  selectedAuthMethod: string = '';
  
  // HTTP methods dropdown options
  httpMethods = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PATCH', value: 'PATCH' }
  ];
  
  // Authentication methods dropdown options
  authMethods = [
    { label: 'Bearer Token', value: 'Bearer Token' },
    { label: 'API Key', value: 'API Key' },
    { label: 'OAuth 2.0', value: 'OAuth 2.0' },
    { label: 'Basic Auth', value: 'Basic Auth' }
  ];
  
  // Lists for input/output examples
  inputExamples: string[] = [];
  outputExamples: string[] = [];
  
  // Endpoint management methods
  addEndpoint() {
    this.endpoints.push({
      method: 'GET',
      path: '',
      description: '',
      parameters: [],
      responses: [
        // Initialize with standard response codes
        {
          statusCode: '200',
          description: 'Success',
          resource: 'Response data'
        },
        {
          statusCode: '400',
          description: 'Bad Request',
          resource: 'Error message'
        }
      ],
      requiresAuth: false,
      authMethods: [] // Add authMethods array
    });
  }
  
  removeEndpoint(index: number) {
    if (index >= 0 && index < this.endpoints.length) {
      this.endpoints.splice(index, 1);
    }
    
    // Always ensure at least one endpoint exists
    if (this.endpoints.length === 0) {
      this.addEndpoint();
    }
  }
  
  // Parameter management methods
  addParameter(endpointIndex: number) {
    if (endpointIndex >= 0 && endpointIndex < this.endpoints.length) {
      this.endpoints[endpointIndex].parameters.push({
        name: '',
        type: 'string',
        description: '',
        required: false
      });
    }
  }
  
  removeParameter(endpointIndex: number, paramIndex: number) {
    if (endpointIndex >= 0 && endpointIndex < this.endpoints.length &&
        paramIndex >= 0 && paramIndex < this.endpoints[endpointIndex].parameters.length) {
      this.endpoints[endpointIndex].parameters.splice(paramIndex, 1);
    }
  }
  
  // Response management methods
  addResponse(endpointIndex: number) {
    if (endpointIndex >= 0 && endpointIndex < this.endpoints.length) {
      this.endpoints[endpointIndex].responses.push({
        statusCode: '200',
        description: 'Success',
        resource: ''
      });
    }
  }
  
  removeResponse(endpointIndex: number, responseIndex: number) {
    if (endpointIndex >= 0 && endpointIndex < this.endpoints.length &&
        responseIndex >= 0 && responseIndex < this.endpoints[endpointIndex].responses.length) {
      this.endpoints[endpointIndex].responses.splice(responseIndex, 1);
    }
  }
  
  // Helper method to check if an endpoint is a string (for backward compatibility)
  isString(value: any): boolean {
    return typeof value === 'string';
  }
  
  // Helper method to safely get endpoints as an array for template rendering
  getEndpoints(api: Api): any[] {
    if (!api || !api.endpoints) return [];
    return api.endpoints as any[];
  }
  
  // Update authentication methods for an endpoint
  updateAuthMethods(endpointIndex: number, value: string): void {
    if (!this.endpoints[endpointIndex].authMethods) {
      this.endpoints[endpointIndex].authMethods = [];
    }
    
    // Clear existing methods and add the selected one
    this.endpoints[endpointIndex].authMethods = [value];
    
    // Also update authType for backward compatibility
    this.endpoints[endpointIndex].authType = value;
    
    console.log(`Updated auth methods for endpoint ${endpointIndex}:`, this.endpoints[endpointIndex].authMethods);
  }
  
  // Predefined templates for input and output examples
  inputTemplates = [
    { label: 'Select Template...', value: '' },
    { label: 'GET Request', value: 'GET /api/resources/{id}\nHeaders:\n  Authorization: Bearer {token}\n  Accept: application/json' },
    { label: 'POST Request', value: 'POST /api/resources\nHeaders:\n  Authorization: Bearer {token}\n  Content-Type: application/json\n  Accept: application/json\n\nBody:\n{\n  "name": "string",\n  "description": "string",\n  "status": "active"\n}' },
    { label: 'PUT Request', value: 'PUT /api/resources/{id}\nHeaders:\n  Authorization: Bearer {token}\n  Content-Type: application/json\n  Accept: application/json\n\nBody:\n{\n  "name": "string",\n  "description": "string",\n  "status": "active"\n}' },
    { label: 'DELETE Request', value: 'DELETE /api/resources/{id}\nHeaders:\n  Authorization: Bearer {token}' }
  ];
  
  outputTemplates = [
    { label: 'Select Template...', value: '' },
    { label: 'Success Response (200)', value: '200 OK\nContent-Type: application/json\n\n{\n  "id": "string",\n  "name": "string",\n  "description": "string",\n  "status": "active",\n  "createdAt": "2023-01-01T12:00:00Z",\n  "updatedAt": "2023-01-01T12:00:00Z"\n}' },
    { label: 'Created Response (201)', value: '201 Created\nContent-Type: application/json\n\n{\n  "id": "string",\n  "name": "string",\n  "description": "string",\n  "status": "active",\n  "createdAt": "2023-01-01T12:00:00Z"\n}' },
    { label: 'Error Response (400)', value: '400 Bad Request\nContent-Type: application/json\n\n{\n  "error": "Bad Request",\n  "message": "Invalid request parameters",\n  "timestamp": "2023-01-01T12:00:00Z",\n  "path": "/api/resources"\n}' },
    { label: 'Error Response (401)', value: '401 Unauthorized\nContent-Type: application/json\n\n{\n  "error": "Unauthorized",\n  "message": "Authentication credentials are missing or invalid",\n  "timestamp": "2023-01-01T12:00:00Z",\n  "path": "/api/resources"\n}' },
    { label: 'Error Response (404)', value: '404 Not Found\nContent-Type: application/json\n\n{\n  "error": "Not Found",\n  "message": "Resource with id {id} not found",\n  "timestamp": "2023-01-01T12:00:00Z",\n  "path": "/api/resources/{id}"\n}' }
  ];
  
  // Currently selected template
  selectedInputTemplate = '';
  selectedOutputTemplate = '';
  
  // Form validation tracking
  fieldErrors: { [key: string]: boolean } = {
    name: false,
    email: false,
    structure: false,
    secteur: false,
    service: false,
    apiName: false,
    baseUrl: false,
    description: false
  };
  
  // Dropdown data
  structures: any[] = [];
  sectors: any[] = [];
  services: any[] = [];
  
  // For component cleanup
  private destroy$ = new Subject<void>();
  
  // Loading states
  protected structuresLoading = false;
  protected sectorsLoading = false;
  protected servicesLoading = false;
  
  // Dropdown options formatted for PrimeNG
  protected structureOptions: { label: string; value: string }[] = [];
  protected sectorOptions: { label: string; value: string }[] = [];
  protected serviceOptions: { label: string; value: string }[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private structureService: StructureService,
    private secteurService: SecteurService,
    private serviceManagementService: ServiceManagementService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}
  
  /**
   * Fetch structure name from the backend by ID
   */
  fetchStructureName(structureId: string): void {
    // Skip if we're already fetching this ID
    if (this.fetchingStructureIds.has(structureId)) return;
    
    // Mark that we're fetching this ID
    this.fetchingStructureIds.add(structureId);
    
    // Call the structure service to get the structure by ID
    this.structureService.getStructureById(structureId).subscribe({
      next: (structure: any) => {
        if (structure && structure.name) {
          // Store the mapping
          this.structureMap.set(structureId, structure.name);
          // Refresh the display by forcing change detection
          setTimeout(() => {
            this.loadMyApis(); // Refresh the data
          }, 100);
        }
        this.fetchingStructureIds.delete(structureId);
      },
      error: (err: any) => {
        console.error('Error loading structure:', err);
        this.fetchingStructureIds.delete(structureId);
      }
    });
  }
  
  /**
   * Fetch sector name from the backend by ID
   */
  fetchSectorName(sectorId: string): void {
    // Skip if we're already fetching this ID
    if (this.fetchingSectorIds.has(sectorId)) return;
    
    // Mark that we're fetching this ID
    this.fetchingSectorIds.add(sectorId);
    
    // Call the sector service to get the sector by ID
    this.secteurService.getSecteurById(sectorId).subscribe({
      next: (sector: any) => {
        if (sector && sector.name) {
          // Store the mapping
          this.sectorMap.set(sectorId, sector.name);
          // Refresh the display by forcing change detection
          setTimeout(() => {
            this.loadMyApis(); // Refresh the data
          }, 100);
        }
        this.fetchingSectorIds.delete(sectorId);
      },
      error: (err: any) => {
        console.error('Error loading sector:', err);
        this.fetchingSectorIds.delete(sectorId);
      }
    });
  }
  
  /**
   * Fetch service name from the backend by ID
   */
  fetchServiceName(serviceId: string): void {
    // Skip if we're already fetching this ID
    if (this.fetchingServiceIds.has(serviceId)) return;
    
    // Mark that we're fetching this ID
    this.fetchingServiceIds.add(serviceId);
    
    // Call the service management service to get the service by ID
    this.serviceManagementService.getService(serviceId).subscribe({
      next: (service: any) => {
        if (service && service.name) {
          // Store the mapping
          this.serviceMap.set(serviceId, service.name);
          // Refresh the display by forcing change detection
          setTimeout(() => {
            this.loadMyApis(); // Refresh the data
          }, 100);
        }
        this.fetchingServiceIds.delete(serviceId);
      },
      error: (err: any) => {
        console.error('Error loading service:', err);
        this.fetchingServiceIds.delete(serviceId);
      }
    });
  }
  
  ngOnInit(): void {
    // Initialize component
    console.log('MyApiComponent initialized');
    
    // Load user information from JWT
    this.setUserInfoFromToken();
    
    // Load my APIs
    this.loadMyApis();
    
    // Load my API requests
    this.loadMyApiRequests();
    
    // Load supporting data from the backend
    this.loadStructures();
    this.loadSectors();
    this.loadServices();
    
    // Initialize the form
    this.resetForm();
  }
  
  /**
   * Set user details from JWT token
   */
  setUserInfoFromToken(): void {
    // Get the token and decode payload
    this.authService.getToken().subscribe(token => {
      if (token) {
        try {
          // Get payload from token
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          
          // Extract user details
          if (payload) {
            this.userId = payload.sub; // The user ID
            this.userEmail = payload.email || '';
            this.userName = payload.name || '';
            // Set role using the correct type expected by the base class
            if (payload.role === 'admin') {
              this.userRole = Role.admin;
            } else if (payload.role === 'user') {
              this.userRole = Role.user;
            }
            this.userStructure = payload.structure || '';
            this.userSector = payload.secteur || '';
            
            // Also set the protected properties from the base class
            this.userStructureId = this.userStructure;
            this.userSectorId = this.userSector;
            
            // Update the request form immediately if it exists
            if (this.requestForm) {
              this.requestForm.name = this.userName || '';
              this.requestForm.email = this.userEmail || '';
              this.requestForm.secteur = this.userSector || '';
              this.requestForm.structure = this.userStructure || '';
            }
            
            console.log('User info set from token:', this.userId, this.userEmail, this.userName);
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    });
  }
  
  /**
   * Method for global search in the table
   */
  onGlobalSearch(event: any): void {
    this.globalFilter = event?.target?.value || '';
  }
  
  /**
   * Handle change in items per page
   */
  onItemsPerPageChange(event: any): void {
    if (event && event.value) {
      this.itemsPerPage = event.value;
      // Reset to first page when changing items per page
      this.page = 1;
    }
  }
  
  /**
   * Load my API requests from the backend - showing only API creation requests
   */
  loadMyApiRequests(): void {
    this.loadingRequests = true;
    
    // Convert from 1-based to 0-based page number for the API
    const apiPage = Math.max(0, this.requestPage - 1); // Ensure page is never negative
    
    console.log('User info before API requests call:', {
      userId: this.userId,
      userEmail: this.userEmail,
      userRole: this.userRole,
      userStructure: this.userStructure,
      userSector: this.userSector,
      userStructureId: this.userStructureId,
      userSectorId: this.userSectorId
    });
    
    // Force type CREATION to ensure we only get creation requests
    const params = {
      page: apiPage,
      size: this.requestsPerPage,
      type: 'CREATION'
    };
    
    console.log('Requesting API creation requests with params:', params);
    
    // Use the direct endpoint URL to bypass any method issues
    this.http.get(`${environment.BACKEND_URL}api/api-creation-request/my-requests`, {
      params: params,
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      })
    }).subscribe({
      next: (response: any) => {
        console.log('API creation requests raw response:', response);
        
        // Check response structure and handle appropriately
        if (Array.isArray(response)) {
          // Direct array response
          this.myApiRequests = response;
          this.totalRequests = response.length;
        } else if (response && response.content) {
          // Paginated response
          this.myApiRequests = response.content || [];
          this.totalRequests = response.totalElements || 0;
        } else {
          // Empty or invalid response
          this.myApiRequests = [];
          this.totalRequests = 0;
        }
        
        // Log the actual data we're working with
        console.log('Processing API creation requests:', this.myApiRequests);
        this.loadingRequests = false;
        
        if (this.myApiRequests.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Data Loaded',
            detail: `Loaded ${this.myApiRequests.length} API creation requests`
          });
        } else {
          console.log('No API creation requests found for this user.');
        }
      },
      error: (error) => {
        console.error('Error loading API requests:', error);
        this.loadingRequests = false;
        this.myApiRequests = [];
        this.totalRequests = 0;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load API requests. Please try again later.'
        });
      }
    });
  }
  
  /**
   * Handle change in the requests page
   */
  onRequestPageChange(event: any): void {
    this.requestPage = event.page + 1; // Convert from 0-based to 1-based page
    this.requestsPerPage = event.rows;
    this.loadMyApiRequests();
  }
  
  /**
   * Load my APIs from the backend
   */
  loadMyApis(): void {
    this.loading = true;
    
    // Convert from 1-based to 0-based page number for the API
    const page = Math.max(0, this.page - 1); // Ensure page is never negative
    
    this.apiService.getMyApis(page, this.itemsPerPage).subscribe({
      next: (pageData: Page<Api>) => {
        console.log('Loaded APIs page:', pageData);
        
        // Update the component's data
        this.myApis = Array.isArray(pageData.content) ? pageData.content : [];
        this.filteredApis = [...this.myApis]; // Initialize filtered list with all APIs
        this.totalItems = pageData.totalElements || 0;
        
        // Ensure page number is valid
        if (pageData.number !== undefined) {
          this.page = pageData.number + 1; // Convert back to 1-based for the UI
        }
        
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading APIs:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load APIs. Please try again later.'
        });
        
        // Reset to empty state
        this.myApis = [];
        this.filteredApis = [];
        this.totalItems = 0;
      }
    });
  }
  
  /**
   * Navigate to API details page
   */
  viewApiDetails(api: Api): void {
    if (api && api.id) {
      window.open(`/api/${api.id}`, '_blank');
    }
  }

  // Publication request method removed - focus on new API requests only
  
  /**
   * Open API editor to modify the API
   */
  editApi(api: Api): void {
    if (!api || !api.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot edit: Invalid API'
      });
      return;
    }
    
    // Set up the request form with the API details
    this.selectedApi = api;
    this.requestType = 'modify';
    
    // Populate form with API details
    this.requestForm.apiName = api.name || '';
    this.requestForm.description = api.description || '';
    this.requestForm.baseUrl = api.baseUrl || '';
    this.requestForm.apiVersion = api.version || 'v1';
    this.requestForm.requiresAuth = api.requiresAuth !== false;
    this.requestForm.authType = api.authType || 'OAuth2';
    
    // Show the request form
    this.displayApiRequestSection = true;
  }
  
  /**
   * Submit the API request form for creating a new API
   * Using simplified direct submission approach
   */
  submitRequest(): void {
    // Validate common required fields
    if (!this.requestForm.name || !this.requestForm.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide your name and email'
      });
      return;
    }

    // Validate organization fields
    if (!this.requestForm.structure) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select a structure'
      });
      return;
    }

    if (!this.requestForm.secteur) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select a sector'
      });
      return;
    }
    
    if (!this.requestForm.service) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select a service'
      });
      return;
    }
    
    // Creating a new API - validate API-specific fields
    if (this.requestType !== 'access' && !this.requestForm.apiName) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide an API name'
      });
      return;
    }

    if (!this.requestForm.baseUrl) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide a base URL for the API'
      });
      return;
    }
    
    this.requestInProgress = true;
    
    // Create API object with all necessary fields for the publication request
    const newApi: Partial<Api> = {
      name: this.requestForm.apiName,
      description: this.requestForm.description,
      secteur: this.requestForm.secteur,
      structure: this.requestForm.structure,
      service: this.requestForm.service,
      baseUrl: this.requestForm.baseUrl,
      version: this.requestForm.apiVersion,
      requiresAuth: this.requestForm.requiresAuth,
      authType: this.requestForm.authType,
      // Add input and output examples
      inputExamples: this.inputExamples,
      outputExamples: this.outputExamples,
      // Add endpoints
      endpoints: this.endpoints
    };
    
    // Publication details with requester information
    const publicationDetails = {
      reason: this.requestForm.description || 'Request to create new API',
      requesterName: this.requestForm.name,
      requesterEmail: this.requestForm.email,
      // Include these critical fields directly in the details to ensure they're set at the top level
      apiName: this.requestForm.apiName,
      secteur: this.requestForm.secteur,
      structure: this.requestForm.structure, 
      service: this.requestForm.service,
      message: this.requestForm.description || 'Request to create new API'
    };
    
    console.log('Submitting API creation request with:', {
      newApi,
      publicationDetails,
      endpoints: this.endpoints
    });
    
    // Submit the API creation request directly
    this.apiService.submitApiRequest(newApi as Api, publicationDetails).subscribe({
      next: (response) => {
        this.requestInProgress = false;
        this.displayApiRequestSection = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'API request submitted successfully'
        });
        this.resetForm();
        this.loadMyApis();
      },
      error: (error) => {
        this.requestInProgress = false;
        console.error('Error submitting API request:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit API request. Please try again later.'
        });
      }
    });
  }
  
  /**
   * Reset form fields to their default values
   */
  resetForm(): void {
    // Preserve user info
    const userInfo = {
      name: this.requestForm.name,
      email: this.requestForm.email,
      secteur: this.requestForm.secteur,
      structure: this.requestForm.structure,
      service: this.requestForm.service
    };
    
    this.requestForm = {
      name: '',
      email: '',
      secteur: '',
      structure: '',
      service: '',
      description: '',
      apiName: '',
      apiVersion: 'v1',
      baseUrl: '',
      requiresAuth: false,
      authType: 'Bearer Token',
      apiKey: ''
    };
    
    this.inputExamples = [];
    this.outputExamples = [];
    this.endpoints = [];
    this.addEndpoint(); // Add an empty endpoint by default
  }
  
  /**
   * Show the API request section
   */
  showApiRequestSection(): void {
    // By default, assume we're creating a new API request
    this.requestType = 'new';
    this.selectedApi = null;
    
    // Reset the form before showing
    this.resetForm();
    
    // Show the form
    this.displayApiRequestSection = true;
  }
  
  /**
   * Handle the selection of request type
   */
  selectRequestType(type: 'access' | 'new' | 'modify'): void {
    this.requestType = type;
  }
  
  /**
   * Cancel request with confirmation if data has been entered
   */
  cancelRequest(): void {
    // Simple cancel for now
    this.displayApiRequestSection = false;
    this.selectedApi = null;
    this.resetForm();
  }
  
  /**
   * Add a new input example to the list
   */
  addInputExample(): void {
    this.inputExamples.push('');
  }
  
  /**
   * Apply selected input template to new input example
   */
  applyInputTemplate(event: any): void {
    const templateValue = event.value;
    if (templateValue) {
      // Add a new input example with the template value
      this.inputExamples.push(templateValue);
      // Reset the dropdown
      this.selectedInputTemplate = '';
    }
  }
  
  /**
   * Remove an input example from the list
   */
  removeInputExample(index: number): void {
    if (index >= 0 && index < this.inputExamples.length) {
      this.inputExamples.splice(index, 1);
    }
  }
  
  /**
   * Add a new output example to the list
   */
  addOutputExample(): void {
    this.outputExamples.push('');
  }
  
  /**
   * Apply selected output template to new output example
   */
  applyOutputTemplate(event: any): void {
    const templateValue = event.value;
    if (templateValue) {
      // Add a new output example with the template value
      this.outputExamples.push(templateValue);
      // Reset the dropdown
      this.selectedOutputTemplate = '';
    }
  }
  
  /**
   * Remove an output example from the list
   */
  removeOutputExample(index: number): void {
    if (index >= 0 && index < this.outputExamples.length) {
      this.outputExamples.splice(index, 1);
    }
  }
  
  /**
   * Navigate to API exploration view
   */
  exploreApi(api: Api): void {
    if (!api) {
      console.error('No API provided to explore');
      return;
    }
    
    // Show the API details in the dialog
    this.showApiDetails(api);
    
    // In a real implementation, this would navigate to a dedicated
    // API explorer component that allows testing endpoints
    console.log('Explore API:', api.id);
  }
  
  /**
   * Show API details in the details dialog
   */
  showApiDetails(api: Api): void {
    this.selectedApiDetails = { ...api };
    this.apiDetailsVisible = true;
  }

  /**
   * Handler for the Request New API button
   * Shows a form to request a new API
   */
  onRequestNewApi(): void {
    // Show the API request form directly
    this.requestType = 'new';
    this.displayApiRequestSection = true;
    this.resetForm();
    
    // Scroll to the request form section
    setTimeout(() => {
      const element = document.querySelector('.request-form-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  /**
   * Handle new API request button click
   */
  onNewApiRequest() {
    this.requestType = 'new';
    
    // Ensure user info is set from token before resetting form
    this.setUserInfoFromToken();
    
    // Reset form with user data
    this.resetRequestForm();
    
    // Double-check form is populated with user info
    if (!this.requestForm.name || !this.requestForm.email) {
      console.log('Form not populated with user info, trying again');
      // Explicitly set the user info in the form
      this.requestForm.name = this.userName || '';
      this.requestForm.email = this.userEmail || '';
      this.requestForm.secteur = this.userSector || '';
      this.requestForm.structure = this.userStructure || '';
    }
    
    // Show the request form section
    this.displayApiRequestSection = true;
    
    // Scroll to the form section
    setTimeout(() => {
      const element = document.querySelector('.request-form-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    // Clear any selected API
    this.selectedApi = null;
  }

  /**
   * Reset the request form to its initial state
   */
  private resetRequestForm() {
    // Ensure user info is set from token
    this.setUserInfoFromToken();
    
    // Populate the form with user data
    this.requestForm = {
      name: this.userName || '',
      email: this.userEmail || '',
      secteur: this.userSector || '',
      structure: this.userStructure || '',
      service: '',
      description: '',
      apiName: '',
      apiVersion: 'v1',
      baseUrl: '',
      endpoints: [''],
      endpoint: '',
      documentation: '',
      requiresAuth: true,
      authType: 'OAuth2',
      apiKey: ''
    };
    
    console.log('Reset request form with user info:', {
      name: this.userName,
      email: this.userEmail,
      secteur: this.userSector,
      structure: this.userStructure
    });
    
    // Reset input and output examples
    this.inputExamples = [];
    this.outputExamples = [];
  }

  /**
   * Cancel the modification and return to the API list
   */
  cancelModify() {
    this.displayApiRequestSection = false;
    this.requestType = 'new';
    this.selectedApi = null;
    this.resetRequestForm();
  }

  /**
   * Handle modify API button click
   */
  modifyApi(api: Api) {
    // Set the selected API and switch to modify mode
    this.selectedApi = { ...api };
    this.requestType = 'modify';
    
    // Get current user data from AuthService
    const username = this.authService.getCurrentUsername() || '';
    
    // Pre-fill the form with API data
    this.requestForm = {
      name: username, // Using username as name since name isn't available
      email: username, // Using username as email since email isn't available separately
      secteur: api.secteur || '',
      structure: api.structure || '',
      service: api.service || '',
      description: api.description || '',
      apiName: api.name,
      apiVersion: api.version || 'v1',
      baseUrl: api.baseUrl || '',
      endpoints: api.endpoints || [''],
      endpoint: '',
      documentation: api.documentation || '',
      requiresAuth: api.requiresAuth || false,
      authType: api.authType || 'apiKey',
      apiKey: '', // Don't pre-fill API key for security reasons
      // Add other fields as needed
    };
    
    // Show the request form section
    this.displayApiRequestSection = true;
    
    // Scroll to the form section
    setTimeout(() => {
      const element = document.querySelector('.request-form-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
  
  /**
   * Format date for display
   */
  getFormattedDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  /**
   * Get status class for the tag component
   */
  getStatusClass(status: string | undefined): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!status) return 'info';
    
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'active': return 'success';
      case 'pending': return 'warn';
      case 'rejected': return 'danger';
      case 'inactive': return 'secondary';
      default: return 'info';
    }
  }
  
  /**
   * Load structures from the backend
   */
  loadStructures(): void {
    this.structureService.getStructures().subscribe({
      next: (data) => {
        // Handle different response types (array or paged content)
        const items = Array.isArray(data) ? data : (data.content || []);
        this.structures = items.map((s: any) => ({ label: s.name, value: s.id }));
      },
      error: (err) => console.error('Error loading structures:', err)
    });
  }
  
  /**
   * Load sectors from the backend
   */
  loadSectors(): void {
    this.secteurService.getSecteurs().subscribe({
      next: (data) => {
        // Handle different response types (array or paged content)
        const items = Array.isArray(data) ? data : (data.content || []);
        this.sectors = items.map((s: any) => ({ label: s.name, value: s.id }));
      },
      error: (err) => console.error('Error loading sectors:', err)
    });
  }
  
  /**
   * Load services from the backend
   */
  loadServices(): void {
    this.serviceManagementService.getServices().subscribe({
      next: (data) => {
        // Handle different response types (array or paged content)
        const items = Array.isArray(data) ? data : (data.content || []);
        this.services = items.map((s: any) => ({ label: s.name, value: s.id }));
      },
      error: (err) => console.error('Error loading services:', err)
    });
  }
}