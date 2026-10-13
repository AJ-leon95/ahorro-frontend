import { useEffect, useState, useMemo } from 'react';
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { listarMisDepositos } from '../../api/depositos';
import type { Deposito, EstadoDeposito } from '../../types/deposito';

const POR_PAGINA = 10;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

const COLORES_ESTADO: Record<EstadoDeposito, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  CONFIRMADO: 'bg-emerald-100 text-emerald-700',
  RECHAZADO: 'bg-red-100 text-red-700',
};

export default function MisDepositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<EstadoDeposito | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await listarMisDepositos();
        setDepositos(data);
      } catch {
        setError('No se pudieron cargar tus depósitos');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Filtros + búsqueda
  const depositosFiltrados = useMemo(() => {
    let lista = depositos;

    if (filtroEstado !== 'TODOS') {
      lista = lista.filter((d) => d.estadoDeposito === filtroEstado);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (d) =>
          d.observaciones?.toLowerCase().includes(q) ||
          d.archivo?.nombre.toLowerCase().includes(q) ||
          d.monto.toString().includes(q)
      );
    }

    // Ordenar por fecha descendente
    return [...lista].sort(
      (a, b) =>
        new Date(b.fechaDeposito).getTime() - new Date(a.fechaDeposito).getTime()
    );
  }, [depositos, busqueda, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(depositosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const depositosPagina = depositosFiltrados.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);

  // Contadores
  const pendientes = depositos.filter((d) => d.estadoDeposito === 'PENDIENTE');
  const confirmados = depositos.filter((d) => d.estadoDeposito === 'CONFIRMADO');
  const rechazados = depositos.filter((d) => d.estadoDeposito === 'RECHAZADO');
  const montoConfirmado = confirmados.reduce((acc, d) => acc + Number(d.monto), 0);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tus depósitos...
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mis Depósitos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Historial de tus depósitos en la junta
        </p>
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
          label="Confirmados"
          valor={confirmados.length.toString()}
          color="emerald"
        />
        <KPICard
          icon={<XCircle size={20} />}
          label="Rechazados"
          valor={rechazados.length.toString()}
          color="red"
        />
        <KPICard
          icon={<Banknote size={20} />}
          label="Total confirmado"
          valor={formatoMoneda(montoConfirmado)}
          color="slate"
        />
      </div>

      {/* Contenedor principal */}
      <div className="bg-white rounded-lg shadow">
        {/* Barra de herramientas */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex gap-2 flex-wrap">
            <FiltroBtn
              activo={filtroEstado === 'TODOS'}
              onClick={() => setFiltroEstado('TODOS')}
            >
              Todos ({depositos.length})
            </FiltroBtn>
            <FiltroBtn
              activo={filtroEstado === 'PENDIENTE'}
              onClick={() => setFiltroEstado('PENDIENTE')}
            >
              Pendientes ({pendientes.length})
            </FiltroBtn>
            <FiltroBtn
              activo={filtroEstado === 'CONFIRMADO'}
              onClick={() => setFiltroEstado('CONFIRMADO')}
            >
              Confirmados ({confirmados.length})
            </FiltroBtn>
            <FiltroBtn
              activo={filtroEstado === 'RECHAZADO'}
              onClick={() => setFiltroEstado('RECHAZADO')}
            >
              Rechazados ({rechazados.length})
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

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Comprobante
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Observaciones
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depositosPagina.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    {busqueda || filtroEstado !== 'TODOS'
                      ? 'No se encontraron depósitos con esos criterios'
                      : 'Aún no tienes depósitos registrados'}
                  </td>
                </tr>
              )}
              {depositosPagina.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">
                      {new Date(d.fechaDeposito).toLocaleDateString('es-EC')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(d.fechaDeposito).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-slate-800">
                      {formatoMoneda(Number(d.monto))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {d.archivo ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-xs truncate max-w-[150px]">
                          {d.archivo.nombre}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {d.observaciones || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                        COLORES_ESTADO[d.estadoDeposito]
                      }`}
                    >
                      {d.estadoDeposito}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {depositosFiltrados.length > POR_PAGINA && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando <strong>{inicio + 1}</strong>–
              <strong>{Math.min(inicio + POR_PAGINA, depositosFiltrados.length)}</strong>{' '}
              de <strong>{depositosFiltrados.length}</strong>
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
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colores[color]}`}
        >
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