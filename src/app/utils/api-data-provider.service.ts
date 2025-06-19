import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StructureService } from '../services/structure.service';
import { SecteurService } from '../services/secteur.service';
import { ServiceManagementService } from '../services/service.service';
import { AuthService } from '../services/auth.service';
import { Structure } from '../models/structure';
import { Secteur } from '../models/secteur';
import { Service } from '../models/service';
import { Role } from '../models/roles';

/**
 * Service to provide common data loading functionality for API components
 * This reduces code duplication for loading structures, sectors, services, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiDataProviderService {
  // Common data containers
  private structures = new BehaviorSubject<Structure[]>([]);
  private sectors = new BehaviorSubject<Secteur[]>([]);
  private services = new BehaviorSubject<Service[]>([]);
  private userRole = new BehaviorSubject<Role | null>(null);
  private userStructureId = new BehaviorSubject<string | null>(null);
  private userSectorId = new BehaviorSubject<string | null>(null);

  // Loading state trackers
  private structuresLoading = new BehaviorSubject<boolean>(false);
  private sectorsLoading = new BehaviorSubject<boolean>(false);
  private servicesLoading = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly structures$ = this.structures.asObservable();
  public readonly sectors$ = this.sectors.asObservable();
  public readonly services$ = this.services.asObservable();
  public readonly userRole$ = this.userRole.asObservable();
  public readonly userStructureId$ = this.userStructureId.asObservable();
  public readonly userSectorId$ = this.userSectorId.asObservable();
  
  // Loading state observables
  public readonly structuresLoading$ = this.structuresLoading.asObservable();
  public readonly sectorsLoading$ = this.sectorsLoading.asObservable();
  public readonly servicesLoading$ = this.servicesLoading.asObservable();

  constructor(
    private structureService: StructureService,
    private secteurService: SecteurService,
    private serviceManagementService: ServiceManagementService,
    private authService: AuthService
  ) {}

  /**
   * Load user information from JWT token
   */
  loadUserInfo(): Observable<any> {
    return this.authService.getLoggedInUser().pipe(
      tap(user => {
        // Set user role
        if (user && user.role) {
          this.userRole.next(user.role);
        }

        // Set user structure/sector if available
        if (user && user.structure) {
          this.userStructureId.next(user.structure);
        }
        
        if (user && user.secteur) {
          this.userSectorId.next(user.secteur);
        }
      }),
      catchError(err => {
        console.error('Error loading user info:', err);
        return [];
      })
    );
  }

  /**
   * Load structures with optional pagination
   */
  loadStructures(page = 0, size = 100): Observable<any> {
    this.structuresLoading.next(true);
    
    return this.structureService.getStructures(page, size).pipe(
      tap(response => {
        if (response && response.content) {
          this.structures.next(response.content);
        }
        this.structuresLoading.next(false);
      }),
      catchError(err => {
        console.error('Error loading structures:', err);
        this.structuresLoading.next(false);
        return [];
      })
    );
  }

  /**
   * Load sectors with optional pagination
   */
  loadSectors(page = 0, size = 100): Observable<any> {
    this.sectorsLoading.next(true);
    
    return this.secteurService.getSecteurs(page, size).pipe(
      tap(response => {
        if (response && response.content) {
          this.sectors.next(response.content);
        }
        this.sectorsLoading.next(false);
      }),
      catchError(err => {
        console.error('Error loading sectors:', err);
        this.sectorsLoading.next(false);
        return [];
      })
    );
  }

  /**
   * Load services with optional pagination
   */
  loadServices(page = 0, size = 100): Observable<any> {
    this.servicesLoading.next(true);
    
    return this.serviceManagementService.getServices(page, size).pipe(
      tap(response => {
        if (response && response.content) {
          this.services.next(response.content);
        }
        this.servicesLoading.next(false);
      }),
      catchError(err => {
        console.error('Error loading services:', err);
        this.servicesLoading.next(false);
        return [];
      })
    );
  }

  /**
   * Get all loaded structures
   */
  getStructures(): Structure[] {
    return this.structures.getValue();
  }

  /**
   * Get all loaded sectors
   */
  getSectors(): Secteur[] {
    return this.sectors.getValue();
  }

  /**
   * Get all loaded services
   */
  getServices(): Service[] {
    return this.services.getValue();
  }

  /**
   * Get user role
   */
  getUserRole(): Role | null {
    return this.userRole.getValue();
  }

  /**
   * Get user structure ID
   */
  getUserStructureId(): string | null {
    return this.userStructureId.getValue();
  }

  /**
   * Get user sector ID
   */
  getUserSectorId(): string | null {
    return this.userSectorId.getValue();
  }

  /**
   * Create dropdown options for structures
   */
  getStructureOptions(): { label: string; value: string }[] {
    return this.structures.getValue().map(structure => ({
      label: structure.name || 'Unknown',
      value: structure.id || ''
    }));
  }

  /**
   * Create dropdown options for sectors
   */
  getSectorOptions(): { label: string; value: string }[] {
    return this.sectors.getValue().map(sector => ({
      label: sector.name || 'Unknown',
      value: sector.id || ''
    }));
  }

  /**
   * Create dropdown options for services
   */
  getServiceOptions(): { label: string; value: string }[] {
    return this.services.getValue().map(service => ({
      label: service.name || 'Unknown',
      value: service.id || ''
    }));
  }

  /**
   * Sort dropdown options with the user's item first
   */
  sortOptionsWithUserFirst(options: { label: string; value: string }[], userValue: string): { label: string; value: string }[] {
    if (!options || !options.length || !userValue) return options;
    
    return [...options].sort((a, b) => {
      if (a.value === userValue) return -1;
      if (b.value === userValue) return 1;
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Check if a structure is the user's current structure
   */
  isUserStructure(structureId: string): boolean {
    const userStructureId = this.userStructureId.getValue();
    if (!userStructureId || !structureId) return false;
    return structureId === userStructureId;
  }
}
