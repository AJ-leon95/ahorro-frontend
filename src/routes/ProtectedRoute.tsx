import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { Usuario } from "../types/auth";

interface ProtectedRouteProps {
  roles?: Array<Usuario["rol"]>;
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const token = useAuthStore((state) => state.token);

  // 1. No logueado → al login
  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logueado pero sin el rol correcto → a su dashboard
  if (roles && !roles.includes(usuario.rol)) {
    const destino =
      usuario.rol === "ADMIN" ? "/admin/dashboard" : "/socio/dashboard";
    return <Navigate to={destino} replace />;
  }

  // 3. Todo OK → renderiza la ruta hija
  return <Outlet />;
}
