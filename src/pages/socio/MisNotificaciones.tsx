import { useEffect, useState } from 'react';
import {
  RefreshCw,
  Search,
  Bell,
  Mail,
  MailOpen,
  Check,
} from 'lucide-react';
import {
  listarMisNotificaciones,
  marcarMiNotificacionComoLeida,
} from '../../api/notificaciones';
import type { Notificacion } from '../../types/notificacion';

export default function MisNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'TODAS' | 'NO_LEIDAS'>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarMisNotificaciones();
      setNotificaciones(data);
    } catch {
      setError('No se pudieron cargar tus notificaciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleMarcarLeida = async (id: number) => {
    try {
      await marcarMiNotificacionComoLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch {
      alert('Error al marcar como leída');
    }
  };

  const filtradas = notificaciones
    .filter((n) => (filtro === 'NO_LEIDAS' ? !n.leida : true))
    .filter((n) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      return (
        n.asunto.toLowerCase().includes(q) ||
        n.mensaje.toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
    );

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tus notificaciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            {noLeidas > 0
              ? `Tienes ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer`
              : 'Todas tus notificaciones están leídas'}
          </p>
        </div>
        <button
          onClick={cargar}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Recargar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow mb-4 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex gap-2">
          <FiltroBtn
            activo={filtro === 'TODAS'}
            onClick={() => setFiltro('TODAS')}
          >
            Todas ({notificaciones.length})
          </FiltroBtn>
          <FiltroBtn
            activo={filtro === 'NO_LEIDAS'}
            onClick={() => setFiltro('NO_LEIDAS')}
          >
            No leídas ({noLeidas})
          </FiltroBtn>
        </div>

        <div className="relative w-full md:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">
            {busqueda || filtro === 'NO_LEIDAS'
              ? 'No se encontraron notificaciones'
              : 'No tienes notificaciones'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg shadow transition ${
                n.leida ? 'bg-white' : 'bg-amber-50 border-l-4 border-amber-400'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.leida
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {n.leida ? <MailOpen size={20} /> : <Mail size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-800 text-lg">
                        {n.asunto}
                      </h3>
                      {!n.leida && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                          Nueva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {new Date(n.fechaEnvio).toLocaleDateString('es-EC', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      a las{' '}
                      {new Date(n.fechaEnvio).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-slate-700 whitespace-pre-line">{n.mensaje}</p>
                  </div>
                </div>

                {!n.leida && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleMarcarLeida(n.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                      <Check size={14} />
                      Marcar como leída
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltroBtn({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        activo
          ? 'bg-emerald-500 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}