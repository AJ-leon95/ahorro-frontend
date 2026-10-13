import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogIn,
  UserPlus,
  Wallet,
  Banknote,
  CreditCard,
  Calendar,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { listarTransacciones } from '../../api/transacciones';
import type { Transaccion, TipoTransaccion } from '../../types/transaccion';

const POR_PAGINA = 20;

function formatoMoneda(valor: number | null): string {
  if (valor === null || valor === undefined) return '—';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

// Colores por tipo de transacción
function getColorTipo(tipo: TipoTransaccion): string {
  if (tipo === 'LOGIN') return 'bg-slate-100 text-slate-700';
  if (tipo.startsWith('CREAR_USUARIO') || tipo.startsWith('ACTUALIZAR_USUARIO'))
    return 'bg-blue-100 text-blue-700';
  if (tipo.startsWith('CREAR_CUENTA')) return 'bg-purple-100 text-purple-700';
  if (tipo.includes('DEPOSITO')) return 'bg-emerald-100 text-emerald-700';
  if (tipo.includes('CREDITO')) return 'bg-amber-100 text-amber-700';
  if (tipo === 'PAGO_CUOTA') return 'bg-teal-100 text-teal-700';
  if (tipo === 'MORA') return 'bg-red-100 text-red-700';
  if (tipo === 'ACTUALIZAR_SALDO') return 'bg-indigo-100 text-indigo-700';
  return 'bg-slate-100 text-slate-700';
}

// Ícono por tipo
function getIconoTipo(tipo: TipoTransaccion) {
  if (tipo === 'LOGIN') return <LogIn size={14} />;
  if (tipo.includes('USUARIO')) return <UserPlus size={14} />;
  if (tipo.includes('CUENTA')) return <Wallet size={14} />;
  if (tipo.includes('DEPOSITO')) return <Banknote size={14} />;
  if (tipo.includes('CREDITO')) return <CreditCard size={14} />;
  if (tipo === 'PAGO_CUOTA') return <Calendar size={14} />;
  if (tipo === 'MORA') return <AlertTriangle size={14} />;
  if (tipo === 'ACTUALIZAR_SALDO') return <TrendingUp size={14} />;
  return <Activity size={14} />;
}

export default function Transacciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoTransaccion | 'TODOS'>('TODOS');
  const [pagina, setPagina] = useState(1);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarTransacciones();
      setTransacciones(data);
    } catch {
      setError('Error al cargar transacciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Filtros
  const transaccionesFiltradas = useMemo(() => {
    let lista = transacciones;

    if (filtroTipo !== 'TODOS') {
      lista = lista.filter((t) => t.tipoTransaccion === filtroTipo);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (t) =>
          t.descripcion.toLowerCase().includes(q) ||
          t.usuario?.nombre.toLowerCase().includes(q) ||
          t.usuario?.correo.toLowerCase().includes(q)
      );
    }

    // Ordenar por fecha descendente
    return [...lista].sort(
      (a, b) =>
        new Date(b.fechaTransaccion).getTime() -
        new Date(a.fechaTransaccion).getTime()
    );
  }, [transacciones, busqueda, filtroTipo]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(transaccionesFiltradas.length / POR_PAGINA)
  );
  const inicio = (pagina - 1) * POR_PAGINA;
  const transaccionesPagina = transaccionesFiltradas.slice(
    inicio,
    inicio + POR_PAGINA
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroTipo]);

  // Tipos únicos para el filtro
  const tiposUnicos = useMemo(() => {
    const set = new Set(transacciones.map((t) => t.tipoTransaccion));
    return Array.from(set).sort();
  }, [transacciones]);

  // KPIs
  const totalTransacciones = transacciones.length;
  const ultimas24h = transacciones.filter((t) => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    return new Date(t.fechaTransaccion) >= ayer;
  }).length;
  const montoTotal = transacciones.reduce(
    (acc, t) => acc + Number(t.monto || 0),
    0
  );

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transacciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Auditoría completa del sistema
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          icon={<Activity size={20} />}
          label="Total transacciones"
          valor={totalTransacciones.toString()}
          color="slate"
        />
        <KPICard
          icon={<TrendingUp size={20} />}
          label="Últimas 24h"
          valor={ultimas24h.toString()}
          color="emerald"
        />
        <KPICard
          icon={<Banknote size={20} />}
          label="Monto acumulado"
          valor={formatoMoneda(montoTotal)}
          color="blue"
        />
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando transacciones...
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
              <FiltroBtn
                activo={filtroTipo === 'TODOS'}
                onClick={() => setFiltroTipo('TODOS')}
              >
                Todos ({transacciones.length})
              </FiltroBtn>
              {tiposUnicos.slice(0, 6).map((tipo) => (
                <FiltroBtn
                  key={tipo}
                  activo={filtroTipo === tipo}
                  onClick={() => setFiltroTipo(tipo)}
                >
                  {tipo}
                </FiltroBtn>
              ))}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaccionesPagina.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      {busqueda || filtroTipo !== 'TODOS'
                        ? 'No se encontraron transacciones'
                        : 'No hay transacciones registradas'}
                    </td>
                  </tr>
                )}
                {transaccionesPagina.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <p className="text-sm text-slate-700">
                        {new Date(t.fechaTransaccion).toLocaleDateString('es-EC')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(t.fechaTransaccion).toLocaleTimeString('es-EC', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700 font-medium">
                        {t.usuario?.nombre || '—'}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">
                        {t.usuario?.correo || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${getColorTipo(
                          t.tipoTransaccion
                        )}`}
                      >
                        {getIconoTipo(t.tipoTransaccion)}
                        {t.tipoTransaccion}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700 max-w-md truncate">
                        {t.descripcion}
                      </p>
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {formatoMoneda(t.monto)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {transaccionesFiltradas.length > POR_PAGINA && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>
                  {Math.min(inicio + POR_PAGINA, transaccionesFiltradas.length)}
                </strong>{' '}
                de <strong>{transaccionesFiltradas.length}</strong>
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
  color: 'slate' | 'emerald' | 'blue';
}) {
  const colores = {
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
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