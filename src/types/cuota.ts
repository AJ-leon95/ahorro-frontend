import type { Credito } from './credito';

export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

export interface Cuota {
  id: number;
  credito: Credito;
  numero: number;
  monto: number;
  montoCapital: number;
  montoInteres: number;
  fechaVencimiento: string;
  estado: EstadoCuota;
  fechaPago: string | null;
  mora: number;
}