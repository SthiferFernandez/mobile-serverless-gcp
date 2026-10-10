export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  foto?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  foto?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  foto?: string;
}
