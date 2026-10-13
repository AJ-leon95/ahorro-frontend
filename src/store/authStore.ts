import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '../types/auth';

interface AuthState {
    // Estado
    usuario: Usuario | null;
    token: string | null;

    // Acciones
    setAuth: (usuario: Usuario, token: string) => void;
    logout: () => void;

    // Derivados (helpers)
    isAuthenticated: () => boolean;
    hasRole: (rol: 'ADMIN' | 'SOCIO') => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            usuario: null,
            token: null,

            // Guardar usuario y token (después de login exitoso)
            setAuth: (usuario, token) => {
                set({ usuario, token });
            },

            // Cerrar sesión
            logout: () => {
                set({ usuario: null, token: null });
            },

            // ¿Está autenticado?
            isAuthenticated: () => {
                return !!get().token && !!get().usuario;
            },

            // ¿Tiene cierto rol?
            hasRole: (rol) => {
                return get().usuario?.rol === rol;
            },
        }),
        {
            name: 'auth-storage', // clave en localStorage
        }
    )
);