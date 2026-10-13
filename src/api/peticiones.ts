import api from './axios';
import type { Peticion, EstadoPeticion } from '../types/peticion';

// ============================================
// CONSULTAS (ADMIN)
// ============================================

export async function listarPeticiones(): Promise<Peticion[]> {
  const response = await api.get<Peticion[]>('/api/peticiones');
  return response.data;
}

export async function listarPeticionesPorEstado(
  estado: EstadoPeticion
): Promise<Peticion[]> {
  const response = await api.get<Peticion[]>(`/api/peticiones/estado/${estado}`);
  return response.data;
}

// ============================================
// CONSULTAS (SOCIO)
// ============================================

export async function listarMisPeticiones(): Promise<Peticion[]> {
  const response = await api.get<Peticion[]>('/api/peticiones/mis-peticiones');
  return response.data;
}

export async function obtenerMiPeticion(id: number): Promise<Peticion> {
  const response = await api.get<Peticion>(`/api/peticiones/mis-peticiones/${id}`);
  return response.data;
}

// ============================================
// CREAR (SOCIO)
// ============================================

export interface CrearPeticionRequest {
  monto: number;
  interes: number;
  plazo: number;
  motivo?: string;
  archivoId?: number;
}

export async function crearPeticion(data: CrearPeticionRequest): Promise<Peticion> {
  const payload = {
    monto: data.monto,
    interes: data.interes,
    plazo: data.plazo,
    motivo: data.motivo || null,
    archivo: data.archivoId ? { id: data.archivoId } : null,
  };
  const response = await api.post<Peticion>('/api/peticiones', payload);
  return response.data;
}

// ============================================
// ACCIONES (ADMIN)
// ============================================

export async function aprobarPeticion(id: number): Promise<Peticion> {
  const response = await api.put<Peticion>(`/api/peticiones/${id}/aprobar`);
  return response.data;
}

export async function rechazarPeticion(
  id: number,
  motivo: string
): Promise<Peticion> {
  const response = await api.put<Peticion>(`/api/peticiones/${id}/rechazar`, {
    motivo,
  });
  return response.data;
}

export async function eliminarPeticion(id: number): Promise<void> {
  await api.delete(`/api/peticiones/${id}`);
}