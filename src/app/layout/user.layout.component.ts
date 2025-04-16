import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-user-layout',
  styleUrls: ['./user.layout.component.css'],
  standalone: true,
  imports: [CommonModule, MenuModule, RouterLink, IconFieldModule,InputIconModule,InputTextModule],
  templateUrl: './user.layout.component.html',
})
export class UserLayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user',url:"test"},
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  logout() {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/'));
  }
}
