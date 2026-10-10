import { UserService } from '../services/user.service';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

export class UserRepository {
  async getAll(): Promise<User[]> {
    return await UserService.getAll();
  }

  async getById(id: number): Promise<User> {
    return await UserService.getById(id);
  }

  async create(data: CreateUserDto): Promise<User> {
    return await UserService.create(data);
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return await UserService.update(id, data);
  }

  async delete(id: number): Promise<{ message: string; id: number }> {
    return await UserService.delete(id);
  }
}
