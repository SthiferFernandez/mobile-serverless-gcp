import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { StorageService, DEFAULT_BASE_URL } from './storage.service';

class ApiService {
  private client: AxiosInstance;
  private currentBaseUrl: string = DEFAULT_BASE_URL;

  constructor() {
    this.client = axios.create({
      baseURL: DEFAULT_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
    this.initBaseUrl();
  }

  private async initBaseUrl() {
    try {
      const savedUrl = await StorageService.getBaseUrl();
      this.setBaseUrl(savedUrl);
    } catch {
      // Keep default
    }
  }

  public setBaseUrl(newUrl: string) {
    this.currentBaseUrl = newUrl;
    this.client.defaults.baseURL = newUrl;
  }

  public getBaseUrl(): string {
    return this.currentBaseUrl;
  }

  private setupInterceptors() {
    // Interceptor de peticiones: Inyecta el JWT Bearer
    this.client.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de respuestas: Manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          console.warn('[API] Sesión no autorizada o token expirado');
        }
        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.get<T>(url, config);
    return res.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.post<T>(url, data, config);
    return res.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.put<T>(url, data, config);
    return res.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.delete<T>(url, config);
    return res.data;
  }
}

export const apiService = new ApiService();
