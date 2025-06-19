import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { TestComponent } from "./components/test/test.component";
import { UserListComponent } from "./components/user-list/user-list.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { loginGuard } from "./login.guard";
import { SecteurListComponent } from "./components/secteur/secteur.component"; // Use SecteurListComponent here
import { StructureListComponent } from "./components/structure/structure.component";
import { AdherationRequestListComponent } from "./components/adheration/adheration.component";
import { DocumentationComponent } from "./components/documentation/documentation.component";
import { adminGuard } from "./admin.guard";
import { AdminLayoutComponent } from "./layout/admin.layout.component";
import { UserLayoutComponent } from "./layout/user.layout.component";
// ApiListComponent removed - using ApiFilterComponent instead
import { ApiDetailsComponent } from "./components/api/api-details.component";
import { ApiAccessRequestsComponent } from "./components/api/api-access-requests.component";
import { MyApiComponent } from "./components/api/my-api.component";
// ApiRequestComponent removed - functionality consolidated with ApiAccessRequestsComponent
import { ApiFilterComponent } from "./components/api-filter/api-filter.component";
import { WelcomeComponent } from "./components/welcome/welcome.component";
import { providerGuard } from "./provider.guard";
import { ServiceListComponent } from "./components/service/service.component";
import { AdminApiRequestsComponent } from "./components/admin-api-requests/admin-api-requests.component";
import { UserInfoComponent } from "./components/user-info/user-info.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { RedirectToProfileComponent } from "./components/user-profile/redirect-to-profile.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  // Root path shows just the UserLayoutComponent with no child component
  { path: "", component: UserLayoutComponent },
  // Welcome page for logged-in users
  { path: "welcome", component: UserLayoutComponent, canActivate: [loginGuard], children: [
    { path: "", component: WelcomeComponent }
  ]},
  // User area with both public and protected routes
  {
    path: "user",
    component: UserLayoutComponent,
    children: [
      // Protected routes
      { path: "test", component: RedirectToProfileComponent, canActivate:[ loginGuard ]},
      { path: "info", component: UserInfoComponent, canActivate:[ loginGuard ]},
      { path: "profile", component: UserProfileComponent, canActivate:[ loginGuard ]},
      { path: "api-requests", component: ApiAccessRequestsComponent, canActivate: [loginGuard, providerGuard] },
      { path: "my-api", component: MyApiComponent, canActivate: [loginGuard] },
      // Public routes
      { path: "apis", component: ApiFilterComponent },
      { path: "apis/list", component: ApiFilterComponent },
      { path: "apis/:id", component: ApiDetailsComponent },
      // Redirects
      { path: "api-request", redirectTo: "api-requests", pathMatch: 'full' }
    ],
  },
  {
    path: "admin",
    component: AdminLayoutComponent,
    canActivate: [loginGuard, adminGuard],
    children: [
      { path: "", component: AdminDashboardComponent },
      { path: "users", component: UserListComponent },
      { path: "secteurs", component: SecteurListComponent },
      { path: "structures", component: StructureListComponent },
      { path: "services", component: ServiceListComponent },
      { path: "adheration-requests",component: AdherationRequestListComponent },
      { path: "documentation", component: DocumentationComponent },
      { path: 'apis', component: ApiFilterComponent },
      { path: 'api-requests', component: AdminApiRequestsComponent }
    ],
  },
  { path: "**", redirectTo: '' },
];
