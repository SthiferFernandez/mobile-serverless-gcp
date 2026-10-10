import { useState, useEffect, useCallback } from 'react';
import { AuthRepository } from '../repositories/auth.repository';
import { User } from '../models/user.model';
import { LoginDto, RegisterDto } from '../models/auth.model';

const authRepo = new AuthRepository();

export function useAuthViewModel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const isAuth = await authRepo.isAuthenticated();
      if (isAuth) {
        const currentUser = await authRepo.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginDto): Promise<boolean> => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await authRepo.login(credentials);
      setUser(res.user);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const register = async (data: RegisterDto): Promise<boolean> => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await authRepo.register(data);
      setUser(res.user);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al registrarse';
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authRepo.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    submitting,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError: () => setError(null),
  };
}
