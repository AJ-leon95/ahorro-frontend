import api from './axios';
import type { Transaccion, TipoTransaccion } from '../types/transaccion';

export async function listarTransacciones(): Promise<Transaccion[]> {
  const response = await api.get<Transaccion[]>('/api/transacciones');
  return response.data;
}

export async function listarMisTransacciones(): Promise<Transaccion[]> {
  const response = await api.get<Transaccion[]>('/api/transacciones/mis-transacciones');
  return response.data;
}

export async function listarTransaccionesPorTipo(
  tipo: TipoTransaccion
): Promise<Transaccion[]> {
  const response = await api.get<Transaccion[]>(`/api/transacciones/tipo/${tipo}`);
  return response.data;
}