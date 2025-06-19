import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/roles';
import { JwtToken } from '../../models/user';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    RippleModule
  ],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  userName: string = '';
  userRole: Role | null = null;
  greeting: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user information from the token
    this.authService.getLoggedInUser().subscribe((user: JwtToken | undefined | null) => {
      if (user) {
        // For logged-in users, personalize the experience
        this.userName = user.username || user.email || 'User';
        this.userRole = user.role;
        this.setGreeting();
      } else {
        // For non-logged-in users, set default values
        this.userName = 'Guest';
        this.userRole = null;
        this.setGreeting();
      }
    });
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 18) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  navigateToApis(): void {
    this.router.navigate(['/user/apis']);
  }

  navigateToDashboard(): void {
    if (this.userRole === Role.admin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user/apis']);
    }
  }
}
