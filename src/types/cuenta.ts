import type { Usuario } from './auth';

export type TipoCuenta = 'SOCIO' | 'INTERESES' | 'MORAS' | 'GASTOS';

export interface Cuenta {
  id: number;
  usuario: Usuario | null;
  tipoCuenta: TipoCuenta;
  saldoCuenta: number;
  fechaApertura: string;
}