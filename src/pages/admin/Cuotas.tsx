import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Check,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import {
  listarCuotas,
  pagarCuota,
  calcularMoras,
} from '../../api/cuotas';
import type { Cuota, EstadoCuota } from '../../types/cuota';

const POR_PAGINA = 15;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

const COLORES_ESTADO: Record<EstadoCuota, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  PAGADA: 'bg-emerald-100 text-emerald-700',
  VENCIDA: 'bg-red-100 text-red-700',
};

type FiltroVencimiento = 'TODAS' | 'VENCIDAS' | 'PROXIMAS' | 'ESTE_MES';

export default function Cuotas() {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCuota | 'TODOS'>('TODOS');
  const [filtroVencimiento, setFiltroVencimiento] = useState<FiltroVencimiento>('TODAS');
  const [pagina, setPagina] = useState(1);

  const [procesandoMoras, setProcesandoMoras] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarCuotas();
      setCuotas(data);
    } catch {
      setError('Error al cargar cuotas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCalcularMoras = async () => {
    if (!confirm('¿Calcular moras de todas las cuotas vencidas?')) return;
    setProcesandoMoras(true);
    try {
      await calcularMoras();
      await cargar();
    } catch (err: any) {
      alert(err.response?.data || 'Error al calcular moras');
    } finally {
      setProcesandoMoras(false);
    }
  };

  // Filtrado
  const cuotasFiltradas = useMemo(() => {
    let lista = cuotas;

    // Filtro por estado
    if (filtroEstado !== 'TODOS') {
      lista = lista.filter((c) => c.estado === filtroEstado);
    }

    // Filtro por vencimiento
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en7dias = new Date(hoy);
    en7dias.setDate(en7dias.getDate() + 7);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);

    if (filtroVencimiento === 'VENCIDAS') {
      lista = lista.filter((c) => {
        const fecha = new Date(c.fechaVencimiento);
        return fecha < hoy && c.estado !== 'PAGADA';
      });
    } else if (filtroVencimiento === 'PROXIMAS') {
      lista = lista.filter((c) => {
        const fecha = new Date(c.fechaVencimiento);
        return fecha >= hoy && fecha <= en7dias && c.estado === 'PENDIENTE';
      });
    } else if (filtroVencimiento === 'ESTE_MES') {
      lista = lista.filter((c) => {
        const fecha = new Date(c.fechaVencimiento);
        return fecha >= hoy && fecha <= finMes;
      });
    }

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (c) =>
          c.credito?.usuario?.nombre.toLowerCase().includes(q) ||
          c.credito?.usuario?.correo.toLowerCase().includes(q) ||
          c.credito?.usuario?.cedula.includes(q)
      );
    }

    // Ordenar por fecha de vencimiento
    return [...lista].sort(
      (a, b) =>
        new Date(a.fechaVencimiento).getTime() -
        new Date(b.fechaVencimiento).getTime()
    );
  }, [cuotas, busqueda, filtroEstado, filtroVencimiento]);

  const totalPaginas = Math.max(1, Math.ceil(cuotasFiltradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const cuotasPagina = cuotasFiltradas.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado, filtroVencimiento]);

  // Contadores
  const pendientes = cuotas.filter((c) => c.estado === 'PENDIENTE');
  const pagadas = cuotas.filter((c) => c.estado === 'PAGADA');
  const vencidas = cuotas.filter((c) => c.estado === 'VENCIDA');
  const montoPorCobrar = pendientes
    .concat(vencidas)
    .reduce((acc, c) => acc + Number(c.monto), 0);

  // Fecha helpers
  const esVencida = (c: Cuota) => {
    if (c.estado === 'PAGADA') return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(c.fechaVencimiento) < hoy;
  };

  const diasRestantes = (c: Cuota) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const venc = new Date(c.fechaVencimiento);
    return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cuotas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Todas las cuotas de todos los créditos
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
            onClick={handleCalcularMoras}
            disabled={procesandoMoras}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg transition-colors"
            title="Calcular moras de cuotas vencidas"
          >
            <Calculator size={16} />
            {procesandoMoras ? 'Calculando...' : 'Calcular Moras'}
          </button>
        </div>
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
          icon={<AlertTriangle size={20} />}
          label="Vencidas"
          valor={vencidas.length.toString()}
          color="red"
        />
        <KPICard
          icon={<CheckCircle2 size={20} />}
          label="Pagadas"
          valor={pagadas.length.toString()}
          color="emerald"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Por cobrar"
          valor={formatoMoneda(montoPorCobrar)}
          color="slate"
        />
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando cuotas...
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
                Todas ({cuotas.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'PENDIENTE'}
                onClick={() => setFiltroEstado('PENDIENTE')}
              >
                Pendientes ({pendientes.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'VENCIDA'}
                onClick={() => setFiltroEstado('VENCIDA')}
              >
                Vencidas ({vencidas.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'PAGADA'}
                onClick={() => setFiltroEstado('PAGADA')}
              >
                Pagadas ({pagadas.length})
              </FiltroBtn>
            </div>

            <div className="relative w-full md:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por socio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Filtros de vencimiento */}
          <div className="px-6 py-3 border-b border-slate-100 flex gap-2 flex-wrap bg-slate-50">
            <span className="text-xs text-slate-500 py-1.5 pr-2">Vencimiento:</span>
            <FiltroBtn
              activo={filtroVencimiento === 'TODAS'}
              onClick={() => setFiltroVencimiento('TODAS')}
            >
              Todas
            </FiltroBtn>
            <FiltroBtn
              activo={filtroVencimiento === 'VENCIDAS'}
              onClick={() => setFiltroVencimiento('VENCIDAS')}
            >
              Vencidas
            </FiltroBtn>
            <FiltroBtn
              activo={filtroVencimiento === 'PROXIMAS'}
              onClick={() => setFiltroVencimiento('PROXIMAS')}
            >
              Próximas 7 días
            </FiltroBtn>
            <FiltroBtn
              activo={filtroVencimiento === 'ESTE_MES'}
              onClick={() => setFiltroVencimiento('ESTE_MES')}
            >
              Este mes
            </FiltroBtn>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Crédito
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cuota #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cuotasPagina.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {busqueda ||
                      filtroEstado !== 'TODOS' ||
                      filtroVencimiento !== 'TODAS'
                        ? 'No se encontraron cuotas con esos criterios'
                        : 'No hay cuotas registradas'}
                    </td>
                  </tr>
                )}
                {cuotasPagina.map((c) => {
                  const vencida = esVencida(c);
                  const dias = diasRestantes(c);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm flex-shrink-0">
                            {c.credito?.usuario?.nombre.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {c.credito?.usuario?.nombre}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {c.credito?.usuario?.cedula}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-600 font-mono">
                          #{c.credito?.id}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {c.numero}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">
                          {new Date(c.fechaVencimiento).toLocaleDateString('es-EC', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        {c.estado !== 'PAGADA' && (
                          <p
                            className={`text-xs mt-0.5 ${
                              vencida
                                ? 'text-red-600 font-medium'
                                : dias <= 7
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {vencida
                              ? `Venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`
                              : dias === 0
                              ? 'Vence hoy'
                              : `Faltan ${dias} día${dias !== 1 ? 's' : ''}`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-bold text-slate-800">
                          {formatoMoneda(Number(c.monto))}
                        </p>
                        {Number(c.mora) > 0 && (
                          <p className="text-xs text-red-600 font-medium">
                            + mora {formatoMoneda(Number(c.mora))}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                            COLORES_ESTADO[c.estado]
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {c.estado === 'PAGADA' ? (
                          <span className="text-xs text-slate-400">
                            {c.fechaPago
                              ? new Date(c.fechaPago).toLocaleDateString('es-EC')
                              : '—'}
                          </span>
                        ) : (
                          <PagarCuotaButton
                            cuota={c}
                            onPagada={() => cargar()}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {cuotasFiltradas.length > POR_PAGINA && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>{Math.min(inicio + POR_PAGINA, cuotasFiltradas.length)}</strong>{' '}
                de <strong>{cuotasFiltradas.length}</strong>
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
        activo
          ? 'bg-emerald-500 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function PagarCuotaButton({ cuota, onPagada }: { cuota: Cuota; onPagada: () => void }) {
  const [procesando, setProcesando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const handlePagar = async () => {
    setProcesando(true);
    try {
      await pagarCuota(cuota.id);
      onPagada();
    } catch (err: any) {
      alert(err.response?.data || 'Error al pagar la cuota');
    } finally {
      setProcesando(false);
      setConfirmando(false);
    }
  };

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
      >
        <Check size={12} />
        Pagar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={handlePagar}
        disabled={procesando}
        className="px-2 py-1 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded"
      >
        {procesando ? '...' : 'Sí'}
      </button>
      <button
        onClick={() => setConfirmando(false)}
        disabled={procesando}
        className="px-2 py-1 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
      >
        No
      </button>
    </div>
  );
}