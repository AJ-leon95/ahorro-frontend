import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  listarPeticiones,
  aprobarPeticion,
  rechazarPeticion,
  eliminarPeticion,
} from '../../api/peticiones';
import type { Peticion, EstadoPeticion } from '../../types/peticion';

const POR_PAGINA = 10;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

const COLORES_ESTADO: Record<EstadoPeticion, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  APROBADA: 'bg-emerald-100 text-emerald-700',
  RECHAZADA: 'bg-red-100 text-red-700',
};

// Calcular cuota mensual (sistema francés)
function calcularCuota(monto: number, interes: number, plazo: number): number {
  const i = interes / 100;
  const n = plazo;
  return (monto * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
}

export default function Peticiones() {
  const [peticiones, setPeticiones] = useState<Peticion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPeticion | 'TODOS'>('TODOS');
  const [pagina, setPagina] = useState(1);

  const [peticionAprobando, setPeticionAprobando] = useState<Peticion | null>(null);
  const [peticionRechazando, setPeticionRechazando] = useState<Peticion | null>(null);
  const [peticionEliminando, setPeticionEliminando] = useState<Peticion | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarPeticiones();
      setPeticiones(data);
    } catch {
      setError('Error al cargar peticiones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const peticionesFiltradas = useMemo(() => {
    let lista = peticiones;

    if (filtroEstado !== 'TODOS') {
      lista = lista.filter((p) => p.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          p.usuario?.nombre.toLowerCase().includes(q) ||
          p.usuario?.correo.toLowerCase().includes(q) ||
          p.usuario?.cedula.includes(q) ||
          p.motivo?.toLowerCase().includes(q)
      );
    }

    // Ordenar por fecha desc
    return [...lista].sort(
      (a, b) => new Date(b.fechaPeticion).getTime() - new Date(a.fechaPeticion).getTime()
    );
  }, [peticiones, busqueda, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(peticionesFiltradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const peticionesPagina = peticionesFiltradas.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);

  // Contadores
  const pendientes = peticiones.filter((p) => p.estado === 'PENDIENTE');
  const aprobadas = peticiones.filter((p) => p.estado === 'APROBADA');
  const rechazadas = peticiones.filter((p) => p.estado === 'RECHAZADA');
  const montoAprobado = aprobadas.reduce((acc, p) => acc + Number(p.monto), 0);

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Peticiones de Crédito</h1>
          <p className="text-slate-500 text-sm mt-1">
            Solicitudes de crédito de los socios
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={<Clock size={20} />}
          label="Pendientes"
          valor={pendientes.length.toString()}
          color="amber"
        />
        <KPICard
          icon={<CheckCircle2 size={20} />}
          label="Aprobadas"
          valor={aprobadas.length.toString()}
          color="emerald"
        />
        <KPICard
          icon={<XCircle size={20} />}
          label="Rechazadas"
          valor={rechazadas.length.toString()}
          color="red"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Monto aprobado"
          valor={formatoMoneda(montoAprobado)}
          color="slate"
        />
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando peticiones...
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="bg-white rounded-lg shadow">
          {/* Barra de herramientas */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              <FiltroBtn
                activo={filtroEstado === 'TODOS'}
                onClick={() => setFiltroEstado('TODOS')}
              >
                Todas ({peticiones.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'PENDIENTE'}
                onClick={() => setFiltroEstado('PENDIENTE')}
              >
                Pendientes ({pendientes.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'APROBADA'}
                onClick={() => setFiltroEstado('APROBADA')}
              >
                Aprobadas ({aprobadas.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'RECHAZADA'}
                onClick={() => setFiltroEstado('RECHAZADA')}
              >
                Rechazadas ({rechazadas.length})
              </FiltroBtn>
            </div>

            <div className="relative w-full md:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar socio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Interés
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Plazo
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cuota est.
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {peticionesPagina.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      {busqueda || filtroEstado !== 'TODOS'
                        ? 'No se encontraron peticiones con esos criterios'
                        : 'No hay peticiones registradas'}
                    </td>
                  </tr>
                )}
                {peticionesPagina.map((p) => {
                  const cuota = calcularCuota(
                    Number(p.monto),
                    Number(p.interes),
                    p.plazo
                  );
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {new Date(p.fechaPeticion).toLocaleDateString('es-EC')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(p.fechaPeticion).toLocaleTimeString('es-EC', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm flex-shrink-0">
                            {p.usuario?.nombre.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {p.usuario?.nombre}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {p.usuario?.correo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-slate-800">
                          {formatoMoneda(Number(p.monto))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-700">{p.interes}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-700">{p.plazo} meses</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-700">
                          {formatoMoneda(cuota)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                            COLORES_ESTADO[p.estado]
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          {p.estado === 'PENDIENTE' && (
                            <>
                              <button
                                onClick={() => setPeticionAprobando(p)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Aprobar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setPeticionRechazando(p)}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {(p.estado === 'PENDIENTE' || p.estado === 'RECHAZADA') && (
                            <button
                              onClick={() => setPeticionEliminando(p)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {peticionesFiltradas.length > POR_PAGINA && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>{Math.min(inicio + POR_PAGINA, peticionesFiltradas.length)}</strong>{' '}
                de <strong>{peticionesFiltradas.length}</strong>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-600 px-2">
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {peticionAprobando && (
        <ModalAprobar
          peticion={peticionAprobando}
          onClose={() => setPeticionAprobando(null)}
          onAprobada={() => {
            setPeticionAprobando(null);
            cargar();
          }}
        />
      )}

      {peticionRechazando && (
        <ModalRechazar
          peticion={peticionRechazando}
          onClose={() => setPeticionRechazando(null)}
          onRechazada={() => {
            setPeticionRechazando(null);
            cargar();
          }}
        />
      )}

      {peticionEliminando && (
        <ModalEliminar
          peticion={peticionEliminando}
          onClose={() => setPeticionEliminando(null)}
          onEliminada={() => {
            setPeticionEliminando(null);
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
  color: 'amber' | 'emerald' | 'red' | 'slate';
}) {
  const colores = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
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
        activo ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function ErroresBloque({ errores }: { errores: string[] }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
      <ul className="list-disc pl-4 space-y-1">
        {errores.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// Modal: Aprobar
// ============================================

function ModalAprobar({
  peticion,
  onClose,
  onAprobada,
}: {
  peticion: Peticion;
  onClose: () => void;
  onAprobada: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cuota = calcularCuota(Number(peticion.monto), Number(peticion.interes), peticion.plazo);
  const total = cuota * peticion.plazo;
  const interesesTotales = total - Number(peticion.monto);

  const handleAprobar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await aprobarPeticion(peticion.id);
      onAprobada();
    } catch (err: any) {
      setError(err.response?.data || 'Error al aprobar');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Aprobar Petición</h2>
        </div>

        <p className="text-slate-600 mb-4">
          ¿Aprobar la solicitud de <strong>{peticion.usuario?.nombre}</strong>?
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Monto:</span>
            <span className="font-semibold">{formatoMoneda(Number(peticion.monto))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Interés:</span>
            <span className="font-semibold">{peticion.interes}% mensual</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Plazo:</span>
            <span className="font-semibold">{peticion.plazo} meses</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
            <span className="text-slate-500">Cuota mensual:</span>
            <span className="font-semibold text-emerald-600">{formatoMoneda(cuota)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total a pagar:</span>
            <span className="font-semibold">{formatoMoneda(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Intereses totales:</span>
            <span className="font-semibold">{formatoMoneda(interesesTotales)}</span>
          </div>
        </div>

        {error && <ErroresBloque errores={[error]} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleAprobar}
            disabled={procesando}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg"
          >
            {procesando ? 'Aprobando...' : 'Aprobar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Modal: Rechazar
// ============================================

function ModalRechazar({
  peticion,
  onClose,
  onRechazada,
}: {
  peticion: Peticion;
  onClose: () => void;
  onRechazada: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRechazar = async () => {
    if (!motivo.trim()) {
      setError('Debes indicar un motivo del rechazo');
      return;
    }
    setProcesando(true);
    setError(null);
    try {
      await rechazarPeticion(peticion.id, motivo);
      onRechazada();
    } catch (err: any) {
      setError(err.response?.data || 'Error al rechazar');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <XCircle size={20} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Rechazar Petición</h2>
        </div>

        <p className="text-slate-600 mb-4">
          Rechazando la solicitud de <strong>{peticion.usuario?.nombre}</strong> por{' '}
          <strong>{formatoMoneda(Number(peticion.monto))}</strong>.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ej: Documentación incompleta, capacidad de pago insuficiente..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <ErroresBloque errores={[error]} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleRechazar}
            disabled={procesando}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg"
          >
            {procesando ? 'Rechazando...' : 'Rechazar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Modal: Eliminar
// ============================================

function ModalEliminar({
  peticion,
  onClose,
  onEliminada,
}: {
  peticion: Peticion;
  onClose: () => void;
  onEliminada: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await eliminarPeticion(peticion.id);
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
        <h2 className="text-xl font-bold text-slate-800 mb-2">Eliminar Petición</h2>
        <p className="text-slate-600 mb-4">
          ¿Seguro que quieres eliminar la petición de{' '}
          <strong>{peticion.usuario?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>

        {error && <ErroresBloque errores={[error]} />}

        <div className="flex justify-end gap-2 pt-2">
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