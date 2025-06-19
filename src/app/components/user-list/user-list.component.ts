import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { UserService } from "../../services/user.service";
import { User } from "../../models/user";
import { ConfirmationService, FilterMetadata } from "primeng/api";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { Role, Roles, mapLegacyRole } from '../../models/roles';
import { SelectModule } from "primeng/select";
import { StructureService } from "../../services/structure.service";
import { SecteurService } from "../../services/secteur.service";
import { Structure } from "../../models/structure";
import { Secteur } from "../../models/secteur";
import { catchError, forkJoin, of } from "rxjs";
import { DropdownModule } from "primeng/dropdown";
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: "app-user-list",
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    SelectModule,
    DropdownModule,
    TooltipModule,
  ],
  templateUrl: './user-list.component.html',
  styles: [`
  ::ng-deep .p-datatable-table-container{
    min-height : 300px;
  }
  `],
  providers: [ConfirmationService],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  displayEditDialog: boolean = false;
  displayAddDialog: boolean = false;
  selectedUser?: User;
  newUser: { username: string; password: string; role: Role; structure?: string; secteur?: string } = {
    username: '',
    password: '',
    role: Role.user  // Updated to use the new role system
  };
  roles = Roles;
  loading = false;
  total = 0;
  errorMessage = "";
  
  // Structures and secteurs for dropdowns
  structures: { label: string; value: string }[] = [];
  secteurs: { label: string; value: string }[] = [];
  loadingDropdowns = false;
  
  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private structureService: StructureService,
    private secteurService: SecteurService
  ) {}
  
  ngOnInit() {
    this.loadStructuresAndSecteurs();
  }
  
  loadStructuresAndSecteurs() {
    this.loadingDropdowns = true;
    
    // Load both structures and secteurs in parallel
    forkJoin({
      structures: this.structureService.getStructures(0, 100).pipe(
        catchError(error => {
          console.error('Error loading structures:', error);
          return of({ content: [] });
        })
      ),
      secteurs: this.secteurService.getSecteurs(0, 100).pipe(
        catchError(error => {
          console.error('Error loading secteurs:', error);
          return of({ content: [] });
        })
      )
    }).subscribe(result => {
      // Process structures for dropdown
      this.structures = (result.structures.content || []).map(structure => ({
        label: structure.name,
        value: structure.id || ''
      }));
      
      // Process secteurs for dropdown
      this.secteurs = (result.secteurs.content || []).map(secteur => ({
        label: secteur.name,
        value: secteur.id || ''
      }));
      
      this.loadingDropdowns = false;
    });
  }
  
  loadUsers(q: TableLazyLoadEvent) {
    this.loading = true;
    const size = q.rows as number;
    const page = Math.floor((q.first || 0) / size);
    
    // Extract filter values
    const username = q.filters?.["username"] as FilterMetadata | undefined;
    const role = q.filters?.["role"] as FilterMetadata | undefined;
    const structureId = q.filters?.["structureId"] as FilterMetadata | undefined;
    const secteurId = q.filters?.["secteurId"] as FilterMetadata | undefined;
    
    // Debug the actual filter objects
    console.log('Raw filter objects:', {
      structureFilter: structureId,
      secteurFilter: secteurId,
      usernameFilter: username,
      roleFilter: role
    });
    
    // Additional debugging for structure and sector filters
    if (structureId) {
      console.log('Structure filter details:', {
        value: structureId.value,
        matchMode: structureId.matchMode,
        valueType: typeof structureId.value
      });
    }
    
    if (secteurId) {
      console.log('Sector filter details:', {
        value: secteurId.value,
        matchMode: secteurId.matchMode,
        valueType: typeof secteurId.value
      });
    }
    
    console.log('Applying filters:', {
      username: username?.value,
      role: role?.value,
      structureId: structureId?.value,
      secteurId: secteurId?.value
    });
    
    // Pass all filter parameters to the service
    this.userService
      .getUsers(
        page, 
        size, 
        undefined, 
        username?.value, 
        role?.value, 
        structureId?.value, 
        secteurId?.value
      )
      .subscribe((page) => {
        // Update the user data when response arrives
        this.users.set(page.content);
        this.total = page.totalElements;
        this.loading = false;
        
        // For debugging
        console.log('Users loaded:', page.content.length);
        if (page.content.length > 0) {
          console.log('Sample user data:', page.content[0]);
        }
      });
  }

  openEditDialog(user: User) {
    this.selectedUser = { ...user }; 
    this.errorMessage = "";
    this.displayEditDialog = true;
  }

  openAddDialog() {
    this.errorMessage = "";
    this.newUser = { 
      username: "", 
      password: "", 
      role: Role.user, // Updated to use the new role system
      structure: undefined, // Initialize to undefined, not empty string
      secteur: undefined   // Initialize to undefined, not empty string
    };
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
    if (!this.newUser) return;

    // Ensure role is valid - default to user if not set
    const role = this.newUser.role || Role.user;
    console.log('Adding user with role:', role);
    
    // Debug the form values to see what's being selected
    console.log('Form values before submission:', {
      username: this.newUser.username,
      password: '******', // Hide password for security
      role: role,
      structure: this.newUser.structure,
      structure_type: typeof this.newUser.structure,
      secteur: this.newUser.secteur,
      secteur_type: typeof this.newUser.secteur
    });
    
    // Only include structure/secteur if they are non-empty
    const userData = {
      username: this.newUser.username,
      password: this.newUser.password,
      role: role
    };
    
    // Only add structure and secteur if they have values
    // Check for null, undefined, or empty string
    if (this.newUser.structure && this.newUser.structure !== '') {
      console.log('Adding structure:', this.newUser.structure);
      (userData as any).structure = this.newUser.structure;
    } else {
      console.log('Structure value is empty or invalid:', this.newUser.structure);
    }
    
    if (this.newUser.secteur && this.newUser.secteur !== '') {
      console.log('Adding secteur:', this.newUser.secteur);
      (userData as any).secteur = this.newUser.secteur;
    } else {
      console.log('Secteur value is empty or invalid:', this.newUser.secteur);
    }
    
    console.log('Sending user data:', JSON.stringify(userData));

    this.userService
      .addUser(userData)
      .subscribe({
        next: (v) => {
          console.log('User created successfully:', v);
          this.loadUsers({
            first: 0,
            rows: 5,
          });
          this.displayAddDialog = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          // Provide more detailed error message
          if (error?.error?.detail) {
            this.errorMessage = error.error.detail;
          } else if (error?.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error?.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = "Error adding user: Server returned 500 Internal Server Error";
          }
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
