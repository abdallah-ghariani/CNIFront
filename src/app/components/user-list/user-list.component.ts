import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-list',
  imports :[TableModule,
    DialogModule,
    ButtonModule,
  FormsModule],
  template: `
    <div class="p-4">
      <p-table [value]="users" [paginator]="true" [rows]="5" [responsiveLayout]="'scroll'">
        <ng-template pTemplate="header">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user let-i="rowIndex">
          <tr>
            <td>{{ i + 1 }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button pButton label="Edit" class="p-button-rounded p-button-info p-mr-2" (click)="openEditDialog(user)"></button>
              <button pButton label="Delete" class="p-button-rounded p-button-danger" (click)="deleteUser(user.id)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Edit User Dialog -->
    <p-dialog header="Edit User" [(visible)]="displayDialog" [modal]="true" [closable]="false">
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Username</label>
          <input id="username" type="text" pInputText [(ngModel)]="selectedUser.username" />
        </div>
        <div class="p-field">
          <label for="role">Role</label>
          <input id="role" type="text" pInputText [(ngModel)]="selectedUser.role" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Save" icon="pi pi-check" (click)="saveUser()"></button>
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog = false"></button>
      </ng-template>
    </p-dialog>
  `,
  providers: [ConfirmationService, MessageService],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayDialog: boolean = false;
  selectedUser: User = { id: '', username: '', role: '' };

  constructor(
    private userService: UserService,
   
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  openEditDialog(user: User) {
    this.selectedUser = { ...user }; // Clone object to avoid modifying directly
    this.displayDialog = true;
  }

  saveUser() {
    this.userService.updateUser(this.selectedUser.id,this.selectedUser).subscribe(() => {
      this.displayDialog = false;
      this.loadUsers();})
  }
  deleteUser(id: string){
    this.userService.deleteUser(id).subscribe(() =>{
      this.loadUsers();
    });
  }
}
