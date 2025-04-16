// user-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user'; // Import your User model
import { Role, Roles } from '../../models/roles'; 
import { TableLazyLoadEvent, TableModule } from 'primeng/table';  // For p-table
import { DialogModule } from 'primeng/dialog';  // For p-dialog
import { InputTextModule } from 'primeng/inputtext';  // For pInputText
import { ButtonModule } from 'primeng/button';  // For pButton
import { DropdownModule } from 'primeng/dropdown';  // For p-select
import { ToastModule } from 'primeng/toast';  // For toast notifications (optional)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // For ngModel
import { HttpClientModule } from '@angular/common/http';  // For HttpClient
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // For PrimeNG animations
import { ConfirmDialogModule } from 'primeng/confirmdialog';  // Import this module
import { ConfirmationService, FilterMetadata } from 'primeng/api';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  imports: [
    BrowserModule,
    FormsModule,  // Add FormsModule to use ngModel
    HttpClientModule,
    BrowserAnimationsModule,
    TableModule,  // Add PrimeNG Table module
    DialogModule,  // Add PrimeNG Dialog module
    InputTextModule,  // Add PrimeNG InputText module
    ButtonModule,  // Add PrimeNG Button module
    DropdownModule,  // Add PrimeNG Dropdown module
    ToastModule, 
    ConfirmDialogModule
  ],
  styles: [`
  ::ng-deep .p-datatable-table-container{
    min-height : 300px;
  }
  `],
  providers: [ConfirmationService],
})
export class UserListComponent {
  users = signal<User[]>([]);
  displayEditDialog: boolean = false;
  displayAddDialog: boolean = false;
  selectedUser?: User;
  newUser?: { username: ""; password: ""; role: Role };
  roles = Roles;
  loading = false;
  total = 0;
  errorMessage = "";
  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService
  ) {}

  loadUsers(q: TableLazyLoadEvent) {
    this.loading = true;
    const size = q.rows as number;
    const page = Math.floor((q.first || 0) / size);
    const username = q.filters?.["username"] as FilterMetadata | undefined;
    const role = q.filters?.["role"] as FilterMetadata | undefined;
    this.userService
      .getUsers(page, size, undefined, username?.value, role?.value)
      .subscribe((page) => {
        this.users.set(page.content);
        this.total = page.totalElements;
        this.loading = false;
      });
  }

  openEditDialog(user: User) {
    this.selectedUser = { ...user }; 
    this.errorMessage = "";
    this.displayEditDialog = true;
  }

  openAddDialog() {
    console.log(this.roles);
    this.newUser = { username: "", password: "", role: Role.consumer };
    this.errorMessage = "";
    this.displayAddDialog = true;
  }

  saveUser() {
    if (this.selectedUser)
      this.userService
        .updateUser(this.selectedUser.id, this.selectedUser)
        .subscribe({
          next: (u) => {
            this.displayEditDialog = false;
            const users = this.users();
            const i = users.findIndex((user) => user.id === u.id);
            users[i] = u;
            this.users.set([...users]);
          },
          error: (err) => {
            this.errorMessage = err.error.detail;
          },
        });
  }

  addUser() {
    if (this.newUser)
      this.userService.addUser(this.newUser).subscribe({
        next: (user) => {
          this.displayAddDialog = false;
          this.users.set([...this.users(), user]);
        },
        error: (err) => {
          this.errorMessage = err.error.detail;
        },
      });
  }

  deleteUser(id: string) {
    this.confirmationService.confirm({
      // target: event.target as EventTarget,
      message: "Do you want to delete this user?",
      header: "Confirmation",
      icon: "pi pi-info-circle",
      rejectLabel: "Cancel",
      rejectButtonProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Delete",
        severity: "danger",
      },

      accept: () => {
        this.userService.deleteUser(id).subscribe(() => {
          const users = this.users();
          this.users.set(users.filter((u) => u.id !== id));
        });
      },
    });
  }
  /*deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe(() => {
      const users = this.users();
      this.users.set(users.filter((u) => u.id !== id));
    });
  }*/
}