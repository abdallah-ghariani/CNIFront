import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { Role } from "../../models/roles";

@Component({
  selector: "app-user-info",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">User Info</h2>
      <div class="space-y-2">
        <div class="flex items-center p-2 bg-gray-50 rounded">
          <span class="w-32 font-medium">Username:</span>
          <span>{{ username }}</span>
        </div>
        <div class="flex items-center p-2 bg-gray-50 rounded">
          <span class="w-32 font-medium">Role:</span>
          <span>{{ role }}</span>
        </div>
        <div class="flex items-center p-2 bg-gray-50 rounded">
          <span class="w-32 font-medium">Structure:</span>
          <span>{{ structureName }}</span>
        </div>
        <div class="flex items-center p-2 bg-gray-50 rounded">
          <span class="w-32 font-medium">Sector:</span>
          <span>{{ secteurName }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-2 > * + * {
      margin-top: 0.5rem;
    }
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
  `],
})
export class UserInfoComponent implements OnInit {
  username: string = "";
  role: string = "";
  structureName: string = "";
  secteurName: string = "";
  structureId: string = "";
  secteurId: string = "";

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getLoggedInUser().subscribe((user) => {
      if (user) {
        this.username = user.username || user.sub || "";
        this.role = user.role || "";
        
        // Use the readable names instead of IDs
        this.structureName = user.structureName || "Not specified";
        this.secteurName = user.secteurName || "Not specified";
        
        // Store IDs for reference (but don't display them)
        this.structureId = user.structure || "";
        this.secteurId = user.secteur || "";
      }
    });
  }
}
