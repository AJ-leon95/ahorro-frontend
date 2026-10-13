import api from './axios';
import type { Cuenta, TipoCuenta } from '../types/cuenta';

// ============================================
// CONSULTAS
// ============================================

export async function listarCuentas(): Promise<Cuenta[]> {
  const response = await api.get<Cuenta[]>('/api/cuentas');
  return response.data;
}

// ============================================
// CREAR
// ============================================

// POST /api/cuentas/socio/{usuarioId}
export async function crearCuentaDeSocio(usuarioId: number): Promise<Cuenta> {
  const response = await api.post<Cuenta>(`/api/cuentas/socio/${usuarioId}`);
  return response.data;
}

// POST /api/cuentas/especial/{tipoCuenta}
export async function crearCuentaEspecial(tipoCuenta: TipoCuenta): Promise<Cuenta> {
  const response = await api.post<Cuenta>(`/api/cuentas/especial/${tipoCuenta}`);
  return response.data;
}

// ============================================
// ELIMINAR
// ============================================

export async function eliminarCuenta(id: number): Promise<void> {
  await api.delete(`/api/cuentas/${id}`);
}
// GET /api/cuentas/usuario/{usuarioId}
export async function obtenerCuentaPorUsuarioId(
  usuarioId: number
): Promise<Cuenta> {
  const response = await api.get<Cuenta>(`/api/cuentas/usuario/${usuarioId}`);
  return response.data;
}
export async function obtenerMiCuenta(): Promise<Cuenta> {
  const response = await api.get<Cuenta>('/api/cuentas/mi-cuenta');
  return response.data;
}
// ============================================
// REGISTRAR GASTO (restar de una cuenta)
// ============================================

export async function registrarGasto(
  cuentaId: number,
  monto: number,
  descripcion: string
): Promise<Cuenta> {
  const response = await api.put<Cuenta>(
    `/api/cuentas/${cuentaId}/restar`,
    null,
    { params: { monto, descripcion } }
  );
  return response.data;
}