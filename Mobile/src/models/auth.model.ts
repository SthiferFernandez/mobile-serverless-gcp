import { User } from './user.model';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  foto?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
