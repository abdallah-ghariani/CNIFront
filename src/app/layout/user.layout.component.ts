import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Component, OnInit } from '@angular/core';
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
import { Textarea } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { SecteurService } from '../services/secteur.service';
import { StructureService } from '../services/structure.service';
import { environment } from '../../environments/environment';

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
    Textarea,
    RadioButtonModule,
    DropdownModule,
    RouterOutlet
  ],
  providers: [MessageService],
  templateUrl: './user.layout.component.html',
})
export class UserLayoutComponent implements OnInit {
  constructor(
    public authService: AuthService, 
    public router: Router,
    private adherationService: AdherationService,
    private messageService: MessageService,
    private secteurService: SecteurService,
    private structureService: StructureService
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
    email: '',
    structure: '',
    secteur: '',
    message: ''
  };
  isSubmitting = false;
  
  // Dropdown options
  structures: { label: string; value: string }[] = [];
  secteurs: { label: string; value: string }[] = [];
  
  // Default values in case backend is unavailable
  defaultStructures: { label: string; value: string }[] = [
    { label: 'DINUM', value: 'DINUM' },
    { label: 'INSEE', value: 'INSEE' },
    { label: 'Ministry of Economy', value: 'MEFSIN' },
    { label: 'CNAV', value: 'CNAV' }
  ];
  
  defaultSecteurs: { label: string; value: string }[] = [
    { label: 'Finance', value: 'finance' },
    { label: 'Health', value: 'sante' },
    { label: 'Education', value: 'education' },
    { label: 'Justice', value: 'justice' },
    { label: 'Defense', value: 'defense' }
  ];
  
  ngOnInit(): void {
    // Load dropdown data
    this.loadStructures();
    this.loadSecteurs();
  }
  
  // Load structures for the dropdown
  loadStructures(): void {
    console.log('Loading structures from backend:', environment.BACKEND_URL + 'structures');
    
    // Get structures from backend
    this.structureService.getStructures(0, 100).subscribe({
      next: (response: any) => {
        console.log('Structure API response:', response);
        
        // Handle different response formats
        let structures = [];
        
        if (response && response.content && Array.isArray(response.content)) {
          structures = response.content;
        } else if (Array.isArray(response)) {
          structures = response;
        } else if (typeof response === 'object') {
          structures = Object.values(response);
        }
        
        // Map structures to dropdown format
        if (structures.length > 0) {
          this.structures = structures.map((s: any) => {
            const label = s.name || s.organization || s.title || s.structure || s.label || '';
            const value = s.id || s._id || s.value || '';
            return { label, value };
          });
          console.log('Loaded', this.structures.length, 'structures');
        } else {
          console.warn('No structures found in API response');
          this.structures = [...this.defaultStructures];
        }
      },
      error: (err) => {
        console.error('Error loading structures:', err);
        this.structures = [...this.defaultStructures];
      }
    });
  }
  
  // Load secteurs for the dropdown
  loadSecteurs(): void {
    console.log('Loading sectors from backend:', environment.BACKEND_URL + 'secteurs');
    
    // Get sectors from backend
    this.secteurService.getSecteurs(0, 100).subscribe({
      next: (response: any) => {
        console.log('Secteur API response:', response);
        
        // Handle different response formats
        let secteurs = [];
        
        if (response && response.content && Array.isArray(response.content)) {
          secteurs = response.content;
        } else if (Array.isArray(response)) {
          secteurs = response;
        } else if (typeof response === 'object') {
          secteurs = Object.values(response);
        }
        
        // Map secteurs to dropdown format
        if (secteurs.length > 0) {
          this.secteurs = secteurs.map((s: any) => {
            const label = s.name || s.sector || s.title || s.secteur || s.label || '';
            const value = s.id || s._id || s.value || '';
            return { label, value };
          });
          console.log('Loaded', this.secteurs.length, 'sectors');
        } else {
          console.warn('No sectors found in API response');
          this.secteurs = [...this.defaultSecteurs];
        }
      },
      error: (err) => {
        console.error('Error loading sectors:', err);
        this.secteurs = [...this.defaultSecteurs];
      }
    });
  }

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
    // Check required fields (role is now hardcoded to 'consumer' so not part of the check)
    if (!this.adherationForm.name || !this.adherationForm.email || !this.adherationForm.structure || !this.adherationForm.secteur) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Information',
        detail: 'Please provide your name, email, structure, and sector'
      });
      return;
    }

    this.isSubmitting = true;
    
    this.adherationService.createRequest(
      this.adherationForm.name,
      this.adherationForm.email,
      this.adherationForm.structure,
      this.adherationForm.secteur,
      'user', // Default role is now user (previously consumer)
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
          email: '',
          structure: '',
          secteur: '',
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
