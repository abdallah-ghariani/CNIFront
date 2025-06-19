import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdherationService } from '../../services/adheration.service';
import { UserService } from '../../services/user.service';
import { StructureService } from '../../services/structure.service';
import { SecteurService } from '../../services/secteur.service';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Adheration } from '../../models/adheration';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-adheration-request-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './adheration.component.html',
  styleUrls: ['./adheration.component.css'],
})
export class AdherationRequestListComponent {
  requests = signal<Adheration[]>([]);
  selectedRequest: Adheration | null = null;
  displayDetailsDialog = false;

  constructor(
    private adherationService: AdherationService,
    private userService: UserService,
    private structureService: StructureService,
    private secteurService: SecteurService,
    private confirmationService: ConfirmationService
  ) {
    this.loadRequests();
  }

  loadRequests() {
    // Load structures and secteurs first
    this.loadStructuresAndSecteurs();
    
    // Load the requests from the service
    this.adherationService.getAdherationRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        console.log('Loaded requests:', data);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load membership requests',
          life: 3000
        });
      }
    });
  }
  
  loadStructuresAndSecteurs() {
    // Load structures
    this.structureService.getStructures().pipe(
      catchError(error => {
        console.error('Error loading structures:', error);
        return of([]);
      }),
      // Ensure we have an array to work with
      map(response => {
        // Handle both array and paginated responses
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'content' in response) {
          // For paginated responses
          return response.content;
        }
        return [];
      })
    ).subscribe(structures => {
      // Explicitly type the structure for safety
      structures.forEach((structure: {id?: string, _id?: string, name?: string}) => {
        if (structure.id && structure.name) {
          this.structureMap.set(structure.id, structure.name);
        } else if (structure._id && structure.name) {
          // Handle MongoDB _id format if needed
          this.structureMap.set(structure._id, structure.name);
        }
      });
    });
    
    // Load secteurs
    this.secteurService.getSecteurs().pipe(
      catchError(error => {
        console.error('Error loading secteurs:', error);
        return of([]);
      }),
      // Ensure we have an array to work with
      map(response => {
        // Handle both array and paginated responses
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'content' in response) {
          // For paginated responses
          return response.content;
        }
        return [];
      })
    ).subscribe(secteurs => {
      // Explicitly type the secteur for safety
      secteurs.forEach((secteur: {id?: string, _id?: string, name?: string}) => {
        if (secteur.id && secteur.name) {
          this.secteurMap.set(secteur.id, secteur.name);
        } else if (secteur._id && secteur.name) {
          // Handle MongoDB _id format if needed
          this.secteurMap.set(secteur._id, secteur.name);
        }
      });
    });

  }

  showDetails(request: Adheration) {
    this.selectedRequest = request;
    
    // Look up the names based on IDs
    this.selectedStructureName = this.getStructureName(request.structure);
    this.selectedSecteurName = this.getSecteurName(request.secteur);
    
    this.displayDetailsDialog = true;
  }
  
  getStructureName(structureId: string): string {
    return this.structureMap.get(structureId) || structureId;
  }
  
  getSecteurName(secteurId: string): string {
    return this.secteurMap.get(secteurId) || secteurId;
  }

  showDetails(request: Adheration) {
    this.selectedRequest = request;
    this.displayDetailsDialog = true;
  }

  accept(id: string) {
    console.log('Accepting request with ID:', id);
    
    this.adherationService.acceptRequest(id).subscribe({
      next: (response) => {
        console.log('Component received response:', response);
        
        if (response.success) {
          // Request was successful
          this.updateStatus(id, 'ACCEPTED');
          
          // Reload the requests list to get the updated data
          this.loadRequests();
          
          // Show success message
          if (response.email) {
            console.log('Email found in response, showing notification');
            this.messageService.add({
              severity: 'success',
              summary: 'Request Accepted ✓',
              detail: `Confirmation email will be sent to ${response.email}`,
              life: 5000
            });
            
            // The user should check their email for login credentials
            this.messageService.add({
              severity: 'info',
              summary: 'User Notification',
              detail: 'The user should check their email for login credentials',
              life: 8000
            });
          } else {
            console.warn('No email in response, showing generic notification');
            this.messageService.add({
              severity: 'info',
              summary: 'Request Accepted',
              detail: 'The membership request has been approved',
              life: 5000
            });
          }
        } else {
          // Request failed but with a response
          console.error('Request failed with error:', response.error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.error || 'Failed to accept the request. Please try again.',
            life: 5000
          });
        }
      },
      error: (error) => {
        // This should rarely happen now as most errors are caught and returned as responses
        console.error('Subscription error accepting request:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to accept the request. Please try again.',
          life: 5000
        });
      }
    });
  }

  refuse(id: string) {
    this.adherationService.refuseRequest(id).subscribe(() => {
      this.updateStatus(id, 'REFUSED');
    });
  }

  confirmDelete(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this request?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.delete(id);
      },
    });
  }

  delete(id: string) {
    this.adherationService.deleteRequest(id).subscribe(() => {
      this.requests.set(this.requests().filter(r => r.id !== id));
    });
  }

  private updateStatus(id: string, status: string) {
    const updated = this.requests().map(r => r.id === id ? { ...r, status } : r);
    this.requests.set(updated);
  }
}
