import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  constructor() {}

  ngAfterViewInit() {
    this.createCharts();
  }

  createCharts() {
    // Pie Chart (directly initializing the chart)
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],  // Labels
        datasets: [{
          data: [300, 500, 100],  // Values for each label
          backgroundColor: ['#ff0000', '#0000ff', '#ffff00'],  // Colors for each segment
        }]
      },
      options: {
        responsive: true
      }
    });

    // Bar ChartT
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],  // Labels for the bar chart
        datasets: [{
          label: 'Earnings',
          data: [65, 59, 80, 81, 56],  // Earnings data
          backgroundColor: '#4e73df',  // Bar color
          borderColor: '#4e73df',  // Border color
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}
