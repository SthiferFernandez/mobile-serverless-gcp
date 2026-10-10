import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme_preference';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  statCardBg: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
}

export const lightColors: ThemeColors = {
  isDark: false,
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#cbd5e1',
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  accent: '#7c3aed',
  inputBg: '#f8fafc',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  statCardBg: '#ffffff',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
};

// MODO OSCURO MORADO (Purple Dark Mode)
export const purpleDarkColors: ThemeColors = {
  isDark: true,
  background: '#110724',       // Morado noche muy oscuro
  surface: '#1c0c38',          // Morado oscuro de superficie
  card: '#27124d',             // Tarjeta morada elegante
  cardBorder: '#451f85',       // Borde morado brillante
  text: '#f5f3ff',             // Blanco lila nítido
  textSecondary: '#ddd6fe',    // Lavanda claro
  textMuted: '#a78bfa',        // Morado pastel suave
  border: '#4c2294',           // Borde morado
  primary: '#a855f7',          // Púrpura vibrante
  primaryLight: '#38166d',     // Púrpura oscuro para botones suaves
  accent: '#c084fc',           // Acento violeta brillante
  inputBg: '#1d0b3b',          // Fondo de inputs morado oscuro
  tabBar: '#180a33',           // Barra inferior morada
  tabBarBorder: '#3f1a7d',     // Borde de barra inferior
  statCardBg: '#25104a',       // Fondo de tarjetas estadísticas
  danger: '#ef4444',
  dangerLight: '#450a0a',
  success: '#22c55e',
  successLight: '#052e16',
  warning: '#f59e0b',
  warningLight: '#451a03',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(true); // Morado por defecto según preferencia

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    } catch {
      // Ignorar
    }
  };

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const colors = isDark ? purpleDarkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
