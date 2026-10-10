import { useState, useCallback, useEffect } from 'react';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { DashboardStats, NotificationItem } from '../models/dashboard.model';
import { User } from '../models/user.model';

const dashboardRepo = new DashboardRepository();

export function useDashboardViewModel() {
  const [profile, setProfile] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTimeMs, setLoadTimeMs] = useState<number>(0);
  const [mode, setMode] = useState<'concurrent' | 'sequential'>('concurrent');

  const loadData = useCallback(async (fetchMode: 'concurrent' | 'sequential' = 'concurrent') => {
    try {
      setLoading(true);
      setError(null);
      setMode(fetchMode);

      const result = fetchMode === 'concurrent'
        ? await dashboardRepo.fetchDashboardConcurrent()
        : await dashboardRepo.fetchDashboardSequential();

      setUsers(result.users);
      setProfile(result.profile);
      setStats(result.stats);
      setNotifications(result.notifications);
      setLoadTimeMs(result.loadTimeMs);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData('concurrent');
  }, [loadData]);

  return {
    profile,
    users,
    stats,
    notifications,
    loading,
    error,
    loadTimeMs,
    mode,
    refreshConcurrent: () => loadData('concurrent'),
    refreshSequential: () => loadData('sequential'),
  };
}
