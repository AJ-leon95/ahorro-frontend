// Usuario que viene del backend
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  cedula: string;
  rol: 'ADMIN' | 'SOCIO';
  verificado: boolean;
  activo: boolean;
  fechaRegistro?: string;
}

// Petición de login
export interface LoginRequest {
  correo: string;
  password: string;
}

// Respuesta del backend al hacer login
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}