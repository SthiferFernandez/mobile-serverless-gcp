import { apiService } from './api.service';
import { DashboardStats, NotificationItem } from '../models/dashboard.model';

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    return await apiService.get<DashboardStats>('/stats');
  }

  static async getNotifications(): Promise<NotificationItem[]> {
    return await apiService.get<NotificationItem[]>('/notifications');
  }
}
