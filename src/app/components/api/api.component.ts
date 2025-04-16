/*import { Component, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Api } from '../../models/api';
import { FilterMetadata, ConfirmationService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-api-list',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './api.component.html',
  styles: [`
    ::ng-deep .p-datatable-table-container {
      min-height: 300px;
    }
  `],
  providers: [ConfirmationService],
})
export class ApiListComponent {
  apis = signal<Api[]>([]);
  loading = false;
  total = 0;
  globalFilter = '';

  // Dropdown options (you can fetch these dynamically if needed)
  structures = [
    { label: 'Toutes les structures', value: null },
    { label: 'INSEE', value: 'INSEE' },
    // Add more structures as needed
  ];

  availabilities = [
    { label: 'Toutes les modalités d’accès', value: null },
    { label: 'Disponibilité > 99%', value: 99 },
    { label: 'Disponibilité > 95%', value: 95 },
    // Add more as needed
  ];

  constructor(private apiService: ApiService) {}

  loadApis(event: TableLazyLoadEvent) {
    this.loading = true;
    const size = event.rows as number;
    const page = Math.floor((event.first || 0) / size);
    const structure = (event.filters?.['structure'] as FilterMetadata)?.value;
    const availability = (event.filters?.['availability'] as FilterMetadata)?.value;

    this.apiService.getApis(page, size, undefined, structure, availability).subscribe({
      next: (page) => {
        this.apis.set(page.content);
        this.total = page.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading APIs:', err);
        this.loading = false;
      },
    });
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
  }

  onSearch() {
    // Trigger table reload with the global filter if needed
    // For now, we'll rely on the table's built-in filtering
  }
}*/
import { Component, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Api } from '../../models/api';
import { FilterMetadata, ConfirmationService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-api-list',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './api.component.html',
  styles: [`
    ::ng-deep .p-datatable-table-container {
      min-height: 300px;
    }
  `],
  providers: [ConfirmationService],
})
export class ApiListComponent {
  apis = signal<Api[]>([]);
  loading = false;
  total = 0;
  globalFilter = '';

  structures = [
    { label: 'Toutes les structures', value: null },
    { label: 'INSEE', value: 'INSEE' },
  ];

  availabilities = [
    { label: 'Toutes les modalités d’accès', value: null },
    { label: 'Disponibilité > 99%', value: 99 },
    { label: 'Disponibilité > 95%', value: 95 },
  ];

  constructor(private apiService: ApiService) {
    // Add dummy data for testing
    this.apis.set([
      {
        id: '1',
        name: 'API SIRENE',
        secteur: 'Entreprises',
        structure: 'INSEE',
        availability: 99.5,
        description: 'API pour interroger le répertoire SIRENE.',
        updatedAt: 'Mis à jour le 24 décembre 2024',
      },
      {
        id: '2',
        name: 'API Geo',
        secteur: 'Géographie',
        structure: 'IGN',
        availability: 98.0,
        description: 'API pour des données géographiques.',
        updatedAt: 'Mis à jour le 15 octobre 2024',
      },
    ]);
    this.total = 2;
  }

  loadApis(event: TableLazyLoadEvent) {
    this.loading = true;
    const size = event.rows as number;
    const page = Math.floor((event.first || 0) / size);
    const structure = (event.filters?.['structure'] as FilterMetadata)?.value;
    const availability = (event.filters?.['availability'] as FilterMetadata)?.value;

    // Comment out the actual API call for now
    /*
    this.apiService.getApis(page, size, undefined, structure, availability).subscribe({
      next: (page) => {
        this.apis.set(page.content);
        this.total = page.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading APIs:', err);
        this.loading = false;
      },
    });
    */

    // Use dummy data for testing
    this.loading = false;
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
  }

  onSearch() {
    // Trigger table reload with the global filter if needed
  }
}