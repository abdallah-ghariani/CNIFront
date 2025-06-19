import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule, TableLazyLoadEvent } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

// Models
interface Api {
  id: string;
  name: string;
  structure: string;
  secteur: string;
  availability: number;
  description: string;
  updatedAt: string;
}

interface Structure {
  label: string;
  value: string;
}

interface Availability {
  label: string;
  value: number;
}

@Component({
  selector: 'app-api-list',
  templateUrl: 'api.component.html',
 
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule
  ]
})
export class ApiListComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  apis: Api[] = [];
  structures: Structure[] = [];
  availabilities: Availability[] = [];

  loading: boolean = true;
  total: number = 0;
  globalFilterValue: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStructures();
    this.initAvailabilities();
  }

  loadStructures() {
    this.structures = [
      { label: "Ministère de l'Économie", value: "Ministère de l'Économie" },
      { label: "Ministère de la Santé", value: "Ministère de la Santé" },
      { label: "Ministère de l'Éducation", value: "Ministère de l'Éducation" },
      { label: "Agence Nationale", value: "Agence Nationale" }
    ];
  }

  initAvailabilities() {
    this.availabilities = [
      { label: 'Tous', value: 0 },
      { label: '> 90%', value: 90 },
      { label: '> 95%', value: 95 },
      { label: '> 99%', value: 99 }
    ];
  }

  loadApis(event: TableLazyLoadEvent) {
    this.loading = true;

    const page = event.first !== undefined ? Math.floor(event.first / (event.rows || 10)) : 0;
    const size = event.rows || 10;

    let sort = '';
    if (event.sortField) {
      sort = `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`;
    }

    const filters = event.filters || {};
    let secteur = '';
    let structure = '';
    let availability: number | undefined = undefined;

    

    this.apiService.getApis(page, size, sort, secteur, structure, availability)
      .subscribe({
        next: (response) => {
          this.apis = response.content;
          this.total = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading APIs:', err);
          this.loading = false;
        }
      });
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.globalFilterValue = inputElement.value;
    this.table.filterGlobal(this.globalFilterValue, 'contains');
  }

  getSeverity(availability: number): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    if (availability >= 99) return 'success';
    if (availability >= 95) return 'info';
    if (availability >= 90) return 'warn';
    return 'danger';
  }

  clear() {
    this.table.clear();
    this.globalFilterValue = '';
  }
}