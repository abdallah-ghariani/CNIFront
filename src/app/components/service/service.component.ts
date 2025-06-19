import { Component, signal } from '@angular/core';
import { Service } from '../../models/service';
import { ConfirmationService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { ServiceManagementService } from '../../services/service.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    SelectModule,
    TooltipModule,
    CommonModule
  ],
  templateUrl: 'service.component.html',
  styles: [`
    ::ng-deep .p-datatable-table-container {
      min-height: 300px;
    }
  `],
  providers: [ConfirmationService],
})
export class ServiceListComponent {
  services = signal<Service[]>([]);
  displayEditDialog: boolean = false;
  displayAddDialog: boolean = false;
  selectedService: Service = { id: '', name: '' };
  newService = { name: '' };
  loading = false;
  total = 0;
  errorMessage = '';

  constructor(
    private serviceManagementService: ServiceManagementService,
    private confirmationService: ConfirmationService
  ) {}

  loadServices(event: TableLazyLoadEvent) {
    this.loading = true;
    const size = event.rows || 10;
    const page = event.first ? Math.floor(event.first / size) : 0;

    this.serviceManagementService.getServices(page, size).subscribe({
      next: (data) => {
        this.services.set(data.content);
        this.total = data.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading services', error);
        this.errorMessage = error.message || 'An error occurred while loading services';
        this.loading = false;
      }
    });
  }

  showAddDialog() {
    this.newService = { name: '' };
    this.displayAddDialog = true;
  }

  showEditDialog(service: Service) {
    this.selectedService = { ...service };
    this.displayEditDialog = true;
  }

  addService() {
    if (!this.newService.name.trim()) {
      this.errorMessage = 'Service name is required';
      return;
    }

    this.serviceManagementService.createService(this.newService as Service).subscribe({
      next: (service) => {
        // Refresh the service list
        const currentServices = [...this.services()];
        currentServices.unshift(service);
        this.services.set(currentServices);
        this.displayAddDialog = false;
      },
      error: (error) => {
        console.error('Error creating service', error);
        this.errorMessage = error.message || 'An error occurred while creating the service';
      }
    });
  }

  updateService() {
    if (!this.selectedService.name.trim()) {
      this.errorMessage = 'Service name is required';
      return;
    }

    this.serviceManagementService.updateService(this.selectedService.id, this.selectedService).subscribe({
      next: (updatedService) => {
        // Update the service in the list
        const currentServices = [...this.services()];
        const index = currentServices.findIndex(s => s.id === updatedService.id);
        if (index !== -1) {
          currentServices[index] = updatedService;
          this.services.set(currentServices);
        }
        this.displayEditDialog = false;
      },
      error: (error) => {
        console.error('Error updating service', error);
        this.errorMessage = error.message || 'An error occurred while updating the service';
      }
    });
  }

  confirmDelete(service: Service) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete service "${service.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteService(service);
      }
    });
  }

  deleteService(service: Service) {
    this.serviceManagementService.deleteService(service.id).subscribe({
      next: () => {
        // Remove the service from the list
        const currentServices = this.services().filter(s => s.id !== service.id);
        this.services.set(currentServices);
      },
      error: (error) => {
        console.error('Error deleting service', error);
        this.errorMessage = error.message || 'An error occurred while deleting the service';
      }
    });
  }
}
