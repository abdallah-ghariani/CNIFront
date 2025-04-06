import { Component, signal } from '@angular/core';
import { Structure } from '../../models/structure';
import { ConfirmationService, FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { StructureService } from '../../services/structure.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-structure-list',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css'],
  providers: [ConfirmationService],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    SelectModule
  ]
})
export class StructureListComponent {
  structures = signal<Structure[]>([]);
  displayEditDialog = false;
  displayAddDialog = false;
  selectedStructure: Structure = { id: '', name: '' };
  newStructure = { name: '' };
  loading = false;
  total = 0;
  errorMessage = '';

  constructor(
    private structureService: StructureService,
    private confirmationService: ConfirmationService
  ) {}

  loadStructures(event: TableLazyLoadEvent) {
    if (this.loading) return;
    this.loading = true;
    const size = event.rows;
    const page = Math.floor((event.first || 0) / (size || 1));
    const name = event.filters?.['name'] as FilterMetadata | undefined;

    this.structureService.getStructures(page, size || 1, name?.value).subscribe(page => {
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
    if (!this.selectedStructure.name.trim()) {
      this.errorMessage = 'Name cannot be empty';
      return;
    }

    this.structureService.updateStructure(this.selectedStructure.id, this.selectedStructure).subscribe({
      next: (structure) => {
        this.displayEditDialog = false;
        const list = this.structures();
        const index = list.findIndex((s) => s.id === structure.id);
        list[index] = structure;
        this.structures.set([...list]);
      },
      error: (err) => this.errorMessage = err.error.detail,
    });
  }

  addStructure() {
    if (!this.newStructure.name.trim()) {
      this.errorMessage = 'Name cannot be empty';
      return;
    }

    this.structureService.addStructure(this.newStructure).subscribe({
      next: (structure) => {
        this.displayAddDialog = false;
        this.structures.set([...this.structures(), structure]);
      },
      error: (err) => this.errorMessage = err.error.detail,
    });
  }

  deleteStructure(id: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this structure?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Delete',
      accept: () => {
        this.structureService.deleteStructure(id).subscribe(() => {
          const filtered = this.structures().filter((s) => s.id !== id);
          this.structures.set(filtered);
        });
      }
    });
  }
}
