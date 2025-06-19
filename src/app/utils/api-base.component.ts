import { Directive, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ApiDataProviderService } from './api-data-provider.service';
import { ApiHelpers } from './api-helpers';
import { Role } from '../models/roles';
import { Structure } from '../models/structure';
import { Secteur } from '../models/secteur';
import { Service } from '../models/service';

/**
 * Base component class for API-related components
 * Provides common functionality and state management
 */
@Directive()
export class ApiBaseComponent implements OnInit, OnDestroy {
  // Common fields used across API components
  protected userRole: Role | null = null;
  protected userStructureId: string | null = null;
  protected userSectorId: string | null = null;
  
  // Dropdown options
  protected structures: Structure[] = [];
  protected sectors: Secteur[] = [];
  protected services: Service[] = [];
  
  // Dropdown options formatted for PrimeNG
  protected structureOptions: { label: string; value: string }[] = [];
  protected sectorOptions: { label: string; value: string }[] = [];
  protected serviceOptions: { label: string; value: string }[] = [];
  
  // Loading states
  protected loading = false;
  protected structuresLoading = false;
  protected sectorsLoading = false;
  protected servicesLoading = false;
  
  // For pagination
  protected page = 0;
  protected size = 10;
  protected totalItems = 0;
  
  // For component cleanup
  protected destroy$ = new Subject<void>();

  constructor(
    protected apiDataProvider: ApiDataProviderService,
    protected apiHelpers: ApiHelpers,
    protected messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Load user information
    this.loadUserInfo();
    
    // Subscribe to loading states
    this.apiDataProvider.structuresLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.structuresLoading = loading);
      
    this.apiDataProvider.sectorsLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.sectorsLoading = loading);
      
    this.apiDataProvider.servicesLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.servicesLoading = loading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user information from JWT token
   */
  protected loadUserInfo(): void {
    this.apiDataProvider.loadUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        // User information is now stored in the data provider
        // We can retrieve it with the getter methods
        this.userRole = this.apiDataProvider.getUserRole();
        this.userStructureId = this.apiDataProvider.getUserStructureId();
        this.userSectorId = this.apiDataProvider.getUserSectorId();
      });
  }

  /**
   * Load structures for dropdowns
   */
  protected loadStructures(): void {
    this.apiDataProvider.loadStructures()
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.structures = this.apiDataProvider.getStructures();
        this.structureOptions = this.apiDataProvider.getStructureOptions();
        
        // Sort options to put user's structure first if available
        if (this.userStructureId) {
          this.structureOptions = this.apiDataProvider.sortOptionsWithUserFirst(
            this.structureOptions, 
            this.userStructureId
          );
        }
      });
  }

  /**
   * Load sectors for dropdowns
   */
  protected loadSectors(): void {
    this.apiDataProvider.loadSectors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.sectors = this.apiDataProvider.getSectors();
        this.sectorOptions = this.apiDataProvider.getSectorOptions();
        
        // Sort options to put user's sector first if available
        if (this.userSectorId) {
          this.sectorOptions = this.apiDataProvider.sortOptionsWithUserFirst(
            this.sectorOptions, 
            this.userSectorId
          );
        }
      });
  }

  /**
   * Load services for dropdowns
   */
  protected loadServices(): void {
    this.apiDataProvider.loadServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.services = this.apiDataProvider.getServices();
        this.serviceOptions = this.apiDataProvider.getServiceOptions();
      });
  }

  /**
   * Check if structure is the user's structure
   */
  protected isUserStructure(structureId: string): boolean {
    return this.apiDataProvider.isUserStructure(structureId);
  }

  /**
   * Get appropriate severity class for status badges
   */
  protected getStatusClass(status: string | undefined): string {
    return this.apiHelpers.getStatusClass(status);
  }

  /**
   * Get structure name from structure ID
   */
  protected getStructureName(structureId: string | undefined): string {
    return this.apiHelpers.getStructureName(structureId);
  }

  /**
   * Get sector name from sector ID
   */
  protected getSectorName(sectorId: string | undefined): string {
    return this.apiHelpers.getSectorName(sectorId);
  }

  /**
   * Get service name from service ID
   */
  protected getServiceName(serviceId: string | undefined): string {
    return this.apiHelpers.getServiceName(serviceId);
  }

  /**
   * Show success message
   */
  protected showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail
    });
  }

  /**
   * Show error message
   */
  protected showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail
    });
  }

  /**
   * Show warning message
   */
  protected showWarning(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail
    });
  }

  /**
   * Show info message
   */
  protected showInfo(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail
    });
  }
  
  /**
   * Checks if a string is valid JSON
   */
  protected isJsonString(str: string): boolean {
    return this.apiHelpers.isJsonString(str);
  }
  
  /**
   * Parse API description JSON
   */
  protected getApiJsonDescription(description: string): any {
    return this.apiHelpers.getApiJsonDescription(description);
  }
  
  /**
   * Format a JSON date
   */
  protected formatJsonDate(dateValue: any): string {
    return this.apiHelpers.formatJsonDate(dateValue);
  }
  
  /**
   * Get endpoints from API description
   */
  protected getJsonEndpoints(description: string): string[] {
    return this.apiHelpers.getJsonEndpoints(description);
  }
  
  /**
   * Get endpoint description
   */
  protected getEndpointDescription(endpoint: string): string {
    return this.apiHelpers.getEndpointDescription(endpoint);
  }
  
  /**
   * Check if API has auth info
   */
  protected hasAuthInfo(description: string): boolean {
    return this.apiHelpers.hasAuthInfo(description);
  }
  
  /**
   * Remove duplicate APIs
   */
  protected removeDuplicateApis(apis: any[]): any[] {
    return this.apiHelpers.removeDuplicateApis(apis);
  }
}
