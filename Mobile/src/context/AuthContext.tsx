import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../models/user.model';
import { StorageService, DEFAULT_BASE_URL } from '../services/storage.service';
import { apiService } from '../services/api.service';
import { AuthRepository } from '../repositories/auth.repository';
import { LoginDto, RegisterDto } from '../models/auth.model';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  serverUrl: string;
  login: (dto: LoginDto) => Promise<boolean>;
  register: (dto: RegisterDto) => Promise<boolean>;
  logout: () => Promise<void>;
  updateServerUrl: (newUrl: string) => Promise<void>;
  autoDetectServer: () => Promise<string>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const authRepo = new AuthRepository();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverUrl, setServerUrl] = useState<string>(DEFAULT_BASE_URL);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setLoading(true);

      // Auto-detección inteligente de backend activo (10.0.2.2 para Pixel_7 / Emulador, o IP de Metro para celular)
      const detectedUrl = await StorageService.autoDetectWorkingUrl();
      setServerUrl(detectedUrl);
      apiService.setBaseUrl(detectedUrl);

      const isAuth = await authRepo.isAuthenticated();
      if (isAuth) {
        const cachedUser = await authRepo.getCurrentUser();
        setUser(cachedUser);
        setIsAuthenticated(true);
        // Intentar actualizar perfil en segundo plano
        try {
          const freshUser = await authRepo.getProfile();
          setUser(freshUser);
        } catch {
          // Mantener usuario guardado si falla la red
        }
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (dto: LoginDto): Promise<boolean> => {
    // Si la URL actual falla con Network Error, intentar detectar la URL activa antes de rendirse
    try {
      const res = await authRepo.login(dto);
      if (res.token) {
        setUser(res.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response) {
        console.log('[AuthContext] Network Error detectado. Probando re-conexión automática...');
        const newUrl = await StorageService.autoDetectWorkingUrl();
        if (newUrl !== serverUrl) {
          setServerUrl(newUrl);
          apiService.setBaseUrl(newUrl);
          // Reintentar login con la nueva URL detectada
          const retryRes = await authRepo.login(dto);
          if (retryRes.token) {
            setUser(retryRes.user);
            setIsAuthenticated(true);
            return true;
          }
        }
      }
      throw err;
    }
  };

  const register = async (dto: RegisterDto): Promise<boolean> => {
    const res = await authRepo.register(dto);
    if (res.token) {
      setUser(res.user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await authRepo.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateServerUrl = async (newUrl: string) => {
    let formatted = newUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }
    await StorageService.setBaseUrl(formatted);
    setServerUrl(formatted);
    apiService.setBaseUrl(formatted);
  };

  const autoDetectServer = async (): Promise<string> => {
    const detected = await StorageService.autoDetectWorkingUrl();
    setServerUrl(detected);
    apiService.setBaseUrl(detected);
    return detected;
  };

  const refreshProfile = async () => {
    try {
      const fresh = await authRepo.getProfile();
      setUser(fresh);
    } catch {
      // Ignorar
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        serverUrl,
        login,
        register,
        logout,
        updateServerUrl,
        autoDetectServer,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
