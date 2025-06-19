import { Component, signal } from '@angular/core';
import { Structure } from '../../models/structure'; // Define the model for structure
import { ConfirmationService, FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { StructureService } from '../../services/structure.service';

@Component({
  selector: 'app-structure-list',
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
  templateUrl: 'structure.component.html',
  styles: [
    `
      ::ng-deep .p-datatable-table-container {
        min-height: 300px;
      }
    `
  ],
  providers: [ConfirmationService],
})
export class StructureListComponent {
  structures = signal<Structure[]>([]);
  displayEditDialog: boolean = false;
  displayAddDialog: boolean = false;
  selectedStructure: Structure = { id: '', name: '' };  // Initialize with default structure
  newStructure = { name: '' };  // Initialize with default structure
  loading = false;
  total = 0;
  errorMessage = '';

  constructor(
    private structureService: StructureService,
    private confirmationService: ConfirmationService
  ) {}

  loadStructures(event: TableLazyLoadEvent) {
    this.loading = true;
    const size = event.rows;
    const page = Math.floor((event.first || 0) / (size || 1));
    const name = event.filters?.['name'] as FilterMetadata | undefined;
    this.structureService.getStructures(page, (size || 1), name?.value).subscribe(page => {
      this.structures.set(page.content);
      this.total = page.totalElements;
      this.loading = false;
    });
  }

  openEditDialog(structure: Structure) {
    this.selectedStructure = { ...structure };
    this.errorMessage = '';
    this.displayEditDialog = true;
  }

  openAddDialog() {
    this.newStructure = { name: '' };
    this.errorMessage = '';
    this.displayAddDialog = true;
  }

  saveStructure() {
    if (this.selectedStructure) {
      this.structureService.updateStructure(this.selectedStructure.id, this.selectedStructure).subscribe({
        next: (structure) => {
          this.displayEditDialog = false;
          const structures = this.structures();
          const index = structures.findIndex((s) => s.id === structure.id);
          structures[index] = structure;
          this.structures.set([...structures]);
        },
        error: (err) => {
          this.errorMessage = err.error.detail;
        },
      });
    }
  }

  addStructure() {
    if (this.newStructure) {
      this.structureService.addStructure(this.newStructure).subscribe({
        next: (structure) => {
          this.displayAddDialog = false;
          this.structures.set([...this.structures(), structure]);
        },
        error: (err) => {
          this.errorMessage = err.error.detail;
        },
      });
    }
  }

  deleteStructure(id: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this organisation?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Delete',
      accept: () => {
        this.structureService.deleteStructure(id).subscribe(() => {
          const structures = this.structures();
          this.structures.set(structures.filter((structure) => structure.id !== id));
        });
      },
    });
  }
}
