import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  styleUrls: ['./admin.layout.component.css'],
  standalone: true,
  imports: [CommonModule, MenuModule,  RouterLink, RouterOutlet],
  templateUrl: './admin.layout.component.html',
})
export class AdminLayoutComponent {
  sidebarOpen = false;
  pageTitle = 'Admin';
  
  @ViewChild('menu') menu: Menu | undefined;

  constructor(private authService: AuthService, private router: Router) {}

  sidebarItems: { label: string; link: string; icon: string }[] = [
    { label: 'Dashboard', link: '/admin', icon: 'pi pi-home' },
    { label: 'Users', link: 'users', icon: 'pi pi-users' },
    { label: 'Secteurs', link: 'secteurs', icon: 'pi pi-list' },
    { label: 'Structures', link: 'structures', icon: 'pi pi-sitemap' },
    { label: 'Services', link: 'services', icon: 'pi pi-server' },
    { label: 'Adherations', link: 'adheration-requests', icon: 'pi pi-id-card' },
    { label: 'Documentation', link: 'documentation', icon: 'pi pi-book' },
    { label: 'APIs', link: 'apis', icon: 'pi pi-cloud' },
    { label: 'API Requests', link: 'api-requests', icon: 'pi pi-envelope' },
  ];

  menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => console.log("go to user profile") },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  // Method to handle admin profile button click
  toggleUserMenu(event: Event) {
    // Toggle the PrimeNG menu if it exists
    if (this.menu) {
      this.menu.toggle(event);
    }
    
    // Prevent the click from propagating
    event.stopPropagation();
  }

  logout() {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/'));
  }
}