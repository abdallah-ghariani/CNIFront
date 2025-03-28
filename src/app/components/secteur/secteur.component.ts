import { Component, signal } from '@angular/core';
import { SecteurService } from '../../services/secteur.service';
import { Secteur } from '../../models/secteur';
import { ConfirmationService, FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-secteur-list',
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
        label="Add Secteur"
        class="p-button-primary mb-2"
        (click)="openAddDialog()"
      ></button>
      <div>
        <p-table
          [value]="secteurs()"
          [paginator]="true"
          [rows]="5"
          [loading]="loading"
          [totalRecords]="total"
          (onLazyLoad)="loadSecteurs($event)"
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
          <ng-template pTemplate="body" let-secteur let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>{{ secteur.name }}</td>
              <td>
                <button
                  pButton
                  label="Edit"
                  class="p-button-rounded p-button-info mr-2"
                  (click)="openEditDialog(secteur)"
                ></button>
                <button
                  pButton
                  label="Delete"
                  class="p-button-rounded p-button-danger"
                  (click)="deleteSecteur(secteur.id)"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Edit Secteur Dialog -->
    <p-dialog
      header="Edit Secteur"
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
          [(ngModel)]="selectedSecteur.name"
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
          (click)="saveSecteur()"
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

    <!-- Add Secteur Dialog -->
    <p-dialog
      [(visible)]="displayAddDialog"
      header="Add Secteur"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '30rem', height: '30rem' }"
    >
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="newSecteur.name"
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
          (click)="addSecteur()"
          [disabled]="!(newSecteur.name)"
          ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    ::ng-deep .p-datatable-table-container {
      min-height: 300px;
    }
  `],
  providers: [ConfirmationService],
})
export class SecteurListComponent {
  secteurs = signal<Secteur[]>([]);
  displayEditDialog: boolean = false;
  displayAddDialog: boolean = false;
  selectedSecteur: Secteur = { id: '', name: '' };  // Initialize with default structure
  newSecteur = { name: '' };  // Initialize with default structure
  loading = false;
  total = 0;
  errorMessage = '';

  constructor(
    private secteurService: SecteurService,
    private confirmationService: ConfirmationService
  ) {}

  loadSecteurs(event: TableLazyLoadEvent) {
    this.loading = true;
    const size = event.rows;
    const page = Math.floor((event.first || 0) / (size || 1));
    const name = event.filters?.['name'] as FilterMetadata | undefined;
    this.secteurService.getSecteurs(page, (size || 1), name?.value).subscribe(page => {
      this.secteurs.set(page.content);
      this.total = page.totalElements;
      this.loading = false;
    });
  }

  openEditDialog(secteur: Secteur) {
    this.selectedSecteur = { ...secteur };
    this.errorMessage = '';
    this.displayEditDialog = true;
  }

  openAddDialog() {
    this.newSecteur = { name: '' };
    this.errorMessage = '';
    this.displayAddDialog = true;
  }

  saveSecteur() {
    if (this.selectedSecteur) {
      this.secteurService.updateSecteur(this.selectedSecteur.id, this.selectedSecteur).subscribe({
        next: (secteur) => {
          this.displayEditDialog = false;
          const secteurs = this.secteurs();
          const index = secteurs.findIndex((s) => s.id === secteur.id);
          secteurs[index] = secteur;
          this.secteurs.set([...secteurs]);
        },
        error: (err) => {
          this.errorMessage = err.error.detail;
        },
      });
    }
  }

  addSecteur() {
    if (this.newSecteur) {
      this.secteurService.addSecteur(this.newSecteur).subscribe({
        next: (secteur) => {
          this.displayAddDialog = false;
          this.secteurs.set([...this.secteurs(), secteur]);
        },
        error: (err) => {
          this.errorMessage = err.error.detail;
        },
      });
    }
  }

  deleteSecteur(id: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this secteur?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Delete',
      accept: () => {
        this.secteurService.deleteSecteur(id).subscribe(() => {
          const secteurs = this.secteurs();
          this.secteurs.set(secteurs.filter((secteur) => secteur.id !== id));
        });
      },
    });
  }
}
