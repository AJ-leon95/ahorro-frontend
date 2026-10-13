import api from './axios';
import type { LoginRequest, LoginResponse } from '../types/auth';

// POST /auth/login
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
}

// GET /auth/verify?token=...
export async function verificarCorreo(token: string): Promise<void> {
  await api.get('/auth/verify', {
    params: { token },
  });
}