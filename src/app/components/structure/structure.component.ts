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
    CommonModule
  ],
  template: `
    <div class="p-4">
      <p-confirmdialog></p-confirmdialog>
      <button
        pButton
        label="Add Structure"
        class="p-button-primary mb-2"
        (click)="openAddDialog()"
      ></button>
      <div>
        <p-table
          [value]="structures()"
          [paginator]="true"
          [rows]="5"
          [loading]="loading"
          [totalRecords]="total"
          (onLazyLoad)="loadStructures($event)"
          [lazy]="true"
          [rowsPerPageOptions]="[5, 10, 20]"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-structure let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>{{ structure.name }}</td>
              <td>
                <button
                  pButton
                  label="Edit"
                  class="p-button-rounded p-button-info mr-2"
                  (click)="openEditDialog(structure)"
                ></button>
                <button
                  pButton
                  label="Delete"
                  class="p-button-rounded p-button-danger"
                  (click)="deleteStructure(structure.id)"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Edit Structure Dialog -->
    <p-dialog
      header="Edit Structure"
      [(visible)]="displayEditDialog"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '30rem', height: '30rem' }"
    >
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="selectedStructure.name"
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="text-red-500 text-sm mb-3" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Save"
          icon="pi pi-check"
          (click)="saveStructure()"
        ></button>
        <button
          pButton
          label="Cancel"
          icon="pi pi-times"
          class="p-button-secondary"
          (click)="displayEditDialog = false"
        ></button>
      </ng-template>
    </p-dialog>

    <!-- Add Structure Dialog -->
    <p-dialog
      [(visible)]="displayAddDialog"
      header="Add Structure"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '30rem', height: '30rem' }"
    >
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="newStructure.name"
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="text-red-500 text-sm mb-3" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <ng-template pTemplate="footer">
        <button
          type="button"
          pButton
          label="Cancel"
          class="p-button-secondary"
          (click)="displayAddDialog = false"
        ></button>
        <button
          pButton
          label="Add"
          class="p-button-primary"
          (click)="addStructure()"
          [disabled]="!(newStructure.name)"
        ></button>
      </ng-template>
    </p-dialog>
  `,
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
      message: 'Do you want to delete this structure?',
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
