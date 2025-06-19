import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SecteurService } from '../../services/secteur.service';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../services/activity.service';
import { Api } from '../../models/api';
import { Secteur } from '../../models/secteur';
import { ApiRequest } from '../../models/api-request';
import { Activity, ActivityType } from '../../models/activity';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';

interface ApiSectorStat {
  sectorId: string;
  sectorName: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    TableModule,
    TooltipModule
  ],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('apiDistributionChart') private chartRef!: ElementRef;
  // Dashboard data
  apiCount = 0;
  sectorStats: ApiSectorStat[] = [];
  loading = true;
  lastUpdateTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  topSector: ApiSectorStat | null = null;
  balanceScore = 0; // Balance score out of 100
  usersCount = 0; // Total users in the system
  pendingRequests = 0; // Pending API requests
  
  // Recent activities from real data source
  recentActivities: Activity[] = [];
  
  // Color palette for visualizations
  colors = [
    '#FF9900', '#3366CC', '#4BC0C0', '#FF6384', '#9966FF',
    '#36A2EB', '#FF6384', '#FFCD56', '#4BC0C0', '#FF9F40',
    '#36A2EB', '#F44336', '#4CAF50', '#2196F3', '#FF5722'
  ];

  constructor(
    private apiService: ApiService,
    private secteurService: SecteurService,
    private router: Router,
    private userService: UserService,
    private activityService: ActivityService
  ) { }

  /**
   * Navigate to the requests page
   */
  navigateToRequests() {
    this.router.navigate(['/admin/api-requests']);
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadPendingRequests();
    this.loadUsersCount();
    this.loadRecentActivities();
  }
  
  ngAfterViewInit(): void {
    // Initialize chart after view is initialized (if sector stats are already loaded)
    if (this.sectorStats.length > 0) {
      this.initializeChart();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Get all APIs and sectors to calculate statistics
    Promise.all([
      this.loadAllApis(),
      this.loadAllSectors()
    ]).then(([apis, sectors]) => {
      // Process API data to calculate sector statistics
      this.processApiData(apis, sectors);
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    });
  }

  async loadAllApis(): Promise<Api[]> {
    return new Promise<Api[]>((resolve, reject) => {
      this.apiService.getApis(0, 1000).subscribe({
        next: (response: any) => {
          console.log('API response received:', response);
          
          // Ensure we're accessing the content array correctly
          const apis: Api[] = response.content || [];
          console.log('APIs extracted:', apis);
          
          // Set the count from the APIs array length or from totalElements
          this.apiCount = apis.length || response.totalElements || 0;
          console.log('API count set to:', this.apiCount);
          
          // If we have no APIs but response indicates there should be some,
          // log a warning
          if (apis.length === 0 && response.totalElements > 0) {
            console.warn('Response indicates APIs exist but none were in content array');
          }
          
          resolve(apis);
        },
        error: (error: any) => {
          console.error('Error loading APIs:', error);
          reject(error);
        }
      });
    });
  }

  async loadAllSectors(): Promise<Secteur[]> {
    return new Promise((resolve, reject) => {
      this.secteurService.getSecteurs().subscribe({
        next: (response: any) => {
          console.log('Sectors response received:', response);
          
          // Check if response is in the new paginated format
          if (response && Array.isArray(response.content)) {
            console.log('Found paginated sectors format, extracting content array');
            resolve(response.content);
          } 
          // Check for old format with secteurs array
          else if (response && Array.isArray(response.secteurs)) {
            console.log('Found old sectors format with secteurs array');
            resolve(response.secteurs);
          } 
          // Direct array response
          else if (Array.isArray(response)) {
            console.log('Response is directly an array of sectors');
            resolve(response);
          } 
          // No recognizable format
          else {
            console.error('Unexpected response format for sectors:', response);
            resolve([]);
          }
        },
        error: (error) => {
          console.error('Error loading sectors:', error);
          reject(error);
        }
      });
    });
  }

  processApiData(apis: Api[], sectors: Secteur[]): void {
    // Create a map of sector IDs to names for quick lookup
    const sectorMap = new Map<string, string>();
    sectors.forEach(sector => {
      sectorMap.set(sector.id, sector.name);
    });
    
    // Count APIs by sector
    const apiCountBySector = new Map<string, number>();
    
    apis.forEach(api => {
      const sectorId = api.secteur || 'unknown';
      apiCountBySector.set(sectorId, (apiCountBySector.get(sectorId) || 0) + 1);
    });
    
    // Convert to stats array with percentages
    this.sectorStats = Array.from(apiCountBySector.entries()).map(([sectorId, count], index) => {
      const percentage = (count / this.apiCount) * 100;
      return {
        sectorId,
        sectorName: sectorMap.get(sectorId) || 'Unknown',
        count,
        percentage,
        color: this.colors[index % this.colors.length]
      };
    });
    
    // Sort by count descending
    this.sectorStats.sort((a, b) => b.count - a.count);
    
    // Set top sector (first after sorting)
    this.topSector = this.sectorStats.length > 0 ? this.sectorStats[0] : null;
    
    // Calculate balance score based on distribution evenness
    this.calculateBalanceScore();
    
    // Update last update time
    this.lastUpdateTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Initialize or update chart if we have data and view is ready
    setTimeout(() => this.initializeChart(), 0);
  }

  // Chart.js instance
  private chart: Chart | null = null;

  refreshData(): void {
    this.loadDashboardData();
    this.loadPendingRequests();
    this.loadUsersCount();
    this.loadRecentActivities();
  }
  
  /**
   * Initialize the API distribution chart using Chart.js
   */
  private initializeChart(): void {
    // Only proceed if we have data and the chart element exists
    if (!this.chartRef || this.sectorStats.length === 0) return;
    
    // If chart already exists, destroy it before creating a new one
    if (this.chart) {
      this.chart.destroy();
    }
    
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    // Prepare data for the chart
    const data = {
      labels: this.sectorStats.map(stat => stat.sectorName),
      datasets: [{
        data: this.sectorStats.map(stat => stat.count),
        backgroundColor: this.sectorStats.map(stat => stat.color),
        borderWidth: 1
      }]
    };
    
    // Create the chart
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: '"Inter", sans-serif',
                size: 12
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.formattedValue;
                const percentage = this.sectorStats[context.dataIndex].percentage.toFixed(1);
                return `${label}: ${value} APIs (${percentage}%)`;
              }
            }
          }
        },
        cutout: '65%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }
  
  /**
   * Calculate balance score based on sector distribution evenness
   * A higher score means a more balanced distribution
   */
  calculateBalanceScore(): void {
    if (this.sectorStats.length <= 1) {
      this.balanceScore = 100;
      return;
    }
    
    // Calculate the ideal percentage if distribution was perfectly even
    const idealPercentage = 100 / this.sectorStats.length;
    
    // Calculate deviation from ideal
    let totalDeviation = 0;
    this.sectorStats.forEach(stat => {
      totalDeviation += Math.abs(stat.percentage - idealPercentage);
    });
    
    // Convert to a 0-100 score (lower deviation = higher score)
    // The max possible deviation is 2 * (100 - idealPercentage)
    const maxDeviation = 2 * (100 - idealPercentage);
    this.balanceScore = Math.round(100 - (totalDeviation / maxDeviation * 100));
    
    // Ensure score is within 0-100 range
    this.balanceScore = Math.max(0, Math.min(100, this.balanceScore));
  }
  
  /**
   * Get a label describing the current balance status
   */
  getBalanceLabel(): string {
    if (this.balanceScore > 70) return 'Balanced';
    if (this.balanceScore >= 40) return 'Moderate';
    return 'Unbalanced';
  }
  
  /**
   * Get a description of the distribution type
   */
  getDistributionType(): string {
    if (this.sectorStats.length <= 1) return 'Single Sector';
    if (this.balanceScore > 70) return 'Even Distribution';
    if (this.topSector && this.topSector.percentage > 50) return 'Dominant Sector';
    return 'Clustered Distribution';
  }
  
  /**
   * Get CSS class for trend visualization
   */
  getTrendClass(stat: ApiSectorStat): string {
    // Generate a consistent trend visualization based on the sector name
    const hashValue = this.hashString(stat.sectorName);
    if (hashValue % 3 === 0) return 'trend-up';
    if (hashValue % 3 === 1) return 'trend-stable';
    return 'trend-down';
  }
  
  /**
   * Get a random sector name for the activity feed
   */
  getRandomSector(): string {
    if (this.sectorStats.length === 0) return 'Unknown Sector';
    const randomIndex = Math.floor(Math.random() * this.sectorStats.length);
    return this.sectorStats[randomIndex].sectorName;
  }
  
  /**
   * Load count of pending API creation requests
   */
  loadPendingRequests(): void {
    this.apiService.getPendingApiCreationRequests(0, 1).subscribe({
      next: (response) => {
        this.pendingRequests = response.totalElements || 0;
        console.log('Loaded pending requests count:', this.pendingRequests);
      },
      error: (error) => {
        console.error('Error loading pending requests count:', error);
        this.pendingRequests = 0;
      }
    });
  }
  
  /**
   * Load total users count from the user service
   */
  loadUsersCount(): void {
    this.userService.getUsers(0, 1).subscribe({
      next: (response) => {
        this.usersCount = response.totalElements || 0;
      },
      error: (error) => {
        console.error('Error loading users count:', error);
        this.usersCount = 0;
      }
    });
  }
  
  /**
   * Load recent activities from the activity service
   */
  loadRecentActivities(): void {
    this.activityService.getRecentActivities(5).subscribe({
      next: (activities) => {
        console.log('Loaded recent activities:', activities);
        this.recentActivities = activities;
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
      }
    });
  }
  
  /**
   * Get formatted relative time using the activity service
   * @param date Date or date string to format
   * @returns Formatted relative time string
   */
  formatRelativeTime(date: Date | string): string {
    // Convert string timestamp to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.activityService.formatRelativeTime(dateObj);
  }
  
  /**
   * Get the appropriate icon for an activity type
   * @param activity Activity to get icon for
   * @returns Icon class string
   */
  getActivityIcon(activity: Activity): string {
    return this.activityService.getActivityIcon(activity.type);
  }
  
  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
