import { apiService } from './api.service';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';
import { User } from '../models/user.model';

export class AuthService {
  static async login(credentials: LoginDto): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/login', credentials);
  }

  static async register(data: RegisterDto): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/register', data);
  }

  static async getProfile(): Promise<User> {
    return await apiService.get<User>('/profile');
  }
}
