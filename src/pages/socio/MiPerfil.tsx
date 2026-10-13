import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { obtenerMiPerfil, actualizarMiPerfil } from '../../api/usuarios';
import { useAuthStore } from '../../store/authStore';
import type { Usuario } from '../../types/auth';

export default function MiPerfil() {
  const usuarioStore = useAuthStore((state) => state.usuario);
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerMiPerfil();
        setPerfil(data);
        setNombre(data.nombre);
        setTelefono(data.telefono || '');
        setDireccion(data.direccion || '');
      } catch {
        setError('No se pudo cargar tu perfil');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setExito(false);

    // Validaciones locales
    const erroresLocales: string[] = [];
    if (!nombre.trim() || nombre.length < 3) {
      erroresLocales.push('El nombre debe tener al menos 3 caracteres');
    }
    if (!telefono || telefono.length !== 10) {
      erroresLocales.push('El teléfono debe tener 10 dígitos');
    }
    if (!direccion.trim()) {
      erroresLocales.push('La dirección es obligatoria');
    }
    if (password && password.length < 6) {
      erroresLocales.push('La nueva contraseña debe tener al menos 6 caracteres');
    }
    if (password && password !== passwordConfirm) {
      erroresLocales.push('Las contraseñas no coinciden');
    }

    if (erroresLocales.length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setEnviando(true);
    try {
      const actualizado = await actualizarMiPerfil({
        nombre,
        telefono,
        direccion,
        password: password || undefined,
      });

      setPerfil(actualizado);
      setExito(true);
      setPassword('');
      setPasswordConfirm('');

      // Actualizar el store con los nuevos datos
      if (token) {
        setAuth(actualizado, token);
      }

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setExito(false), 3000);
    } catch (err: any) {
      const data = err.response?.data;
      if (Array.isArray(data)) setErrores(data);
      else if (typeof data === 'string') setErrores([data]);
      else setErrores(['Error al actualizar el perfil']);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tu perfil...
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Error al cargar el perfil'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        <p className="text-slate-500 text-sm mt-1">
          Actualiza tu información personal
        </p>
      </div>

      {/* Card del perfil */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-3xl">
            {perfil.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-xl">{perfil.nombre}</p>
            <p className="text-sm text-slate-500">{perfil.correo}</p>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              {perfil.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Editar información
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                minLength={3}
                maxLength={100}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Correo (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
              <span className="ml-2 text-xs text-slate-400">(no editable)</span>
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                value={perfil.correo}
                disabled
                className="w-full pl-10 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md cursor-not-allowed"
              />
            </div>
          </div>

          {/* Cédula (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cédula
              <span className="ml-2 text-xs text-slate-400">(no editable)</span>
            </label>
            <div className="relative">
              <CreditCard
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={perfil.cedula}
                disabled
                className="w-full pl-10 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="0999999999"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                maxLength={200}
                placeholder="Av. Principal 123"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">
              Cambiar contraseña
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Deja en blanco si no quieres cambiarla
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de éxito */}
          {exito && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">
                Perfil actualizado correctamente
              </span>
            </div>
          )}

          {/* Errores */}
          {errores.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <ul className="text-sm space-y-1">
                  {errores.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Botón guardar */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              {enviando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}