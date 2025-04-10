import { Component, signal, computed, effect } from '@angular/core';
import { AdherationService } from '../../services/adheration.service';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Adheration } from '../../models/adheration';

@Component({
  selector: 'app-adheration-request-list',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './adheration.component.html',
})
export class AdherationRequestListComponent {
  requests = signal<Adheration[]>([]);

  constructor(
    private adherationService: AdherationService,
    private confirmationService: ConfirmationService
  ) {
    this.loadRequests();
  }

  loadRequests() {
    this.adherationService.getAdherationRequests().subscribe((data) => {
      this.requests.set(data);
    });
  }

  accept(id: string) {
    this.adherationService.acceptRequest(id).subscribe(() => {
      this.updateStatus(id, 'ACCEPTED');
    });
  }

  refuse(id: string) {
    this.adherationService.refuseRequest(id).subscribe(() => {
      this.updateStatus(id, 'REFUSED');
    });
  }

  confirmDelete(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this request?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.delete(id);
      },
    });
  }

  delete(id: string) {
    this.adherationService.deleteRequest(id).subscribe(() => {
      this.requests.set(this.requests().filter(r => r.id !== id));
    });
  }

  private updateStatus(id: string, status: string) {
    const updated = this.requests().map(r => r.id === id ? { ...r, status } : r);
    this.requests.set(updated);
  }
}
