import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Banknote,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { obtenerMiCuenta } from '../../api/cuentas';
import { listarMisDepositos } from '../../api/depositos';
import { listarMisTransacciones } from '../../api/transacciones';
import type { Cuenta } from '../../types/cuenta';
import type { Deposito } from '../../types/deposito';
import type { Transaccion } from '../../types/transaccion';

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

export default function SocioDashboard() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);

  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const [cuentaData, depositosData, transaccionesData] = await Promise.all([
          obtenerMiCuenta(),
          listarMisDepositos(),
          listarMisTransacciones(),
        ]);
        setCuenta(cuentaData);
        setDepositos(depositosData);
        setTransacciones(transaccionesData);
      } catch {
        setError('No se pudo cargar tu dashboard');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tu información...
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

  // KPIs del socio
  const pendientes = depositos.filter((d) => d.estadoDeposito === 'PENDIENTE');
  const confirmados = depositos.filter((d) => d.estadoDeposito === 'CONFIRMADO');
  const totalDepositado = confirmados.reduce((acc, d) => acc + Number(d.monto), 0);

  // Últimos 5 depósitos
  const ultimosDepositos = [...depositos]
    .sort((a, b) => new Date(b.fechaDeposito).getTime() - new Date(a.fechaDeposito).getTime())
    .slice(0, 5);

  // Últimos 5 movimientos
  const ultimosMovimientos = [...transacciones]
    .sort((a, b) => new Date(b.fechaTransaccion).getTime() - new Date(a.fechaTransaccion).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hola, {usuario?.nombre}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Este es el resumen de tu cuenta en la junta
        </p>
      </div>

      {/* Tarjeta de saldo grande */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Wallet size={24} className="opacity-90" />
          <p className="text-sm opacity-90 uppercase tracking-wider">
            Saldo disponible
          </p>
        </div>
        <p className="text-5xl font-bold">
          {formatoMoneda(Number(cuenta?.saldoCuenta || 0))}
        </p>
        <div className="flex gap-6 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-xs opacity-75 uppercase">Total depositado</p>
            <p className="text-lg font-semibold mt-1">
              {formatoMoneda(totalDepositado)}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-75 uppercase">Cuenta</p>
            <p className="text-lg font-semibold mt-1">
              #{cuenta?.id} · {cuenta?.tipoCuenta}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs pequeños */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={<Banknote size={22} />}
          label="Depósitos confirmados"
          valor={confirmados.length.toString()}
          detalle="Depósitos que ya suman a tu saldo"
          color="emerald"
        />
        <KPICard
          icon={<Clock size={22} />}
          label="Depósitos pendientes"
          valor={pendientes.length.toString()}
          detalle="Esperando confirmación del admin"
          color="amber"
        />
        <KPICard
          icon={<TrendingUp size={22} />}
          label="Movimientos totales"
          valor={transacciones.length.toString()}
          detalle="Ver historial completo"
          color="slate"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AccionRapida
            icon={<Plus size={18} />}
            label="Solicitar Depósito"
            onClick={() => navigate('/socio/solicitar-deposito')}
          />
          <AccionRapida
            icon={<Wallet size={18} />}
            label="Ver Mi Cuenta"
            onClick={() => navigate('/socio/mi-cuenta')}
          />
          <AccionRapida
            icon={<Banknote size={18} />}
            label="Mis Depósitos"
            onClick={() => navigate('/socio/mis-depositos')}
          />
        </div>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos depósitos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase">
              Últimos depósitos
            </h2>
            <button
              onClick={() => navigate('/socio/mis-depositos')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          {ultimosDepositos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aún no tienes depósitos
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ultimosDepositos.map((d) => (
                <div key={d.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      d.estadoDeposito === 'CONFIRMADO'
                        ? 'bg-emerald-100 text-emerald-600'
                        : d.estadoDeposito === 'PENDIENTE'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {d.estadoDeposito === 'CONFIRMADO' ? (
                      <CheckCircle2 size={16} />
                    ) : d.estadoDeposito === 'PENDIENTE' ? (
                      <Clock size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium">
                      {d.observaciones || 'Depósito'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(d.fechaDeposito).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {formatoMoneda(Number(d.monto))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos movimientos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase">
              Últimos movimientos
            </h2>
            <button
              onClick={() => navigate('/socio/mis-transacciones')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          {ultimosMovimientos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aún no hay movimientos
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ultimosMovimientos.map((t) => (
                <div key={t.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.tipoTransaccion === 'CONFIRMAR_DEPOSITO' ||
                      t.tipoTransaccion === 'SOLICITAR_DEPOSITO'
                        ? 'bg-emerald-100 text-emerald-600'
                        : t.tipoTransaccion === 'PAGO_CUOTA'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.tipoTransaccion === 'PAGO_CUOTA' ? (
                      <TrendingDown size={16} />
                    ) : (
                      <TrendingUp size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium truncate">
                      {t.descripcion}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(t.fechaTransaccion).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  {t.monto && (
                    <span className="text-sm font-bold text-slate-800">
                      {formatoMoneda(Number(t.monto))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
  detalle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
  detalle: string;
  color: 'emerald' | 'amber' | 'slate';
}) {
  const colores = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 border border-slate-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colores[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{valor}</p>
      <p className="text-xs text-slate-400 mt-1">{detalle}</p>
    </div>
  );
}

function AccionRapida({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
    >
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-600 group-hover:text-emerald-600 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}

// Icono que faltaba
function XCircle({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}