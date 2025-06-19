import { Injectable } from '@angular/core';
import { StructureService } from '../services/structure.service';
import { SecteurService } from '../services/secteur.service';
import { ServiceManagementService } from '../services/service.service';

/**
 * Utility service for common API helper methods
 * This reduces code duplication across API-related components
 */
@Injectable({
  providedIn: 'root'
})
export class ApiHelpers {
  // Cache for name lookups to reduce service calls
  private structureCache: { [id: string]: string } = {};
  private sectorCache: { [id: string]: string } = {};
  private serviceCache: { [id: string]: string } = {};

  constructor(
    private structureService: StructureService,
    private secteurService: SecteurService,
    private serviceManagementService: ServiceManagementService
  ) {}

  /**
   * Returns the appropriate severity for a status badge
   */
  getStatusClass(status: string | undefined): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
        return 'info';
      case 'rejected':
        return 'danger';
      case 'deprecated':
        return 'warn';
      case 'inactive':
        return 'secondary';
      default:
        return 'contrast';
    }
  }

  /**
   * Helper method to get structure name from ID
   */
  getStructureName(structureId: string | undefined): string {
    if (!structureId) return 'Unknown';

    // Check cache first
    if (this.structureCache[structureId]) {
      return this.structureCache[structureId];
    }

    // If not in cache, return ID and trigger async fetch
    // This avoids duplicate service calls when used in templates
    this.fetchStructureName(structureId);
    return 'Loading...';
  }

  private fetchStructureName(structureId: string): void {
    this.structureService.getStructureById(structureId).subscribe({
      next: (structure) => {
        if (structure) {
          this.structureCache[structureId] = structure.name || 'Unknown';
        }
      },
      error: () => {
        this.structureCache[structureId] = 'Unknown';
      }
    });
  }

  /**
   * Helper method to get sector name from ID
   */
  getSectorName(sectorId: string | undefined): string {
    if (!sectorId) return 'Unknown';

    // Check cache first
    if (this.sectorCache[sectorId]) {
      return this.sectorCache[sectorId];
    }

    // If not in cache, return ID and trigger async fetch
    this.fetchSectorName(sectorId);
    return 'Loading...';
  }

  private fetchSectorName(sectorId: string): void {
    this.secteurService.getSecteurById(sectorId).subscribe({
      next: (sector) => {
        if (sector) {
          this.sectorCache[sectorId] = sector.name || 'Unknown';
        }
      },
      error: () => {
        this.sectorCache[sectorId] = 'Unknown';
      }
    });
  }

  /**
   * Helper method to get service name from ID
   */
  getServiceName(serviceId: string | undefined): string {
    if (!serviceId) return 'Unknown';

    // Check cache first
    if (this.serviceCache[serviceId]) {
      return this.serviceCache[serviceId];
    }

    // If not in cache, return ID and trigger async fetch
    this.fetchServiceName(serviceId);
    return 'Loading...';
  }

  private fetchServiceName(serviceId: string): void {
    this.serviceManagementService.getService(serviceId).subscribe({
      next: (service: any) => {
        if (service) {
          this.serviceCache[serviceId] = service.name || 'Unknown';
        }
      },
      error: () => {
        this.serviceCache[serviceId] = 'Unknown';
      }
    });
  }

  /**
   * Checks if a string is valid JSON
   */
  isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Parses API description from JSON string
   * Returns the parsed JSON object
   */
  getApiJsonDescription(description: string): any {
    if (!description) return null;
    
    try {
      // Check if the description is already a JSON object
      if (typeof description === 'object') {
        return description;
      }
      
      // Try to extract JSON from the description text
      if (this.isJsonString(description)) {
        return JSON.parse(description);
      }
      
      // Try to find a JSON object embedded in text
      const jsonMatch = description.match(/\{.*\}/s);
      if (jsonMatch && this.isJsonString(jsonMatch[0])) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (e) {
      console.error('Error parsing API description JSON:', e);
      return null;
    }
  }

  /**
   * Formats a JSON date (could be in various formats)
   */
  formatJsonDate(dateValue: any): string {
    if (!dateValue) return 'N/A';
    
    try {
      let dateObj;
      
      // Handle different date formats
      if (typeof dateValue === 'string') {
        // Check if it's a ISO string
        if (dateValue.includes('T') || dateValue.includes('-')) {
          dateObj = new Date(dateValue);
        } else {
          // Check if it's a timestamp
          const timestamp = parseInt(dateValue, 10);
          if (!isNaN(timestamp)) {
            dateObj = new Date(timestamp);
          }
        }
      } else if (typeof dateValue === 'number') {
        dateObj = new Date(dateValue);
      }
      
      if (dateObj && !isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString();
      }
      
      return String(dateValue);
    } catch (e) {
      console.error('Error formatting date:', e);
      return String(dateValue);
    }
  }

  /**
   * Extracts endpoints from a JSON description
   */
  getJsonEndpoints(description: string): string[] {
    const jsonDesc = this.getApiJsonDescription(description);
    
    if (!jsonDesc) return [];
    
    // Try to extract endpoints from common JSON structures
    if (jsonDesc.endpoints) {
      return Array.isArray(jsonDesc.endpoints) ? jsonDesc.endpoints : [jsonDesc.endpoints];
    }
    
    if (jsonDesc.paths) {
      return Object.keys(jsonDesc.paths);
    }
    
    return [];
  }

  /**
   * Gets a description for an endpoint based on common patterns
   */
  getEndpointDescription(endpoint: string): string {
    if (!endpoint) return '';
    
    // Extract path parts
    const parts = endpoint.split('/').filter(p => p);
    
    // Common REST patterns
    if (parts.length === 1) {
      return `Access to ${parts[0]} resource`;
    }
    
    if (parts.length >= 2) {
      // Check for ID pattern
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes(':id') || lastPart.includes('{id}')) {
        const resource = parts[parts.length - 2];
        return `Access to a specific ${resource} by ID`;
      }
      
      // Check for nested resources
      if (parts.length >= 3) {
        return `Access to ${parts[parts.length - 1]} of ${parts[parts.length - 2]}`;
      }
      
      return `Access to ${parts[parts.length - 1]} resource`;
    }
    
    return endpoint;
  }

  /**
   * Check if the API description JSON contains authentication information
   */
  hasAuthInfo(description: string): boolean {
    const jsonDesc = this.getApiJsonDescription(description);
    
    if (!jsonDesc) return false;
    
    // Check common auth-related fields
    return !!(
      jsonDesc.auth ||
      jsonDesc.authentication ||
      jsonDesc.security ||
      jsonDesc.securityDefinitions ||
      jsonDesc.securitySchemes ||
      jsonDesc.authType ||
      jsonDesc.requiresAuth
    );
  }

  /**
   * Remove duplicate APIs by ID
   */
  removeDuplicateApis(apis: any[]): any[] {
    if (!apis || !Array.isArray(apis)) return [];
    
    const uniqueApis = new Map();
    
    // Keep only the first occurrence of each API ID
    for (const api of apis) {
      if (api && api.id && !uniqueApis.has(api.id)) {
        uniqueApis.set(api.id, api);
      }
    }
    
    return Array.from(uniqueApis.values());
  }
}
