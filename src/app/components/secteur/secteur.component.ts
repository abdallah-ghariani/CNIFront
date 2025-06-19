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
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule,
    CommonModule
  ],
  templateUrl:'secteur.component.html' ,
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
  selectedSecteur: Secteur = { id: '', name: '' };  
  newSecteur = { name: '' }; 
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
