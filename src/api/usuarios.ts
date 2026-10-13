import api from './axios';
import type { Usuario } from '../types/auth';

// ============================================
// GET /api/usuarios
// ============================================
export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await api.get<Usuario[]>('/api/usuarios');
  return response.data;
}

// ============================================
// POST /api/usuarios
// ============================================
export interface CrearUsuarioRequest {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  direccion: string;
  cedula: string;
}

export async function crearUsuario(data: CrearUsuarioRequest): Promise<Usuario> {
  // Forzamos rol SOCIO (solo hay 1 admin en el sistema)
  const payload = {
    ...data,
    rol: 'SOCIO',
  };
  const response = await api.post<Usuario>('/api/usuarios', payload);
  return response.data;
}

// ============================================
// PUT /api/usuarios/{id}
// ============================================
export interface ActualizarUsuarioRequest {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  direccion: string;
  cedula: string;
  rol: 'ADMIN' | 'SOCIO';
  activo: boolean;
}

export async function actualizarUsuario(
  id: number,
  data: ActualizarUsuarioRequest
): Promise<Usuario> {
  const response = await api.put<Usuario>(`/api/usuarios/${id}`, data);
  return response.data;
}

// ============================================
// PATCH /api/usuarios/{id}/activo
// ============================================
export async function cambiarActivoUsuario(id: number, activo: boolean): Promise<void> {
  await api.patch(`/api/usuarios/${id}/activo`, null, {
    params: { activo },
  });
}
export async function listarSocios(): Promise<Usuario[]> {
  const todos = await listarUsuarios();
  return todos.filter((u) => u.rol === 'SOCIO');
}
// ============================================
// MI PERFIL (SOCIO o ADMIN)
// ============================================

export async function obtenerMiPerfil(): Promise<Usuario> {
  const response = await api.get<Usuario>('/api/usuarios/mi-perfil');
  return response.data;
}

export interface ActualizarMiPerfilRequest {
  nombre: string;
  telefono: string;
  direccion: string;
  password?: string;   // opcional, solo si se cambia
}

export async function actualizarMiPerfil(
  data: ActualizarMiPerfilRequest
): Promise<Usuario> {
  const response = await api.put<Usuario>('/api/usuarios/mi-perfil', data);
  return response.data;
}
// ============================================
// OLVIDÉ MI CONTRASEÑA
// ============================================

export async function solicitarResetPassword(correo: string): Promise<{ mensaje: string }> {
  const response = await api.post<{ mensaje: string }>(
    '/api/usuarios/olvide-password',
    { correo }
  );
  return response.data;
}

export async function validarTokenReset(token: string): Promise<{ valido: boolean; nombre?: string }> {
  const response = await api.get<{ valido: boolean; nombre?: string }>(
    '/api/usuarios/validar-token-reset',
    { params: { token } }
  );
  return response.data;
}

export async function resetPassword(token: string, nuevaPassword: string): Promise<{ mensaje: string }> {
  const response = await api.post<{ mensaje: string }>(
    '/api/usuarios/reset-password',
    { token, nuevaPassword }
  );
  return response.data;
}