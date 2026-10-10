import { User } from './user.model';

export interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  activeSessions: number;
  serverUptime: string;
  databaseStatus: string;
  timestamp: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

export interface DashboardCompositeData {
  users: User[];
  profile: User;
  stats: DashboardStats;
  notifications: NotificationItem[];
  loadTimeMs: number;
}
