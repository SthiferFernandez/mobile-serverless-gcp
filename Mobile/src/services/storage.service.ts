import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { User } from '../models/user.model';

const TOKEN_KEY = '@mobile_jwt_token';
const USER_KEY = '@mobile_user_data';
const BASE_URL_KEY = '@mobile_api_base_url';

// Extraer la IP dinámica de la máquina anfitriona donde corre Metro
const metroHost = Constants.expoConfig?.hostUri
  ? Constants.expoConfig.hostUri.split(':')[0]
  : null;

// IP por defecto según el entorno:
// - Emulador Android (Pixel_7): 10.0.2.2 es el túnel oficial al host
// - Dispositivo físico: la IP de la máquina donde corre Metro (ej. 192.168.60.88)
export const DEFAULT_EMULATOR_URL = 'http://10.0.2.2:8080';
export const DEFAULT_LAN_URL = metroHost
  ? `http://${metroHost}:8080`
  : 'http://192.168.60.88:8080';
export const DEFAULT_CLOUD_RUN_URL = 'https://mobile-backend-api-414714685541.us-central1.run.app';
export const DEFAULT_API_GATEWAY_URL = 'https://mobile-api-gateway-5aimezc5.uc.gateway.dev';

export const DEFAULT_BASE_URL = DEFAULT_CLOUD_RUN_URL;

export class StorageService {
  static async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  static async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  static async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }

  static async getBaseUrl(): Promise<string> {
    const saved = await AsyncStorage.getItem(BASE_URL_KEY);
    if (saved && saved.trim().length > 0) {
      return saved;
    }
    return DEFAULT_BASE_URL;
  }

  static async setBaseUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(BASE_URL_KEY, url);
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  /**
   * PING INTELIGENTE:
   * Prueba automáticamente cuál URL responde en el puerto 8080
   * (10.0.2.2 para emuladores, o la IP Wi-Fi de Metro para teléfonos)
   */
  static async autoDetectWorkingUrl(): Promise<string> {
    const candidates = [
      DEFAULT_CLOUD_RUN_URL, // Google Cloud Run Serverless en GCP
      DEFAULT_EMULATOR_URL,  // http://10.0.2.2:8080 (ideal para Pixel_7 / Emulador)
      DEFAULT_LAN_URL,       // http://192.168.60.88:8080 (ideal para Wi-Fi)
      'http://192.168.60.88:8080',
      'http://10.0.2.2:8080',
      'http://localhost:8080',
    ];

    // Eliminar duplicados
    const uniqueCandidates = Array.from(new Set(candidates));

    for (const url of uniqueCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch(`${url}/health`, {
          signal: controller.signal,
          method: 'GET',
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          console.log(`[StorageService] Backend detectado exitosamente en: ${url}`);
          await StorageService.setBaseUrl(url);
          return url;
        }
      } catch {
        // Continuar al siguiente candidato
      }
    }

    // Si ninguno respondió al ping, usar por defecto según plataforma
    return Platform.OS === 'android' ? DEFAULT_EMULATOR_URL : DEFAULT_LAN_URL;
  }
}
