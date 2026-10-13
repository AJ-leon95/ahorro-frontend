import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { validarTokenReset, resetPassword } from '../api/usuarios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validar = async () => {
      if (!token) {
        setValidando(false);
        setTokenValido(false);
        setErrorValidacion('No se proporcionó un token válido');
        return;
      }
      try {
        const data = await validarTokenReset(token);
        setTokenValido(data.valido);
        if (data.nombre) setNombreUsuario(data.nombre);
      } catch (err: any) {
        setTokenValido(false);
        setErrorValidacion(
          err.response?.data?.mensaje || 'El token es inválido o expiró'
        );
      } finally {
        setValidando(false);
      }
    };
    validar();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      await resetPassword(token!, nuevaPassword);
      setExito(true);
    } catch (err: any) {
      setError(err.response?.data || 'Error al cambiar la contraseña');
    } finally {
      setEnviando(false);
    }
  };

  // Cargando
  if (validando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center text-slate-500">
          Validando enlace...
        </div>
      </div>
    );
  }

  // Token inválido
  if (!tokenValido) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle size={28} className="text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Enlace inválido
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {errorValidacion || 'El enlace es inválido o ya expiró.'}
          </p>
          <button
            onClick={() => navigate('/olvide-password')}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition"
          >
            Solicitar un nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  // Éxito
  if (exito) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            ¡Contraseña actualizada!
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión
            con tu nueva contraseña.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // Formulario
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Nueva contraseña
          </h1>
          {nombreUsuario && (
            <p className="text-slate-500 text-sm mt-2">
              Hola, <strong>{nombreUsuario}</strong>. Elige tu nueva contraseña.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
              placeholder="Repite la contraseña"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-md transition"
          >
            {enviando ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}