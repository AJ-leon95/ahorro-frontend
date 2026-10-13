import type { Archivo } from './archivo';
import type { Cuenta } from './cuenta';

export type EstadoDeposito = 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';

export interface Deposito {
  id: number;
  cuenta: Cuenta;
  monto: number;
  fechaDeposito: string;
  estadoDeposito: EstadoDeposito;
  archivo: Archivo | null;
  observaciones: string | null;
}