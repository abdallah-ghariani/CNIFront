import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, CommonModule, MenuModule],
  template: `
<div class="flex h-screen">
  <!-- Sidebar -->
  <div 
    [ngClass]="{'w-64': sidebarOpen, 'w-16': !sidebarOpen}"
    class="bg-gray-800 text-white flex flex-col transition-all duration-300"
  >
    <div class="p-4 flex items-center justify-between">
      <span class="text-lg font-bold" *ngIf="sidebarOpen">My App</span>
      <button (click)="sidebarOpen = !sidebarOpen">
        <i class="pi pi-bars text-xl"></i>
      </button>
    </div>
    <nav class="flex-1 px-2 space-y-2">
      <a routerLink="" class="flex items-center p-2 hover:bg-gray-700 rounded-md">
        <i class="pi pi-home mr-3"></i>
        <span *ngIf="sidebarOpen">Dashboard</span>
      </a>
      <a routerLink="users" class="flex items-center p-2 hover:bg-gray-700 rounded-md">
        <i class="pi pi-cog mr-3"></i>
        <span *ngIf="sidebarOpen">Settings</span>
      </a>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="flex-1 flex flex-col">
    <!-- Top Navbar -->
    <div class="bg-gray-900 text-white p-4 flex justify-between items-center">
      <span class="text-lg font-semibold">Dashboard</span>
      <div>
      <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>
      <button 
        (click)="menu.toggle($event)" 
        class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
      >
        <i class="pi pi-user"></i>
      </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="p-4 flex-1 bg-gray-100">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>

  `,
  styles: ``
})
export class LayoutComponent {
  constructor(private authService: AuthService, private router: Router){}
sidebarOpen = false;
menuItems: MenuItem[]= [
  { label: 'Profile', icon: 'pi pi-user', command: () => console.log("go to user profile") },
  { separator: true },
  { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authService.logout().subscribe(_=> this.router.navigateByUrl('login')) }
];
}
