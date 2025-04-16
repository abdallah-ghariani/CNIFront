import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { TestComponent } from "./components/test/test.component";
import { UserListComponent } from "./components/user-list/user-list.component";
import { loginGuard } from "./login.guard";
import { SecteurListComponent } from "./components/secteur/secteur.component"; // Use SecteurListComponent here
import { StructureListComponent } from "./components/structure/structure.component";
import { AdherationRequestListComponent } from "./components/adheration/adheration.component";
import { DocumentationComponent } from "./components/documentation/documentation.component";
import { adminGuard } from "./admin.guard";
import { AdminLayoutComponent } from "./layout/admin.layout.component";
import { UserLayoutComponent } from "./layout/user.layout.component";
import { ApiListComponent } from "./components/api/api.component";


export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: UserLayoutComponent,
    children: [
      
      { path: "test", component: TestComponent, canActivate:[ loginGuard ]}
    ],
  },
  {
    path: "admin",
    component: AdminLayoutComponent,
    canActivate: [loginGuard, adminGuard],
    children: [
      { path: "", component: TestComponent },
      { path: "users", component: UserListComponent },
      { path: "secteurs", component: SecteurListComponent },
      { path: "structures", component: StructureListComponent },
      { path: "adheration-requests",component: AdherationRequestListComponent },
      { path: "documentation", component: DocumentationComponent },
      { path: 'apis', component: ApiListComponent }
    ],
  },
  { path: "**", redirectTo: '' },
];
