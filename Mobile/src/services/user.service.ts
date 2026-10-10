import { apiService } from './api.service';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

export class UserService {
  static async getAll(): Promise<User[]> {
    return await apiService.get<User[]>('/users');
  }

  static async getById(id: number): Promise<User> {
    return await apiService.get<User>(`/users/${id}`);
  }

  static async create(data: CreateUserDto): Promise<User> {
    return await apiService.post<User>('/users', data);
  }

  static async update(id: number, data: UpdateUserDto): Promise<User> {
    return await apiService.put<User>(`/users/${id}`, data);
  }

  static async delete(id: number): Promise<{ message: string; id: number }> {
    return await apiService.delete<{ message: string; id: number }>(`/users/${id}`);
  }
}
