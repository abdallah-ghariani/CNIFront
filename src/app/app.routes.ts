import { Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { TestComponent } from "./test/test.component";
import { UserListComponent } from "./components/user-list/user-list.component";
import { UserFormComponent } from "./components/user-form/user-form.component";
import { LayoutComponent } from "./layout/layout.component";
import { loginGuard } from "./login.guard";
import { SecteurListComponent } from "./components/secteur/secteur.component"; // Use SecteurListComponent here
import { StructureListComponent } from "./components/structure/structure.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [loginGuard],
    children: [
      { path: "", component: TestComponent },
      { path: "users", component: UserListComponent },
      { path: "users/add", component: UserFormComponent },
      { path: "users/edit/:id", component: UserFormComponent },
      { path: "secteurs", component: SecteurListComponent }, 
      { path: 'structures', component: StructureListComponent },
    ],
  },
  { path: "**", redirectTo: "" },
];
