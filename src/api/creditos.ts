import api from './axios';
import type { Credito } from '../types/credito';

// ============================================
// CONSULTAS (ADMIN)
// ============================================

export async function listarCreditos(): Promise<Credito[]> {
  const response = await api.get<Credito[]>('/api/creditos');
  return response.data;
}

// ============================================
// CONSULTAS (SOCIO)
// ============================================

export async function listarMisCreditos(): Promise<Credito[]> {
  const response = await api.get<Credito[]>('/api/creditos/mis-creditos');
  return response.data;
}

// ============================================
// CREAR
// ============================================

export async function crearCreditoDesdePeticion(peticionId: number): Promise<Credito> {
  const response = await api.post<Credito>(
    `/api/creditos/desde-peticion/${peticionId}`
  );
  return response.data;
}

// ============================================
// ELIMINAR
// ============================================

export async function eliminarCredito(id: number): Promise<void> {
  await api.delete(`/api/creditos/${id}`);
}