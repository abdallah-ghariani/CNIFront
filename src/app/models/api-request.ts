export interface ApiRequest {
  id?: string;
  apiId: string;
  consumerId: string;
  providerId?: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  
  // Contact information
  name: string;
  email: string;
  secteur: string;
  structure: string;
  service: string;
  message?: string; // Description/motivation for the request
  
  // API details (populated from the API)
  apiName?: string;
  consumerName?: string; // Populated on the server side
  
  // Additional metadata (stored as JSON string)
  metadata?: string; // Contains API examples, authentication details, etc.
}
