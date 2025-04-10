import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-User-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, MenuModule],
  template: `
<div class="flex h-screen">
  <!-- Sidebar -->
  <div 
    [ngClass]="{'w-64': sidebarOpen, 'w-16': !sidebarOpen}"
    class="bg-custom-blue text-white flex flex-col transition-all duration-300"
  >
    <div class="p-4 flex items-center justify-between">
      <span class="text-lg font-bold" *ngIf="sidebarOpen">CNI</span>
      <button (click)="toggleSidebar()">
        <i class="pi pi-bars text-xl"></i>
      </button>
    </div>
    <nav class="flex-1 px-2 space-y-2">
      <a *ngFor="let item of sidebarItems"
         [routerLink]="item.link"
         class="flex items-center p-2 hover:bg-blue-700 rounded-md"
      >
        <i [class]="item.icon + ' mr-3'"></i>
        <span *ngIf="sidebarOpen">{{ item.label }}</span>
      </a>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="flex-1 flex flex-col">
    <!-- Top Navbar -->
    <div class="bg-light-gray text-black p-4 flex justify-between items-center">
      <span class="text-lg font-semibold">{{ pageTitle }}</span>
      <div>
        <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>
        <button 
          (click)="menu.toggle($event)" 
          class="w-10 h-10 flex items-center justify-center rounded-full bg-button-color hover:bg-blue-700"
        >
          <i class="pi pi-user"></i>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="p-4 flex-1 bg-gray-200">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>
  `,
  styles: [`
    .bg-custom-blue {
      background-color: #007bff; /* Sidebar color */
    }
    .bg-light-gray {
      background-color: #f8f9fa; /* Light grey color for the top navbar */
    }
    .bg-button-color {
      background-color: #3b86d1; /* Button color */
    }
    .sidebar-transition {
      transition: width 0.3s ease-in-out;
    }
  `]
})
export class UserLayoutComponent {
  sidebarOpen = false;
  pageTitle = 'User';

  constructor(private authService: AuthService, private router: Router) {}

  sidebarItems: { label: string; link: string; icon: string }[] = [
    { label: 'Dashboard', link: '', icon: 'pi pi-home' },
    { label: 'Test', link: 'test', icon: 'pi pi-address-book' }
  ];

  menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => console.log("go to user profile") },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/'));
  }
}