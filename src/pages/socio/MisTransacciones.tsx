import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Activity,
  LogIn,
  Wallet,
  Banknote,
  CreditCard,
  Calendar,
  AlertTriangle,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { listarMisTransacciones } from '../../api/transacciones';
import type { Transaccion, TipoTransaccion } from '../../types/transaccion';

function formatoMoneda(valor: number | null): string {
  if (valor === null || valor === undefined) return '—';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

function getColorTipo(tipo: TipoTransaccion): string {
  if (tipo === 'LOGIN') return 'bg-slate-100 text-slate-700';
  if (tipo.includes('USUARIO')) return 'bg-blue-100 text-blue-700';
  if (tipo.includes('CUENTA')) return 'bg-purple-100 text-purple-700';
  if (tipo.includes('DEPOSITO')) return 'bg-emerald-100 text-emerald-700';
  if (tipo.includes('CREDITO')) return 'bg-amber-100 text-amber-700';
  if (tipo === 'PAGO_CUOTA') return 'bg-teal-100 text-teal-700';
  if (tipo === 'MORA') return 'bg-red-100 text-red-700';
  if (tipo === 'ACTUALIZAR_SALDO') return 'bg-indigo-100 text-indigo-700';
  return 'bg-slate-100 text-slate-700';
}

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

export default function MisTransacciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarMisTransacciones();
      setTransacciones(data);
    } catch {
      setError('No se pudieron cargar tus movimientos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const transaccionesFiltradas = useMemo(() => {
    let lista = transacciones;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter((t) => t.descripcion.toLowerCase().includes(q));
    }

    return [...lista].sort(
      (a, b) =>
        new Date(b.fechaTransaccion).getTime() -
        new Date(a.fechaTransaccion).getTime()
    );
  }, [transacciones, busqueda]);

  const totalMovimientos = transacciones.length;

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tus movimientos...
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
          <h1 className="text-2xl font-bold text-slate-800">Mis Movimientos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Historial completo de tus operaciones
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

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-700 border border-slate-100">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Total movimientos
              </p>
              <p className="text-xl font-bold text-slate-800">
                {totalMovimientos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow mb-4 px-6 py-4 border-b border-slate-200">
        <div className="relative w-full md:w-96">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar en descripciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Lista */}
      {transaccionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">
            {busqueda
              ? 'No se encontraron movimientos'
              : 'Aún no tienes movimientos'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-slate-100">
          {transaccionesFiltradas.map((t) => (
            <div key={t.id} className="px-6 py-4 hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                {/* Ícono */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColorTipo(
                    t.tipoTransaccion
                  )}`}
                >
                  {getIconoTipo(t.tipoTransaccion)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getColorTipo(
                        t.tipoTransaccion
                      )}`}
                    >
                      {t.tipoTransaccion}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(t.fechaTransaccion).toLocaleDateString('es-EC', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(t.fechaTransaccion).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 truncate">
                    {t.descripcion}
                  </p>
                </div>

                {/* Monto */}
                {t.monto !== null && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">
                      {formatoMoneda(t.monto)}
                    </p>
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