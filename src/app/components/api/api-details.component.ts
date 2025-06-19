import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { StructureService } from '../../services/structure.service';
// ServiceManagementService import removed as it's no longer needed
import { Api } from '../../models/api';
import { ApiRequest } from '../../models/api-request';
import { Role } from '../../models/roles';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
// No need for InputTextarea as we're using standard HTML textarea

// Models for API documentation display
interface ApiParameter {
  name: string;
  value: string;
  description: string;
  required: boolean;
}

interface ApiResponse {
  statusCode: string;
  description: string;
  resource: string;
}

interface ApiEndpoint {
  method: string; // GET, POST, PUT, DELETE, etc.
  path: string;
  description: string;
  parameters: ApiParameter[];
  responses: ApiResponse[];
  requiresAuth: boolean;
  authMethods: string[];
}

@Component({
  selector: 'app-api-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TableModule,
    TabViewModule,
    CardModule,
    DropdownModule,
    ToastModule,
    PanelModule
  ],
  providers: [MessageService],
  templateUrl: './api-details.component.html',
  styleUrls: ['./api-details.component.css']
})

export class ApiDetailsComponent implements OnInit {

  // Maps for storing service and structure names by ID
  serviceMap: Map<string, string> = new Map(); // Used to store service name mappings
  structureMap: Map<string, string> = new Map(); // Used to store structure name mappings
  
  // Helper method to get structure name from ID
  getStructureName(structureId: string): string {
    if (!structureId) return 'N/A';
    
    // Look up the name in our mapping
    const structureName = this.structureMap.get(structureId);
    if (structureName) return structureName;
    
    // Try with slashes removed (common format issue)
    if (structureId.includes('/')) {
      const cleanId = structureId.replace(/\//g, '');
      const cleanName = this.structureMap.get(cleanId);
      if (cleanName) return cleanName;
    }
    
    // Return the full ID instead of truncating it
    return structureId;
  }
  
  // Helper method to get service name from ID
  getServiceName(serviceId: string): string {
    if (!serviceId) return 'N/A';
    
    // Look up the name in our mapping
    const serviceName = this.serviceMap.get(serviceId);
    if (serviceName) return serviceName;
    
    // Try with slashes removed (common format issue)
    if (serviceId.includes('/')) {
      const cleanId = serviceId.replace(/\//g, '');
      const cleanName = this.serviceMap.get(cleanId);
      if (cleanName) return cleanName;
    }
    
    // Return the full ID instead of truncating it
    return serviceId;
  }
  api: Api | undefined;
  apiId: string | null = null;
  userRole: Role | null = null;
  
  // API documentation display properties
  activeTabIndex = 0;
  endpointList: ApiEndpoint[] = [];
  selectedEndpoint: ApiEndpoint | null = null;
  loading = false;
  submitting = false;
  requestForm: FormGroup;
  requestSent = false;
  errorMessage = '';
  isExploring: boolean = false;
  
  // Explorer authentication properties
  explorerAuthType = 'OAuth2';
  
  // API Test properties
  userHasApiAccess = false;
  testApiParams: string = '';
  testApiResponse: string = '';
  isTestLoading = false;
  testError: string = '';
  
  // Lists  // Purpose field for API request form
  requestPurpose = '';
  requestJustification = '';
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private structureService: StructureService
  ) {
    // Initialize the request form with just the purpose field
    this.requestForm = this.fb.group({
      purpose: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get API ID from route
    this.route.paramMap.subscribe(params => {
      this.apiId = params.get('id');
      if (this.apiId) {
        this.loadApiDetails(this.apiId);
        this.checkApiAccess(this.apiId);
      }
    });
    
    // Initialize the access request form
    this.requestForm = this.fb.group({
      purpose: ['', [Validators.required, Validators.minLength(10)]],
      justification: ['', [Validators.required, Validators.minLength(20)]]
    });
    
    // Get user role for conditional rendering
    this.authService.getLoggedInUser().subscribe({
      next: (user: any) => {
        this.userRole = user?.role || null;
      },
      error: (error: any) => {
        console.error('Error fetching user role:', error);
      }
    });
  }

  // Load API details by ID
  // No need to extract API info from description as we now have dedicated fields
  ensureApiFields(): void {
    if (!this.api) return;
    
    // Log the API object for debugging
    console.log('API object from backend:', this.api);
    
    // Create a copy of the API to ensure all fields have default values if missing
    const apiWithDefaults = { ...this.api };
    
    // Ensure all fields have at least default values if they're missing
    // This prevents UI errors from undefined fields
    if (!apiWithDefaults.baseUrl) apiWithDefaults.baseUrl = 'N/A';
    if (!apiWithDefaults.version) apiWithDefaults.version = 'v1';
    if (!apiWithDefaults.documentation) apiWithDefaults.documentation = '';
    if (!apiWithDefaults.description) apiWithDefaults.description = 'No description available';
    
    // Update the API object
    this.api = apiWithDefaults;
    console.log('API with defaults:', apiWithDefaults);
  }

  loadApiDetails(apiId: string): void {
    this.loading = true;
    this.apiId = apiId;
    this.apiService.getApiByCode(apiId).subscribe({
      next: (api: Api) => {
        this.api = api;
        this.loading = false;
        
        // Make sure all API fields have at least default values
        this.ensureApiFields();
        
        // Load structure and service names if we have IDs
        if (api.structure) {
          this.structureService.getStructureById(api.structure).subscribe({
            next: (structure) => {
              if (structure && structure.name) {
                this.structureMap.set(api.structure, structure.name);
              }
            },
            error: (err) => console.error('Error loading structure:', err)
          });
        }
        
        // Load sector information if we have a sector ID
        if (api.secteur) {
          // Call service to get sector name by ID
          this.apiService.getSecteurName(api.secteur).subscribe({
            next: (sectorName: string) => {
              if (sectorName) {
                this.serviceMap.set(api.secteur, sectorName);
              }
            },
            error: (err: any) => console.error('Error loading sector:', err)
          });
        }
        
        // Process endpoint data if available - we need to check if any of the endpoint-related fields exist
        if ((api as any).endpointPath || (api as any).exampleRequest || (api as any).endpointMethod) {
          // Create an endpoint from the API's endpoint fields
          this.createEndpointFromApi(api);
        } else if (api.endpoints && api.endpoints.length > 0) {
          // Use existing endpoints if available
          this.processEndpoints(this.getEndpoints(api), this.api?.baseUrl || '');
        } else {
          // If no endpoints are available, clear the list
          this.endpointList = [];
          this.selectedEndpoint = null;
        }
      },
      error: (error: any) => {
        console.error('Error loading API details:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load API details. Please try again later.'
        });
      }
    });
  }
  
  // Process actual endpoint data from the API
  processEndpoints(endpoints: string[] | ApiEndpoint[], baseUrl: string): void {
    this.endpointList = [];
    
    // Each endpoint in the backend data might be in different formats
    endpoints.forEach((endpoint, index) => {
      try {
        let parsedEndpoint: any = {};
        
        // Check if endpoint is already an ApiEndpoint object
        if (!this.isString(endpoint)) {
          // It's already an ApiEndpoint object, use it directly
          const typedEndpoint = endpoint as ApiEndpoint;
          parsedEndpoint = {
            method: typedEndpoint.method,
            path: typedEndpoint.path,
            description: typedEndpoint.description,
            parameters: typedEndpoint.parameters,
            responses: typedEndpoint.responses,
            requiresAuth: typedEndpoint.requiresAuth,
            authMethods: typedEndpoint.authMethods
          };
        } else {
          // It's a string, process it as before
          const endpointStr = endpoint as string;
          // Try to parse if it's a JSON string
          if (endpointStr.includes('{') && endpointStr.includes('}')) {
            try {
              parsedEndpoint = JSON.parse(endpointStr);
            } catch (e) {
              // Not valid JSON, continue with endpoint as a string
            }
          } else if (endpointStr.includes(':') || endpointStr.includes('/')) {
            // Simple string format: probably "METHOD: /path"
            const parts = endpointStr.includes(':') ? endpointStr.split(':', 2) : ['GET', endpointStr];
            parsedEndpoint.method = parts[0].trim();
            parsedEndpoint.path = parts[1]?.trim() || endpointStr;
          } else {
            // Just use the endpoint as a path with GET method
            parsedEndpoint.method = 'GET';
            parsedEndpoint.path = endpointStr;
          }
        }
        
        // Determine the HTTP method - default to GET if not specified
        const method = parsedEndpoint.method || (parsedEndpoint.path.includes('create') || parsedEndpoint.path.includes('add') ? 'POST' : 
                      parsedEndpoint.path.includes('update') || parsedEndpoint.path.includes('modify') ? 'PUT' :
                      parsedEndpoint.path.includes('delete') || parsedEndpoint.path.includes('remove') ? 'DELETE' : 'GET');
        
        // Create an endpoint entry
        const apiEndpoint: ApiEndpoint = {
          method: method,
          path: parsedEndpoint.path.startsWith('http') ? parsedEndpoint.path : `${baseUrl}${parsedEndpoint.path || endpoint}`,
          description: parsedEndpoint.description || `Endpoint ${index + 1}`,
          parameters: parsedEndpoint.parameters || [],
          responses: parsedEndpoint.responses || [
            { statusCode: '200', description: 'Success', resource: 'Result' },
            { statusCode: '400', description: 'Bad Request', resource: 'Error' }
          ],
          requiresAuth: parsedEndpoint.requiresAuth !== undefined ? parsedEndpoint.requiresAuth : true,
          authMethods: parsedEndpoint.authMethods || ['Bearer Token']
        };
        
        this.endpointList.push(apiEndpoint);
      } catch (error) {
        console.error(`Error processing endpoint ${endpoint}:`, error);
      }
    });
    
    // Select the first endpoint if available
    if (this.endpointList.length > 0) {
      this.selectedEndpoint = this.endpointList[0];
    } else {
      this.selectedEndpoint = null;
    }
  }

  // No mock data methods - using only actual API data
  

  /**
   * Submit an API access request
   */
  submitAccessRequest(): void {
    if (this.requestForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const purpose = this.requestForm.get('purpose')?.value;
    
    // Get the current user's email
    this.authService.getLoggedInUser().subscribe({
      next: (user: any) => {
        const userEmail = user?.email || user?.username || 'unknown@example.com';
        const userName = user?.name || 'Unknown User';
        
        // Prepare the request data
        const requestData = {
          name: userName,
          email: userEmail,
          reason: purpose,
          description: `Requesting access to ${this.api?.name} for ${purpose}`,
          structure: this.api?.structure || '',
          secteur: this.api?.secteur || ''
        };
        
        // Ensure we have a valid API ID
        if (!this.api?.id) {
          this.submitting = false;
          this.errorMessage = 'Invalid API ID';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.errorMessage
          });
          return;
        }
        
        // Call the correct method to request API access
        this.apiService.requestApiAccess(this.api.id, requestData).subscribe({
          next: (response) => {
            this.submitting = false;
            this.requestSent = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Request Submitted',
              detail: 'Your API access request has been submitted successfully.'
            });
            
            // Redirect to the API requests page after a delay
            setTimeout(() => {
              this.router.navigate(['/user/api-requests']);
            }, 2000);
          },
          error: (error) => {
            this.submitting = false;
            this.errorMessage = error.error?.message || error.message || 'Failed to submit API access request';
            this.messageService.add({
              severity: 'error',
              summary: 'Request Failed',
              detail: this.errorMessage
            });
          }
        });
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = 'Failed to get user information';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.errorMessage
        });
      }
    });
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

  // Create endpoint from API direct fields
  createEndpointFromApi(api: Api): void {
    // Clear existing endpoints
    this.endpointList = [];
    
    // Use type assertion to access dynamic properties that might exist in MongoDB but not in our model
    const apiAny = api as any;
    
    // Create an endpoint from the API's fields
    const endpoint: ApiEndpoint = {
      method: apiAny.endpointMethod || 'GET',
      path: apiAny.endpointPath || `/api/${api.version || 'v1'}/${api.name.toLowerCase().replace(/\s+/g, '-')}`,
      description: apiAny.endpointDescription || `${api.name} Endpoint`,
      parameters: [],
      responses: [
        { statusCode: '200', description: 'Success', resource: 'Result' },
        { statusCode: '400', description: 'Bad Request', resource: 'Error' }
      ],
      requiresAuth: api.requiresAuth || apiAny.authRequired || false,
      authMethods: [api.authType || 'OAuth2']
    };
    
    // Add example request parameter if available
    if (apiAny.exampleRequest) {
      endpoint.parameters = [
        {
          name: 'request',
          value: apiAny.exampleRequest,
          description: 'Example request',
          required: true
        }
      ];
    }
    
    // Add inputExample if available
    if (apiAny.inputExample) {
      if (!endpoint.parameters) endpoint.parameters = [];
      endpoint.parameters.push({
        name: 'input',
        value: apiAny.inputExample,
        description: 'Example input',
        required: true
      });
    }
    
    // Add example response if available - check both outputExample and outputExamples
    if (apiAny.outputExample || api.outputExamples?.length) {
      endpoint.responses = [
        {
          statusCode: '200',
          description: 'Success',
          resource: apiAny.outputExample || (api.outputExamples && api.outputExamples.length > 0 ? api.outputExamples[0] : 'Result')
        },
        { statusCode: '400', description: 'Bad Request', resource: 'Error' }
      ];
    }
    
    this.endpointList.push(endpoint);
    this.selectedEndpoint = endpoint;
  }

  resetForm(): void {
    if (this.requestForm) {
      this.requestForm.reset();
    }
    this.requestSent = false;
    this.errorMessage = '';
  }
  
  // Navigate back to API list
  goBackToApis(): void {
    this.router.navigate(['/user/apis']);
  }
  
  // Check if the user has access to this API
  checkApiAccess(apiId: string): void {
    this.apiService.getUserApiRequests().subscribe({
      next: (requests) => {
        // Find approved requests for this API
        const approvedRequest = requests.find(req => 
          req.apiId === apiId && 
          req.status?.toLowerCase() === 'approved'
        );
        
        this.userHasApiAccess = !!approvedRequest;
      },
      error: (error) => {
        console.error('Error checking API access:', error);
        this.userHasApiAccess = false;
      }
    });
  }
  
  // Test the API functionality
  testApi(): void {
    if (!this.userHasApiAccess || !this.api) {
      this.testError = 'You do not have access to test this API';
      this.messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: this.testError
      });
      return;
    }
    
    this.isTestLoading = true;
    this.testError = '';
    this.testApiResponse = '';
    
    // In a real implementation, you would call the actual API
    // For now, we'll simulate a response after a delay
    setTimeout(() => {
      try {
        // Parse the input params as JSON if possible
        let params;
        try {
          params = JSON.parse(this.testApiParams);
        } catch (e) {
          params = this.testApiParams;
        }
        
        // Generate a sample response based on the API
        this.testApiResponse = JSON.stringify({
          status: 'success',
          timestamp: new Date().toISOString(),
          data: {
            request: params,
            result: 'Sample API response for ' + this.api?.name,
            apiId: this.api?.id
          }
        }, null, 2);
        
        this.isTestLoading = false;
      } catch (error) {
        this.isTestLoading = false;
        this.testError = 'Error processing API test: ' + error;
        this.messageService.add({
          severity: 'error',
          summary: 'Test Failed',
          detail: this.testError
        });
      }
    }, 1500); // Simulate network delay
  }
}
