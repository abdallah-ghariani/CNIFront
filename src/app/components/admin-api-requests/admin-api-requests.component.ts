import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ApiRequest } from '../../models/api-request';
import { Role, mapLegacyRole } from '../../models/roles';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { RippleModule } from 'primeng/ripple';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'app-admin-api-requests',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    BadgeModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ProgressSpinnerModule,
    DialogModule,
    DropdownModule,
    ChartModule,
    MultiSelectModule,
    TooltipModule,
    AvatarModule,
    DividerModule,
    ChipModule,
    RippleModule,
    ProgressBarModule,
    DataViewModule
  ],
  templateUrl: './admin-api-requests.component.html',
  styleUrl: './admin-api-requests.component.css',
  providers: [ConfirmationService, MessageService]
})
export class AdminApiRequestsComponent implements OnInit {
  // API requests data
  userApiRequests: ApiRequest[] = [];
  filteredRequests: ApiRequest[] = [];
  loading = false;
  isAdmin = false;
  currentUserRole: Role | string | null | undefined = null;
  currentUserEmail: string = '';
  
  // For filtering and display options
  globalFilter: string = '';
  layoutView: 'grid' | 'table' = 'grid';
  sortField: string = 'requestDate';
  sortOrder: number = -1;
  selectedStatuses: string[] = [];
  selectedSectors: string[] = [];
  
  // Status list for filtering
  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
  ];
  
  // Available sectors for filtering (based on Tunisia's government sectors)
  sectorOptions = [
    { label: 'Civil Status and Official Documents', value: 'Civil Status and Official Documents' },
    { label: 'Education', value: 'Education' },
    { label: 'Higher Education and Scientific Research', value: 'Higher Education and Scientific Research' },
    { label: 'Social Affairs', value: 'Social Affairs' },
    { label: 'Transport and Vehicles', value: 'Transport and Vehicles' }
  ];
  
  // For chart display
  chartData: any;
  chartOptions: any;
  
  // For request details display
  selectedRequest: ApiRequest | null = null;
  showRequestDetails: boolean = false;
  
  // Statistics
  stats: any = {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    sectorDistribution: []
  };

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router
  ) {
    // Check user roles on initialization
    this.currentUserRole = this.authService.getCurrentUserRole();
    
    // Map legacy roles if needed
    const mappedRole = typeof this.currentUserRole === 'string' ? 
                       mapLegacyRole(this.currentUserRole) : 
                       this.currentUserRole || null;
    
    // Only admins should have access to this component
    this.isAdmin = mappedRole === Role.admin;
    
    // Redirect non-admin users if they somehow reach this page
    if (!this.isAdmin) {
      this.messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to access this page.'
      });
      // Redirect non-admin users away from this page
      setTimeout(() => this.router.navigate(['/']), 1000);
    }
    
    console.log('Current user role:', this.currentUserRole);
    console.log('Mapped role:', mappedRole);
    console.log('Is admin:', this.isAdmin);
    
    // Get current user's email to filter out their own requests
    this.authService.getLoggedInUser().subscribe(user => {
      if (user) {
        this.currentUserEmail = user.email || '';
        console.log('Current user email for filtering:', this.currentUserEmail);
      }
    });
  }

  ngOnInit() {
    // Load API requests on component initialization
    console.log('AdminApiRequestsComponent initialized');
    this.loadUserApiRequests();
    this.initCharts();
  }
  
  initCharts() {
    // Initialize chart options
    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#495057',
            usePointStyle: true,
            padding: 20
          }
        }
      },
      responsive: true,
      aspectRatio: 1.4,
      cutout: '60%',
      animation: {
        animateScale: true,
        animateRotate: true
      }
    };
  }
  
  updateCharts() {
    // Update sector distribution chart
    const sectorLabels = this.stats.sectorDistribution.map((item: any) => item.sector);
    const sectorData = this.stats.sectorDistribution.map((item: any) => item.count);
    
    // Generate colors for sectors
    const sectorColors = [
      '#42A5F5', // Blue
      '#66BB6A', // Green
      '#FFA726', // Orange
      '#EF5350', // Red
      '#AB47BC', // Purple
      '#EC407A', // Pink
      '#7E57C2', // Deep Purple
      '#26A69A'  // Teal
    ];
    
    this.chartData = {
      labels: sectorLabels,
      datasets: [
        {
          data: sectorData,
          backgroundColor: sectorColors.slice(0, sectorLabels.length),
          hoverBackgroundColor: sectorColors.map(color => this.adjustColorBrightness(color, 20))
        }
      ]
    };
  }
  
  adjustColorBrightness(hex: string, percent: number) {
    // Adjust color brightness for hover effects
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) + percent;
    const g = ((num >> 8) & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;
    
    const newR = r > 255 ? 255 : r;
    const newG = g > 255 ? 255 : g;
    const newB = b > 255 ? 255 : b;
    
    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
  }

  // Load new API requests for admin approval
  loadUserApiRequests() {
    this.loading = true;
    console.log('Loading new API requests for admin approval');
    
    // Use the real API service to get requests
    this.apiService.getAdminApiRequests().subscribe({
      next: (requests) => {
        console.log('Loaded', requests.length, 'API requests');
        
        // Only process requests if user is admin
        if (!this.isAdmin) {
          this.userApiRequests = [];
          this.loading = false;
          return;
        }
        
        this.userApiRequests = requests.filter(request => {
          return this.isNewApiRequest(request);
        });
        
        // Apply initial filter to all requests
        this.filteredRequests = [...this.userApiRequests];
        
        // Update statistics
        this.updateStatistics();
        this.updateCharts();
        
        console.log('After filtering for new API requests, showing', this.userApiRequests.length, 'requests');
        
        // Additional filtering and processing
        // Try to clean up any null or corrupted requests
        this.userApiRequests = this.userApiRequests.filter(request => {
          return request && request.id;
        });
        
        // Sort by date, newest first
        this.userApiRequests.sort((a, b) => {
          const dateA = a.requestDate ? new Date(a.requestDate).getTime() : 0;
          const dateB = b.requestDate ? new Date(b.requestDate).getTime() : 0;
          return dateB - dateA;
        });
        
        // Remove any duplicate requests (by ID)
        const uniqueRequests: ApiRequest[] = [];
        const requestIds = new Set<string>();
        this.userApiRequests.forEach(request => {
          if (request.id && !requestIds.has(request.id)) {
            requestIds.add(request.id);
            uniqueRequests.push(request);
          }
        });
        this.userApiRequests = uniqueRequests;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading API requests:', error);
        // Extract more useful details from the error
        let errorMessage = 'Failed to load API requests. ';
        
        if (error.status === 401) {
          errorMessage += 'Authentication error. Please log in again.';
        } else if (error.status === 403) {
          errorMessage += 'You do not have permission to access this resource.';
        } else if (error.status === 404) {
          errorMessage += 'API endpoint not found.';
        } else if (error.status === 0) {
          errorMessage += 'Backend server might be unavailable. Check server status.';
        } else {
          errorMessage += `Server error (${error.status || 'unknown'}). Please try again.`;
        }
        
        // Log detailed error information for debugging
        console.log('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
          body: error.error
        });
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 10000 // Show for 10 seconds
        });
        this.loading = false;
      }
    });
  }

  // Handle API request action (approve/reject)
  handleApiRequestAction(request: ApiRequest, action: 'approve' | 'reject') {
    // Only admins can approve new API requests
    if (!this.isAdmin) {
      this.messageService.add({
        severity: 'error',
        summary: 'Permission Denied',
        detail: 'Only administrators can approve or reject new API creation requests.',
        life: 5000
      });
      return;
    }
    
    const confirmMessage = `This is a request to create a new API. Are you sure you want to ${action} this request from ${request.name}?`;
    
    this.confirmationService.confirm({
      message: confirmMessage,
      header: `${action === 'approve' ? 'Approve' : 'Reject'} API Request`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Show loading state
        const originalStatus = request.status;
        // Use pending as the interim status since 'processing' isn't a valid status type
        request.status = 'pending';

        console.log(`Processing ${action} for request ID: ${request.id}`);
        
        // Ensure request ID is valid
        if (!request.id) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid request ID. Cannot process the request.'
          });
          return;
        }
        
        // Use clear, specific methods for new API requests
        const method = action === 'approve'
          ? this.apiService.approveNewApiRequest(request.id, 'New API request approved by administrator.')
          : this.apiService.rejectNewApiRequest(request.id, 'New API request rejected by administrator.');

        method.subscribe({
          next: (response) => {
            // Update the request status
            request.status = action === 'approve' ? 'approved' : 'rejected';
            
            // Show success message
            this.messageService.add({
              severity: 'success',
              summary: action === 'approve' ? 'Approved' : 'Rejected',
              detail: `The new API creation request has been ${action === 'approve' ? 'approved' : 'rejected'}.`
            });

            // Reload the list after a short delay
            setTimeout(() => this.loadUserApiRequests(), 500);
          },
          error: (error) => {
            console.error(`Error ${action}ing API request:`, error);
            // Revert status
            request.status = originalStatus;
            
            // Handle 404 - Not Found
            if (error.status === 404 || (error.error && error.error.message && error.error.message.includes('not found'))) {
              // Remove the request from the UI
              this.userApiRequests = this.userApiRequests.filter(r => r.id !== request.id);
              
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
                detail: `Failed to ${action} API request. Please try again.`
              });
            }
          }
        });
      }
    });
  }

  // Simple helper function to check if an API request is for a new API
  isNewApiRequest(request: ApiRequest): boolean {
    // Check if this is a request to create a new API
    // Simplified by just checking if API ID exists and is valid
    return !request.apiId || request.apiId === '' || request.status === 'pending';
  }

  // Get status display class based on status value
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Get color for sector visualization
  getSectorColor(sector: string | undefined): string {
    if (!sector) return '#CCCCCC'; // Default gray for undefined sectors
    
    // Map sectors to specific colors for consistent visualization
    const sectorColorMap: {[key: string]: string} = {
      'Civil Status and Official Documents': '#42A5F5', // Blue
      'Education': '#66BB6A', // Green
      'Higher Education and Scientific Research': '#7E57C2', // Purple
      'Social Affairs': '#FFA726', // Orange
      'Transport and Vehicles': '#EF5350' // Red
    };
    
    return sectorColorMap[sector] || '#CCCCCC';
  }

  // Apply global filter
  onGlobalFilter(event: Event) {
    this.globalFilter = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  
  // Apply all filters (global, status, sector)
  applyFilters() {
    // Start with all requests
    let filtered = [...this.userApiRequests];
    
    // Apply status filter if any statuses are selected
    if (this.selectedStatuses && this.selectedStatuses.length > 0) {
      filtered = filtered.filter(req => this.selectedStatuses.includes(req.status));
    }
    
    // Apply sector filter if any sectors are selected
    if (this.selectedSectors && this.selectedSectors.length > 0) {
      filtered = filtered.filter(req => this.selectedSectors.includes(req.secteur));
    }
    
    // Apply global text filter
    if (this.globalFilter) {
      const filterValue = this.globalFilter.toLowerCase();
      filtered = filtered.filter(req => {
        return (
          (req.name && req.name.toLowerCase().includes(filterValue)) ||
          (req.apiName && req.apiName.toLowerCase().includes(filterValue)) ||
          (req.email && req.email.toLowerCase().includes(filterValue)) ||
          (req.structure && req.structure.toLowerCase().includes(filterValue)) ||
          (req.secteur && req.secteur.toLowerCase().includes(filterValue)) ||
          (req.message && req.message.toLowerCase().includes(filterValue))
        );
      });
    }
    
    this.filteredRequests = filtered;
  }
  
  // Reset all filters
  resetFilters() {
    this.globalFilter = '';
    this.selectedStatuses = [];
    this.selectedSectors = [];
    this.filteredRequests = [...this.userApiRequests];
  }
  
  // Toggle between grid and table view
  toggleView(view: 'grid' | 'table') {
    this.layoutView = view;
  }
  
  // Show request details in a dialog
  showDetails(request: ApiRequest) {
    this.selectedRequest = request;
    this.showRequestDetails = true;
  }
  
  // Update statistics based on current data
  updateStatistics() {
    // Calculate statistics based on actual data
    const totalRequests = this.userApiRequests.length;
    const pendingRequests = this.userApiRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = this.userApiRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = this.userApiRequests.filter(req => req.status === 'rejected').length;
    
    // Calculate sector distribution
    interface SectorData {
      count: number;
      percentage: number;
    }
    
    const sectors: Record<string, SectorData> = {};
    
    this.userApiRequests.forEach(req => {
      if (req.secteur) {
        if (!sectors[req.secteur]) {
          sectors[req.secteur] = { count: 0, percentage: 0 };
        }
        sectors[req.secteur].count++;
      }
    });
    
    // Calculate percentages
    const sectorDistribution = [];
    for (const [sector, data] of Object.entries(sectors)) {
      sectorDistribution.push({
        sector: sector,
        count: data.count,
        percentage: Math.round((data.count / totalRequests) * 100)
      });
    }
    
    // Sort by count descending
    sectorDistribution.sort((a, b) => b.count - a.count);
    
    this.stats = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      sectorDistribution
    };
  }
}
