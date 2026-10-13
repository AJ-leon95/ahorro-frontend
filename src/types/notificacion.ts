import type { Usuario } from './auth';

export interface Notificacion {
  id: number;
  usuario: Usuario;
  asunto: string;
  mensaje: string;
  leida: boolean;
  fechaEnvio: string;
}