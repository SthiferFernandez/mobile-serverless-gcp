import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { LoginDto, RegisterDto, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

export class AuthRepository {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await AuthService.login(credentials);
    if (response.token) {
      await StorageService.setToken(response.token);
      await StorageService.setUser(response.user);
    }
    return response;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await AuthService.register(data);
    if (response.token) {
      await StorageService.setToken(response.token);
      await StorageService.setUser(response.user);
    }
    return response;
  }

  async logout(): Promise<void> {
    await StorageService.clearAll();
  }

  async getCurrentUser(): Promise<User | null> {
    return await StorageService.getUser();
  }

  async getProfile(): Promise<User> {
    const user = await AuthService.getProfile();
    await StorageService.setUser(user);
    return user;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getToken();
    return !!token;
  }
}
