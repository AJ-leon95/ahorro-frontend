import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

// Esquema de validación
const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setCargando(true);
    setErrorServidor(null);

    try {
      // 1. Llamar al backend
      const response = await login(data);

      // 2. Guardar en el store
      setAuth(response.usuario, response.token);

      // 3. Redirigir según rol
      if (response.usuario.rol === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/socio/dashboard");
      }
    } catch (error: any) {
      // 4. Manejar errores
      if (error.response?.status === 401) {
        setErrorServidor("Credenciales incorrectas");
      } else if (error.response?.status === 403) {
        setErrorServidor("Correo no verificado");
      } else {
        setErrorServidor("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              {...register("correo")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@junta.com"
            />
            {errors.correo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.correo.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error del servidor */}
          {errorServidor && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {errorServidor}
            </div>
          )}

          {/* Botón de iniciar sesión */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          {/* ✅ Link de olvidé contraseña */}
          <div className="text-center pt-2">
            <Link
              to="/olvide-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}