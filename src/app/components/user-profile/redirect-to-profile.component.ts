import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect-to-profile',
  standalone: true,
  template: `
    <div class="redirect-container">
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f7fa;
    }
    
    .loading {
      text-align: center;
    }
    
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #2575fc;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 10px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class RedirectToProfileComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Redirect to user profile after a short delay
    setTimeout(() => {
      this.router.navigate(['/user/profile']);
    }, 1000);
  }
}
