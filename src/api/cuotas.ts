import api from './axios';
import type { Cuota } from '../types/cuota';

// ============================================
// CONSULTAS (ADMIN)
// ============================================

export async function listarCuotas(): Promise<Cuota[]> {
  const response = await api.get<Cuota[]>('/api/cuotas');
  return response.data;
}

export async function listarCuotasPorCredito(creditoId: number): Promise<Cuota[]> {
  const response = await api.get<Cuota[]>(`/api/cuotas/credito/${creditoId}`);
  return response.data;
}

// ============================================
// CONSULTAS (SOCIO)
// ============================================

export async function listarMisCuotas(): Promise<Cuota[]> {
  const response = await api.get<Cuota[]>('/api/cuotas/mis-cuotas');
  return response.data;
}

// ============================================
// ACCIONES
// ============================================

export async function pagarCuota(id: number): Promise<Cuota> {
  const response = await api.put<Cuota>(`/api/cuotas/${id}/pagar`);
  return response.data;
}

export async function calcularMoras(): Promise<void> {
  await api.post('/api/cuotas/calcular-moras');
}