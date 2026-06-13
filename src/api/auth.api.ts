import api from './axiosInstance';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
  return data;
};

export const register = async (credentials: RegisterCredentials): Promise<void> => {
  await api.post('/api/auth/register', credentials);
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/refresh');
  return data;
};
