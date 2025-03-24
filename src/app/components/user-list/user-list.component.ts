import { Component, signal } from "@angular/core";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user";
import { ConfirmationService, FilterMetadata } from "primeng/api";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { Role, Roles } from "../../models/roles";
import { SelectModule } from "primeng/select";
@Component({
  selector: "app-user-list",
  imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    SelectModule,
  ],
  template: `
    <div class="p-4">
      <p-confirmdialog />
      <button
        pButton
        label="Add User"
        class="p-button-primary mb-2"
        (click)="openAddDialog()"
      ></button>
      <div>
        <p-table
          [value]="users()"
          [paginator]="true"
          [rows]="5"
          [loading]="loading"
          [totalRecords]="total"
          (onLazyLoad)="loadUsers($event)"
          [lazy]="true"
          [rowsPerPageOptions]="[5, 10, 20]"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
            <tr>
              <th></th>
              <th>
                <p-columnFilter
                  type="text"
                  field="username"
                  placeholder="Search by username"
                  ariaLabel="Filter Name"
                  [showMenu]="false"
                ></p-columnFilter>
              </th>
              <th>
                <p-columnFilter
                  field="role"
                  matchMode="equals"
                  [showMenu]="false"
                >
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-select
                      [ngModel]="value"
                      [options]="roles"
                      (onChange)="filter($event.value)"
                      placeholder="Select a Role"
                      [showClear]="true"
                      class="w-64"
                    >
                    </p-select>
                  </ng-template>
                </p-columnFilter>
              </th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button
                  pButton
                  label="Edit"
                  class="p-button-rounded p-button-info mr-2"
                  (click)="openEditDialog(user)"
                ></button>
                <button
                  pButton
                  label="Delete"
                  class="p-button-rounded p-button-danger"
                  (click)="deleteUser(user.id)"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Edit User Dialog -->
    @if (selectedUser) {
    <p-dialog
      header="Edit User"
      [(visible)]="displayEditDialog"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '30rem', height: '30rem' }"
    >
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="selectedUser.username"
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Role</label>
        <p-select
          [options]="roles"
          [(ngModel)]="selectedUser.role"
          placeholder="Select a Role"
          class="w-full p-2 border rounded"
        />
      </div>
      @if (errorMessage) {
      <div class="text-red-500 text-sm mb-3">
        {{ errorMessage }}
      </div>
      }
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Save"
          icon="pi pi-check"
          (click)="saveUser()"
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
    }
    <!-- add user dialog -->
    @if(newUser){
    <p-dialog
      [(visible)]="displayAddDialog"
      header="Add User"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '30rem', height: '35rem' }"
    >
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="newUser.username"
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          pInputText
          [(ngModel)]="newUser.password"
          class="w-full p-2 border rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Role</label>
        <p-select
          [options]="roles"
          [(ngModel)]="newUser.role"
          placeholder="Select a Role"
          class="w-full p-2 border rounded"
        />
      </div>
      @if (errorMessage) {
      <div class="text-red-500 text-sm mb-3">
        {{ errorMessage }}
      </div>
      }

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
          (click)="addUser()"
          [disabled]="!(newUser.username && newUser.password && newUser.role)"
        ></button>
      </ng-template>
    </p-dialog>
    }
  `,
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
    this.selectedUser = { ...user }; // Clone object to avoid modifying directly
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
