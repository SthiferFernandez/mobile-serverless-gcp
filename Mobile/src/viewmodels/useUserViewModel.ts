import { useState, useCallback, useEffect, useMemo } from 'react';
import { UserRepository } from '../repositories/user.repository';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

const userRepo = new UserRepository();

export function useUserViewModel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userRepo.getAll();
      setUsers(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getUserById = async (id: number): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      const user = await userRepo.getById(id);
      setSelectedUser(user);
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al obtener usuario';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDto): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      await userRepo.create(data);
      await loadUsers();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al crear usuario';
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (id: number, data: UpdateUserDto): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      await userRepo.update(id, data);
      await loadUsers();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar usuario';
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      await userRepo.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar usuario';
      setError(msg);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.apellido.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return {
    users: filteredUsers,
    rawUsers: users,
    selectedUser,
    loading,
    saving,
    deleting,
    error,
    searchQuery,
    setSearchQuery,
    loadUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    clearError: () => setError(null),
  };
}
