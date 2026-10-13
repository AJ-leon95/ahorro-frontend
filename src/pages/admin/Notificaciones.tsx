import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Plus,
  Send,
  Trash2,
  Mail,
  MailOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
} from 'lucide-react';
import {
  listarNotificaciones,
  crearNotificacion,
  enviarNotificacionMasiva,
  eliminarNotificacion,
} from '../../api/notificaciones';
import { listarSocios } from '../../api/usuarios';
import type { Notificacion } from '../../types/notificacion';
import type { Usuario } from '../../types/auth';

const POR_PAGINA = 15;

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [socios, setSocios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'TODAS' | 'NO_LEIDAS' | 'LEIDAS'>('TODAS');
  const [pagina, setPagina] = useState(1);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalMasiva, setModalMasiva] = useState(false);
  const [notificacionEliminando, setNotificacionEliminando] = useState<Notificacion | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [notifData, sociosData] = await Promise.all([
        listarNotificaciones(),
        listarSocios(),
      ]);
      setNotificaciones(notifData);
      setSocios(sociosData);
    } catch {
      setError('Error al cargar notificaciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    let lista = notificaciones;

    if (filtro === 'NO_LEIDAS') lista = lista.filter((n) => !n.leida);
    if (filtro === 'LEIDAS') lista = lista.filter((n) => n.leida);

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (n) =>
          n.asunto.toLowerCase().includes(q) ||
          n.mensaje.toLowerCase().includes(q) ||
          n.usuario?.nombre.toLowerCase().includes(q)
      );
    }

    return [...lista].sort(
      (a, b) =>
        new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
    );
  }, [notificaciones, busqueda, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaActual = filtradas.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtro]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const leidas = notificaciones.filter((n) => n.leida).length;

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Notificaciones internas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargar}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Recargar
          </button>
          <button
            onClick={() => setModalMasiva(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            <Users size={16} />
            Notificación Masiva
          </button>
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nueva Notificación
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          icon={<Bell size={20} />}
          label="Total notificaciones"
          valor={notificaciones.length.toString()}
          color="slate"
        />
        <KPICard
          icon={<Mail size={20} />}
          label="No leídas"
          valor={noLeidas.toString()}
          color="amber"
        />
        <KPICard
          icon={<MailOpen size={20} />}
          label="Leídas"
          valor={leidas.toString()}
          color="emerald"
        />
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando notificaciones...
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="bg-white rounded-lg shadow">
          {/* Filtros */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              <FiltroBtn activo={filtro === 'TODAS'} onClick={() => setFiltro('TODAS')}>
                Todas ({notificaciones.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtro === 'NO_LEIDAS'}
                onClick={() => setFiltro('NO_LEIDAS')}
              >
                No leídas ({noLeidas})
              </FiltroBtn>
              <FiltroBtn activo={filtro === 'LEIDAS'} onClick={() => setFiltro('LEIDAS')}>
                Leídas ({leidas})
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
          {paginaActual.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              {busqueda || filtro !== 'TODAS'
                ? 'No se encontraron notificaciones'
                : 'No hay notificaciones'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginaActual.map((n) => (
                <div
                  key={n.id}
                  className={`px-6 py-4 hover:bg-slate-50 transition ${
                    !n.leida ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.leida
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {n.leida ? <MailOpen size={18} /> : <Mail size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-slate-800">{n.asunto}</p>
                        {!n.leida && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            Nueva
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{n.mensaje}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Para: {n.usuario?.nombre}</span>
                        <span>·</span>
                        <span>
                          {new Date(n.fechaEnvio).toLocaleDateString('es-EC')}{' '}
                          {new Date(n.fechaEnvio).toLocaleTimeString('es-EC', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setNotificacionEliminando(n)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {filtradas.length > POR_PAGINA && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>{Math.min(inicio + POR_PAGINA, filtradas.length)}</strong>{' '}
                de <strong>{filtradas.length}</strong>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-600 px-2">
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {modalCrear && (
        <ModalCrear
          socios={socios}
          onClose={() => setModalCrear(false)}
          onCreado={() => {
            setModalCrear(false);
            cargar();
          }}
        />
      )}

      {modalMasiva && (
        <ModalMasiva
          onClose={() => setModalMasiva(false)}
          onEnviada={() => {
            setModalMasiva(false);
            cargar();
          }}
        />
      )}

      {notificacionEliminando && (
        <ModalEliminar
          notificacion={notificacionEliminando}
          onClose={() => setNotificacionEliminando(null)}
          onEliminada={() => {
            setNotificacionEliminando(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Componentes UI
// ============================================

function KPICard({
  icon,
  label,
  valor,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
  color: 'slate' | 'emerald' | 'amber';
}) {
  const colores = {
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colores[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-slate-800">{valor}</p>
        </div>
      </div>
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

// ============================================
// Modal: Crear notificación individual
// ============================================

function ModalCrear({
  socios,
  onClose,
  onCreado,
}: {
  socios: Usuario[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [usuarioId, setUsuarioId] = useState<number | ''>('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return;
    setEnviando(true);
    setError(null);
    try {
      await crearNotificacion(Number(usuarioId), asunto, mensaje);
      onCreado();
    } catch (err: any) {
      setError(err.response?.data || 'Error al crear');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Nueva Notificación</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Destinatario <span className="text-red-500">*</span>
            </label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Selecciona un socio —</option>
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {s.correo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              required
              maxLength={200}
              placeholder="Ej: Reunión mensual"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              rows={5}
              placeholder="Escribe el mensaje..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !usuarioId}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg"
            >
              <Send size={16} />
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal: Notificación masiva
// ============================================

function ModalMasiva({
  onClose,
  onEnviada,
}: {
  onClose: () => void;
  onEnviada: () => void;
}) {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('¿Enviar esta notificación a TODOS los socios activos?')) return;
    setEnviando(true);
    setError(null);
    try {
      await enviarNotificacionMasiva(asunto, mensaje);
      onEnviada();
    } catch (err: any) {
      setError(err.response?.data || 'Error al enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Notificación Masiva</h2>
            <p className="text-sm text-slate-500 mt-1">
              Se enviará a TODOS los socios activos
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              required
              maxLength={200}
              placeholder="Ej: Convocatoria a reunión"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              rows={6}
              placeholder="Escribe el mensaje que recibirán todos los socios..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>⚠️ Importante:</strong> Esta notificación se enviará por correo
            Y aparecerá en el panel de cada socio.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg"
            >
              <Users size={16} />
              {enviando ? 'Enviando...' : 'Enviar a Todos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal: Eliminar
// ============================================

function ModalEliminar({
  notificacion,
  onClose,
  onEliminada,
}: {
  notificacion: Notificacion;
  onClose: () => void;
  onEliminada: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await eliminarNotificacion(notificacion.id);
      onEliminada();
    } catch (err: any) {
      setError(err.response?.data || 'Error al eliminar');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Eliminar Notificación</h2>
        <p className="text-slate-600 mb-4">
          ¿Seguro que quieres eliminar la notificación <strong>{notificacion.asunto}</strong>?
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleEliminar}
            disabled={procesando}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg"
          >
            {procesando ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}