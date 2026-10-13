import type { Archivo } from './archivo';
import type { Usuario } from './auth';

export type EstadoPeticion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface Peticion {
  id: number;
  usuario: Usuario;
  monto: number;
  interes: number;
  plazo: number;
  motivo: string | null;
  estado: EstadoPeticion;
  fechaPeticion: string;
  fechaRespuesta: string | null;
  archivo: Archivo | null;
}