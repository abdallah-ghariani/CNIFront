import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-api-grid",
  imports: [CommonModule],
  templateUrl: "./api-grid.component.html",
})
export class ApiGridComponent {
  ads = [
    { title: "Api 1", description: "Description of ad 1" },
    { title: "Api 2", description: "Description of ad 2" },
    { title: "Api 3", description: "Description of ad 3" },
    { title: "Api 4", description: "Description of ad 4" },
  ];
}
