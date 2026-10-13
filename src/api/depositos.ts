import api from './axios';
import type { Deposito, EstadoDeposito } from '../types/deposito';
import { obtenerMiCuenta } from './cuentas';

// ============================================
// CONSULTAS (ADMIN)
// ============================================

export async function listarDepositos(): Promise<Deposito[]> {
  const response = await api.get<Deposito[]>('/api/depositos');
  return response.data;
}

export async function listarDepositosPorEstado(
  estado: EstadoDeposito
): Promise<Deposito[]> {
  const response = await api.get<Deposito[]>(`/api/depositos/estado/${estado}`);
  return response.data;
}

export async function listarDepositosPorCuenta(
  cuentaId: number
): Promise<Deposito[]> {
  const response = await api.get<Deposito[]>(`/api/depositos/cuenta/${cuentaId}`);
  return response.data;
}

// ============================================
// CREAR (ADMIN)
// ============================================

export interface CrearDepositoRequest {
  cuentaId: number;
  monto: number;
  archivoId: number;
  observaciones?: string;
}

export async function crearDeposito(data: CrearDepositoRequest): Promise<Deposito> {
  const payload = {
    cuenta: { id: data.cuentaId },
    monto: data.monto,
    archivo: { id: data.archivoId },
    observaciones: data.observaciones || null,
    estadoDeposito: 'PENDIENTE',
  };
  const response = await api.post<Deposito>('/api/depositos', payload);
  return response.data;
}

// ============================================
// ACCIONES (ADMIN)
// ============================================

export async function confirmarDeposito(id: number): Promise<Deposito> {
  const response = await api.put<Deposito>(`/api/depositos/${id}/confirmar`);
  return response.data;
}

export async function rechazarDeposito(id: number): Promise<Deposito> {
  const response = await api.put<Deposito>(`/api/depositos/${id}/rechazar`);
  return response.data;
}

export async function eliminarDeposito(id: number): Promise<void> {
  await api.delete(`/api/depositos/${id}`);
}

// ============================================
// SOCIO: mis depósitos
// ============================================

// GET /api/depositos/mis-depositos
export async function listarMisDepositos(): Promise<Deposito[]> {
  const response = await api.get<Deposito[]>('/api/depositos/mis-depositos');
  return response.data;
}

// POST /api/depositos
// El socio crea un depósito. El backend fuerza que sea en su propia cuenta,
// pero el payload requiere el id de la cuenta, así que la obtenemos primero.
export interface CrearMiDepositoRequest {
  monto: number;
  archivoId: number;
  observaciones?: string;
}

export async function crearMiDeposito(
  data: CrearMiDepositoRequest
): Promise<Deposito> {
  // 1. Obtener la cuenta del socio logueado
  const cuenta = await obtenerMiCuenta();

  // 2. Crear el depósito con el id de esa cuenta
  const payload = {
    cuenta: { id: cuenta.id },
    monto: data.monto,
    archivo: { id: data.archivoId },
    observaciones: data.observaciones || null,
    estadoDeposito: 'PENDIENTE',
  };

  const response = await api.post<Deposito>('/api/depositos', payload);
  return response.data;
}

// DELETE /api/depositos/mis-depositos/{id}
export async function eliminarMiDeposito(id: number): Promise<void> {
  await api.delete(`/api/depositos/mis-depositos/${id}`);
}