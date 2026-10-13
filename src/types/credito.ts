import type { Usuario } from './auth';
import type { Peticion } from './peticion';

export type EstadoCredito = 'ACTIVO' | 'PAGADO' | 'VENCIDO';

export interface Credito {
  id: number;
  usuario: Usuario;
  peticion: Peticion | null;
  monto: number;
  interes: number;
  plazo: number;
  montoTotal: number;
  cuotaMensual: number;
  estado: EstadoCredito;
  fechaInicio: string;
  fechaFin: string;
}