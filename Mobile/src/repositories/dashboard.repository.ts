import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardCompositeData, DashboardStats, NotificationItem } from '../models/dashboard.model';
import { User } from '../models/user.model';

export class DashboardRepository {
  /**
   * CONSUMO SIMULTÁNEO / CONCURRENTE (Punto 6 de la rúbrica)
   * Ejecuta en paralelo las 4 peticiones independientes utilizando Promise.all()
   */
  async fetchDashboardConcurrent(): Promise<DashboardCompositeData> {
    const startTime = Date.now();

    // Lanzamos las 4 promesas simultáneamente
    const [users, profile, stats, notifications] = await Promise.all([
      UserService.getAll(),
      AuthService.getProfile(),
      DashboardService.getStats(),
      DashboardService.getNotifications(),
    ]);

    const loadTimeMs = Date.now() - startTime;

    return {
      users,
      profile,
      stats,
      notifications,
      loadTimeMs,
    };
  }

  /**
   * CONSUMO SECUENCIAL (Para propósitos comparativos en clase)
   * Ejecuta una por una esperando la respuesta anterior
   */
  async fetchDashboardSequential(): Promise<DashboardCompositeData> {
    const startTime = Date.now();

    const users = await UserService.getAll();
    const profile = await AuthService.getProfile();
    const stats = await DashboardService.getStats();
    const notifications = await DashboardService.getNotifications();

    const loadTimeMs = Date.now() - startTime;

    return {
      users,
      profile,
      stats,
      notifications,
      loadTimeMs,
    };
  }
}
