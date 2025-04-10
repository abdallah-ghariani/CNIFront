// secteur-list.component.ts
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
  standalone: true,
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
<<<<<<< HEAD
  templateUrl:'secteur.component.html' ,
  styles: [`
    ::ng-deep .p-datatable-table-container {
      min-height: 300px;
    }
  `],
=======
  templateUrl: './secteur.component.html',
  styleUrls: ['./secteur.component.css'],
>>>>>>> 8a1db98e5894d0bdbaea46b367805ae039a22cb5
  providers: [ConfirmationService],
})
export class SecteurListComponent {
  secteurs = signal<Secteur[]>([]);
<<<<<<< HEAD
  displayEditDialog: boolean = false;
  displayAddDialog: boolean = false;
  selectedSecteur: Secteur = { id: '', name: '' };  
  newSecteur = { name: '' }; 
=======
  displayEditDialog = false;
  displayAddDialog = false;
  selectedSecteur: Secteur = { id: '', name: '' };
  newSecteur = { name: '' };
>>>>>>> 8a1db98e5894d0bdbaea46b367805ae039a22cb5
  loading = false;
  total = 0;
  errorMessage = '';

  constructor(
    private secteurService: SecteurService,
    private confirmationService: ConfirmationService
  ) {}

  loadSecteurs(event: TableLazyLoadEvent) {
    this.loading = true;
    const size = event.rows ?? 5;
    const page = Math.floor((event.first ?? 0) / size);
    const name = event.filters?.['name'] as FilterMetadata | undefined;

    this.secteurService.getSecteurs(page, size, name?.value).subscribe({
      next: (page) => {
        this.secteurs.set(page.content);
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => this.loading = false
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
    if (!this.selectedSecteur?.name) {
      this.errorMessage = 'Name is required.';
      return;
    }

    this.secteurService.updateSecteur(this.selectedSecteur.id, this.selectedSecteur).subscribe({
      next: (updated) => {
        const updatedList = this.secteurs().map(s =>
          s.id === updated.id ? updated : s
        );
        this.secteurs.set(updatedList);
        this.displayEditDialog = false;
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Update failed.'
    });
  }

  addSecteur() {
    if (!this.newSecteur?.name) {
      this.errorMessage = 'Name is required.';
      return;
    }

    this.secteurService.addSecteur(this.newSecteur).subscribe({
      next: (created) => {
        this.secteurs.set([...this.secteurs(), created]);
        this.displayAddDialog = false;
        this.newSecteur = { name: '' };
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Creation failed.'
    });
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
          this.secteurs.set(this.secteurs().filter(s => s.id !== id));
        });
      }
    });
  }
}
