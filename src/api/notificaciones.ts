import api from './axios';
import type { Notificacion } from '../types/notificacion';

// ============================================
// ADMIN
// ============================================

export async function listarNotificaciones(): Promise<Notificacion[]> {
  const response = await api.get<Notificacion[]>('/api/notificaciones');
  return response.data;
}

export async function crearNotificacion(
  usuarioId: number,
  asunto: string,
  mensaje: string
): Promise<Notificacion> {
  const response = await api.post<Notificacion>(
    `/api/notificaciones/usuario/${usuarioId}`,
    { asunto, mensaje }
  );
  return response.data;
}

export async function enviarNotificacionMasiva(
  asunto: string,
  mensaje: string
): Promise<void> {
  await api.post('/api/notificaciones/masiva', { asunto, mensaje });
}

export async function eliminarNotificacion(id: number): Promise<void> {
  await api.delete(`/api/notificaciones/${id}`);
}

// ============================================
// SOCIO
// ============================================

export async function listarMisNotificaciones(): Promise<Notificacion[]> {
  const response = await api.get<Notificacion[]>('/api/notificaciones/mis-notificaciones');
  return response.data;
}

export async function contarMisNoLeidas(): Promise<number> {
  const response = await api.get<{ noLeidas: number }>(
    '/api/notificaciones/mis-notificaciones/contar-no-leidas'
  );
  return response.data.noLeidas;
}

export async function marcarMiNotificacionComoLeida(id: number): Promise<Notificacion> {
  const response = await api.put<Notificacion>(
    `/api/notificaciones/mis-notificaciones/${id}/leer`
  );
  return response.data;
}