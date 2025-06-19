// Parameter definition for API endpoints
export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

// Response definition for API endpoints
export interface ApiResponse {
  statusCode: string;
  description: string;
  resource: string;
}

// Endpoint definition for APIs
export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: ApiParameter[];
  responses: ApiResponse[];
  requiresAuth: boolean;
  authMethods?: string[];
}

export interface Api {
  id: string;
  name: string;
  description: string;
  secteur: string;
  structure: string;
  updatedAt: Date;
  status?: string; // Keeping for backward compatibility
  approvalStatus?: string; // New field to match backend expectations
  documentation?: string;
  
  // Enhanced endpoints structure - both legacy string array and new detailed structure supported
  endpoints?: string[] | ApiEndpoint[];
  
  // Example data for API documentation
  inputExamples?: string[];
  outputExamples?: string[];
  
  // Service-related fields
  service?: string;     // Legacy field name for the service
  serviceId?: string;   // Alternative field name for service
  serviceName?: string; // Name of the service (UI display property)
  
  // Provider-related fields (used by backend filtering)
  providerId?: string;  // MongoDB ObjectId of the provider/service owner (24-char hex)
  providerID?: string;  // Alternative casing that might be used
  provider_id?: string; // Alternative snake_case formatting that might be used
  
  // Structure-related fields
  structureId?: string; // ID of the structure
  structureName?: string; // Name of the structure (UI display property)
  
  // Additional fields for API documentation view
  baseUrl?: string;     // Base URL for the API
  version?: string;     // API version
  authType?: string;    // Authentication type (e.g., OAuth, API Key)
  requiresAuth?: boolean; // Whether authentication is required
  contentType?: string;  // Content type for responses
}