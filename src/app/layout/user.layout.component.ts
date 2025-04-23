import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdherationService } from '../services/adheration.service';
import { InputTextarea } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-user-layout',
  styleUrls: ['./user.layout.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    MenuModule, 
    RouterLink, 
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ToastModule,
    InputTextarea,
    RadioButtonModule
  ],
  providers: [MessageService],
  templateUrl: './user.layout.component.html',
})
export class UserLayoutComponent {
  constructor(
    private authService: AuthService, 
    public router: Router,
    private adherationService: AdherationService,
    private messageService: MessageService
  ) {}

  menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user',url:"test"},
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  // Membership request form properties
  displayAdherationSection = false;
  adherationForm = {
    name: '',
    structure: '',
    secteur: '',
    role: 'consumer', // Default role
    message: ''
  };
  isSubmitting = false;

  logout() {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/'));
  }

  showAdherationSection() {
    this.displayAdherationSection = true;
    // Scroll to the form section
    setTimeout(() => {
      const element = document.getElementById('adherationFormSection');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  submitAdherationRequest() {
    if (!this.adherationForm.name || !this.adherationForm.structure || !this.adherationForm.secteur || !this.adherationForm.role) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Information',
        detail: 'Please provide your name, structure, secteur, and select a role'
      });
      return;
    }

    this.isSubmitting = true;
    
    this.adherationService.createRequest(
      this.adherationForm.name,
      this.adherationForm.structure,
      this.adherationForm.secteur,
      this.adherationForm.role,
      this.adherationForm.message
    ).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.displayAdherationSection = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Request Submitted',
          detail: 'Your membership request has been submitted successfully'
        });
        
        // Reset form
        this.adherationForm = {
          name: '',
          structure: '',
          secteur: '',
          role: 'consumer',
          message: ''
        };
      },
      error: (error) => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Failed',
          detail: error.message || 'An error occurred. Please try again later.'
        });
      }
    });
  }
}
