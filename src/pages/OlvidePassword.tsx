import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { solicitarResetPassword } from '../api/usuarios';

export default function OlvidePassword() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await solicitarResetPassword(correo);
      setEnviado(true);
    } catch {
      setError('Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={16} />
            Volver al login
          </Link>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Ingresa tu correo y te enviaremos un enlace para restablecerla
          </p>
        </div>

        {enviado ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
            <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-3" />
            <p className="font-medium text-emerald-800 mb-2">Correo enviado</p>
            <p className="text-sm text-emerald-700">
              Si el correo <strong>{correo}</strong> está registrado, recibirás un
              enlace en los próximos minutos. Revisa también tu carpeta de spam.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Volver al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-md transition"
            >
              <Send size={16} />
              {enviando ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}