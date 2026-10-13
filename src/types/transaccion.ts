import type { Usuario } from './auth';

export type TipoTransaccion =
  | 'LOGIN'
  | 'CREAR_USUARIO'
  | 'ACTUALIZAR_USUARIO'
  | 'ELIMINAR_USUARIO'
  | 'CREAR_CUENTA'
  | 'DEPOSITO'
  | 'SOLICITAR_DEPOSITO'
  | 'CONFIRMAR_DEPOSITO'
  | 'RECHAZAR_DEPOSITO'
  | 'ELIMINAR_DEPOSITO'
  | 'SOLICITAR_CREDITO'
  | 'APROBAR_CREDITO'
  | 'RECHAZAR_CREDITO'
  | 'PAGO_CUOTA'
  | 'MORA'
  | 'ACTUALIZAR_SALDO';

export interface Transaccion {
  id: number;
  usuario: Usuario | null;
  tipoTransaccion: TipoTransaccion;
  descripcion: string;
  monto: number | null;
  fechaTransaccion: string;
  ip: string | null;
}