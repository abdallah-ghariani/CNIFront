import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ApiRequest } from '../../models/api-request';
import { Role, mapLegacyRole } from '../../models/roles';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-api-access-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './api-access-requests.component.html',
  styleUrls: ['./api-access-requests.component.css']
})
export class ApiAccessRequestsComponent implements OnInit {
  // Pending requests section with pagination
  requests: ApiRequest[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  
  // Approved APIs section
  approvedApis: ApiRequest[] = [];
  loadingApproved = true;
  
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    // Load real data from the backend
    this.loadRequests();
    this.loadApprovedApis();
  }
  
  loadRequests(page: number = 0, size: number = 10): void {
    this.loading = true;
    this.requests = []; // Clear current data while loading
    
    this.apiService.getPendingApiRequests(page, size).subscribe({
      next: (response) => {
        // Ensure we always have an array, even if response.content is undefined
        this.requests = Array.isArray(response?.content) ? response.content : [];
        this.totalRecords = response?.totalElements || 0;
        this.loading = false;
        
        // Log the number of requests loaded for debugging
        console.log(`Loaded ${this.requests.length} of ${this.totalRecords} pending API access requests`);
        
        // If no requests found, show a friendly message
        if (this.requests.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Information',
            detail: 'Aucune demande d\'accès en attente pour vos APIs.',
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error loading pending API access requests:', error);
        this.loading = false;
        this.requests = []; // Ensure requests is always an array
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les demandes d\'accès en attente',
          life: 5000
        });
      }
    });
  }
  
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    const page = event.first / event.rows;
    this.loadRequests(page, event.rows);
  }
  
  /**
   * Load APIs that the current user has been approved to access
   */
  loadApprovedApis(): void {
    this.loadingApproved = true;
    this.apiService.getUserApprovedApis().subscribe({
      next: (data) => {
        this.approvedApis = data;
        this.loadingApproved = false;
        
        // Log the number of approved APIs loaded for debugging
        console.log(`Loaded ${data.length} approved API access requests`);
      },
      error: (error) => {
        console.error('Error loading approved APIs:', error);
        this.loadingApproved = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les APIs approuvées'
        });
      }
    });
  }
  
  /**
   * View API details for an approved API
   */
  viewApiDetails(api: ApiRequest): void {
    // Navigate to API details page or show a dialog with API details
    // This can be customized based on your application's requirements
    console.log('Viewing API details:', api);
    window.open(`/api/detail/${api.apiId}`, '_blank');
  }
  
  confirmApproval(request: ApiRequest): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to approve this API access request?`,
      header: 'Confirm Approval',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.approveRequest(request);
      }
    });
  }
  
  confirmRejection(request: ApiRequest): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to reject this API access request?`,
      header: 'Reject Access Request',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-outlined p-button-danger',
      accept: () => {
        this.rejectRequest(request);
      }
    });
  }
  
  approveRequest(request: ApiRequest): void {
    this.apiService.approveApiUsageRequest(
      request.id!,
      'API usage request approved by owner'
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'API access request approved successfully',
          styleClass: 'p-toast-info-blue'
        });
        this.loadRequests(); // Reload the list
      },
      error: (error) => {
        console.error('Error approving request:', error);
        
        // Handle 404 - Not Found
        if (error.status === 404 || (error.error && error.error.message && error.error.message.includes('not found'))) {
          // Remove the request from the UI
          this.requests = this.requests.filter(r => r.id !== request.id);
          
          this.messageService.add({
            severity: 'warn',
            summary: 'Request Not Found',
            detail: 'This request could not be found. It may have been already processed or deleted.',
            life: 5000
          });
        } else {
          // Show generic error message for other errors
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error approving API access request'
          });
        }
      }
    });
  }
  
  rejectRequest(request: ApiRequest): void {
    const rejectionReason = prompt('Please provide a reason for rejecting this request:');
    
    if (!rejectionReason) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Rejection Cancelled',
        detail: 'Please provide a reason for rejection',
        styleClass: 'p-toast-warn'
      });
      return;
    }

    this.apiService.rejectApiUsageRequest(
      request.id!,
      `API usage request rejected by owner: ${rejectionReason}`
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Information',
          detail: 'API access request rejected',
          styleClass: 'p-toast-info-blue'
        });
        this.loadRequests(); // Reload the list
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        
        // Handle 404 - Not Found
        if (error.status === 404 || (error.error && error.error.message && error.error.message.includes('not found'))) {
          // Remove the request from the UI
          this.requests = this.requests.filter(r => r.id !== request.id);
          
          this.messageService.add({
            severity: 'warn',
            summary: 'Request Not Found',
            detail: 'This request could not be found. It may have been already processed or deleted.',
            life: 5000
          });
        } else {
          // Show generic error message for other errors
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error rejecting API access request'
          });
        }
      }
    });
  }
}
