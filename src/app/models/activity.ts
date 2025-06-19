/**
 * Activity model for tracking user actions and system events
 * in the CNI platform
 */
export interface Activity {
  id?: string;
  type: ActivityType;
  description: string;
  timestamp: Date | string;
  userId?: string;
  username?: string;
  entityId?: string;
  entityName?: string;
  sectorId?: string;
  sectorName?: string;
  details?: any;
}

/**
 * Types of activities that can be tracked in the system
 */
export enum ActivityType {
  API_CREATED = 'API_CREATED',
  API_UPDATED = 'API_UPDATED',
  API_REQUEST_CREATED = 'API_REQUEST_CREATED',
  API_REQUEST_APPROVED = 'API_REQUEST_APPROVED',
  API_REQUEST_REJECTED = 'API_REQUEST_REJECTED',
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  SECTOR_ADDED = 'SECTOR_ADDED',
  STRUCTURE_ADDED = 'STRUCTURE_ADDED',
  SERVICE_ADDED = 'SERVICE_ADDED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE'
}
