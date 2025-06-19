import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <div class="header">
          <h1>User Profile</h1>
          <p class="username">{{ username }}</p>
        </div>
        
        <div class="profile-section">
          <div class="info-row">
            <div class="label">Role:</div>
            <div class="value">{{ role }}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Structure:</div>
            <div class="value">{{ structureName }}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Sector:</div>
            <div class="value">{{ secteurName }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
      font-family: Arial, sans-serif;
    }
    
    .profile-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      padding: 1.5rem;
    }
    
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .username {
      margin: 0.5rem 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }
    
    .profile-section {
      padding: 1.5rem;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    
    .label {
      font-weight: 600;
      width: 100px;
      color: #555;
    }
    
    .value {
      flex: 1;
      color: #333;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  username: string = "";
  role: string = "";
  structureName: string = "";
  secteurName: string = "";
  
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getLoggedInUser().subscribe(user => {
      if (user) {
        this.username = user.username || user.sub || "";
        this.role = user.role || "";
        this.structureName = user.structureName || "Not specified";
        this.secteurName = user.secteurName || "Not specified";
      }
    });
  }
}
