import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import { Role } from "../../models/roles";
import { JwtHelperService } from "@auth0/angular-jwt";
const BACKEND_URL = environment.BACKEND_URL + "test";
@Component({
  selector: "app-test",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">User Info</h2>
      <p class=" text-black"><strong>Name:</strong> {{ name }}</p>
      <p class=" text-black"><strong>Roles:</strong> {{ role }}</p>
      <p class=" text-black"><strong>Structure:</strong> {{ structure }}</p>
      <p class=" text-black"><strong>Sector:</strong> {{ sector }}</p>
      
      <!-- Token debugging section -->
      <div class="mt-8 border-t pt-4">
        <h3 class="text-lg font-semibold text-gray-800">JWT Token Details</h3>
        <p class=" text-black"><strong>Token Expiry:</strong> {{ tokenExpiry }}</p>
        <p class=" text-black"><strong>Available Fields:</strong> {{ tokenPayload ? (tokenPayload | json) : 'No token' }}</p>
      </div>
    </div>
  `,
  styles: [],
})
export class TestComponent implements OnInit {
  name: string = "";
  role ?: Role;
  sector: string = "";
  structure: string = "";
  rawToken: string = "";
  tokenExpiry: string = "";
  tokenPayload: string = "";

  constructor(
    private authService: AuthService,
    private jwtHelper: JwtHelperService
  ) {}

  ngOnInit() {
    // Get the raw token first
    this.authService.getToken().subscribe(token => {
      if (token) {
        this.rawToken = token;
        
        try {
          // Get token expiration
          const expiryDate = this.jwtHelper.getTokenExpirationDate(token);
          this.tokenExpiry = expiryDate ? expiryDate.toISOString() : 'Unknown';
          
          // Get raw payload for inspection
          const decodedToken = this.jwtHelper.decodeToken(token);
          this.tokenPayload = JSON.stringify(decodedToken, null, 2);
          
          console.log('Raw JWT token:', token);
          console.log('Decoded token payload:', decodedToken);
          
          // Show header and signature parts too
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            console.log('JWT Header:', atob(tokenParts[0]));
            console.log('JWT Signature exists:', !!tokenParts[2]);
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    });
    
    // Now get the decoded user info
    this.authService.getLoggedInUser().subscribe((user) => {
      if (user) {
        this.name = user.sub;
        this.role = user.role;
        
        // Add sector and structure information - handling IDs
        this.structure = user.structure || 'Not specified';
        this.sector = user.secteur || user.sector || 'Not specified';
        
        // Add note if these look like IDs (short strings that might be numeric)
        if (this.structure && (this.structure.length < 10 || !isNaN(Number(this.structure)))) {
          this.structure += ' (ID)';
        }
        
        if (this.sector && (this.sector.length < 10 || !isNaN(Number(this.sector)))) {
          this.sector += ' (ID)';
        }
        
        // Log all user details for debugging
        console.log('User details from JWT:', JSON.stringify(user, null, 2));
        
        // Check if we have the correct fields in the token
        const tokenFields = Object.keys(user);
        console.log('Available fields in JWT token:', tokenFields);
        
        // If we're missing sector or structure, log a warning
        if (!user.secteur && !user.sector) {
          console.warn('JWT token missing sector/secteur field');
        }
        if (!user.structure) {
          console.warn('JWT token missing structure field');
        }
      }
    });
  }
}
