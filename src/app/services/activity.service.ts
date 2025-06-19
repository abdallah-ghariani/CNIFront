import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Activity, ActivityType } from '../models/activity';
import { Page } from '../models/page';

/**
 * ActivityService - Handles fetching and recording of user activities
 * across the CNI platform
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private readonly endpoints = {
    activities: `${environment.BACKEND_URL}api/activities`,
    recentActivities: `${environment.BACKEND_URL}api/activities/recent`
  };

  constructor(private http: HttpClient) { }

  /**
   * Get authentication options for HTTP requests
   * @returns HTTP options with authentication headers
   */
  private getAuthOptions(): { withCredentials: boolean, headers: HttpHeaders } {
    const token = localStorage.getItem('jwt_token');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return {
      withCredentials: true,
      headers: headers
    };
  }

  /**
   * Get recent activities
   * @param limit Number of recent activities to retrieve
   * @param types Optional array of activity types to filter by
   * @returns Observable of recent activities
   */
  getRecentActivities(limit: number = 5, types?: ActivityType[]): Observable<Activity[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (types && types.length > 0) {
      params = params.set('types', types.join(','));
    }
    
    return this.http.get<Activity[]>(
      this.endpoints.recentActivities,
      { ...this.getAuthOptions(), params }
    ).pipe(
      map(activities => {
        // Convert string timestamps to Date objects
        return activities.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      }),
      catchError(error => {
        console.error('Error fetching recent activities:', error);
        // Return empty array on error
        return of([]);
      })
    );
  }

  /**
   * Record a new activity
   * @param activity Activity to record
   * @returns Observable of the created activity
   */
  recordActivity(activity: Activity): Observable<Activity> {
    return this.http.post<Activity>(
      this.endpoints.activities,
      activity,
      this.getAuthOptions()
    ).pipe(
      catchError(error => {
        console.error('Error recording activity:', error);
        return of({ ...activity, id: 'local-' + new Date().getTime() } as Activity);
      })
    );
  }



  /**
   * Get icon class for activity type
   * @param type Activity type
   * @returns Icon class for the activity type
   */
  getActivityIcon(type: ActivityType): string {
    switch (type) {
      case ActivityType.API_CREATED:
        return 'pi pi-plus-circle text-blue-500';
      case ActivityType.API_UPDATED:
        return 'pi pi-pencil text-orange-500';
      case ActivityType.API_REQUEST_CREATED:
        return 'pi pi-inbox text-blue-500';
      case ActivityType.API_REQUEST_APPROVED:
        return 'pi pi-check-circle text-green-500';
      case ActivityType.API_REQUEST_REJECTED:
        return 'pi pi-times-circle text-red-500';
      case ActivityType.USER_REGISTERED:
        return 'pi pi-user-plus text-green-500';
      case ActivityType.USER_LOGIN:
        return 'pi pi-sign-in text-purple-500';
      case ActivityType.SECTOR_ADDED:
        return 'pi pi-sitemap text-teal-500';
      case ActivityType.STRUCTURE_ADDED:
        return 'pi pi-building text-blue-500';
      case ActivityType.SERVICE_ADDED:
        return 'pi pi-cog text-amber-500';
      case ActivityType.SYSTEM_MAINTENANCE:
        return 'pi pi-wrench text-gray-500';
      default:
        return 'pi pi-info-circle text-gray-500';
    }
  }

  /**
   * Format relative time (e.g., "2 minutes ago")
   * @param date Date to format
   * @returns Formatted relative time string
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 30) return 'just now';
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    if (diffDay < 30) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    
    return date.toLocaleDateString();
  }
}
