import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Landmark,
  AlertTriangle,
  ArrowRight,
  Plus,
  Banknote,
  CreditCard,
  Coins,
  Calendar,
} from 'lucide-react';
import { obtenerKPIsDashboard } from '../../api/dashboard';
import { useAuthStore } from '../../store/authStore';
import type { DashboardKPIs } from '../../types/dashboard';

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerKPIsDashboard();
        setKpis(data);
      } catch {
        setError('No se pudo cargar el dashboard');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando dashboard...
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Error al cargar los datos'}
      </div>
    );
  }

  // Cálculo de porcentajes para el gráfico
  const totalParaGrafico =
    Number(kpis.totalSocios) +
    Number(kpis.cuentaGastos) +
    Number(kpis.cuentaIntereses) +
    Number(kpis.cuentaMoras);

  const porcentaje = (valor: number) =>
    totalParaGrafico > 0 ? (valor / totalParaGrafico) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {usuario?.nombre}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Resumen general del sistema ·{' '}
          {new Date().toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* KPIs FINANCIEROS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<PiggyBank size={22} />}
          label="Fondo total de la junta"
          valor={formatoMoneda(Number(kpis.fondoTotal))}
          detalle="Suma de todas las cuentas"
          color="slate"
        />
        <KPICard
          icon={<TrendingUp size={22} />}
          label="Capital prestado"
          valor={formatoMoneda(Number(kpis.capitalPrestado))}
          detalle={`En ${kpis.creditosActivos} créditos activos`}
          color="amber"
        />
        <KPICard
          icon={<Landmark size={22} />}
          label="Capital disponible"
          valor={formatoMoneda(Number(kpis.capitalDisponible))}
          detalle="Disponible para prestar"
          color="emerald"
        />
        <KPICard
          icon={<Users size={22} />}
          label="Socios activos"
          valor={kpis.sociosActivos.toString()}
          detalle="Con cuenta activa"
          color="blue"
        />
      </div>

      {/* DESGLOSE POR CUENTA */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Desglose del fondo de la junta
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CuentaCard
            color="emerald"
            label="Ahorros de socios"
            valor={Number(kpis.totalSocios)}
            porcentaje={porcentaje(Number(kpis.totalSocios))}
          />
          <CuentaCard
            color="slate"
            label="Fondo común (GASTOS)"
            valor={Number(kpis.cuentaGastos)}
            porcentaje={porcentaje(Number(kpis.cuentaGastos))}
          />
          <CuentaCard
            color="blue"
            label="Intereses acumulados"
            valor={Number(kpis.cuentaIntereses)}
            porcentaje={porcentaje(Number(kpis.cuentaIntereses))}
          />
          <CuentaCard
            color="red"
            label="Moras acumuladas"
            valor={Number(kpis.cuentaMoras)}
            porcentaje={porcentaje(Number(kpis.cuentaMoras))}
          />
        </div>

        {/* Barra visual de distribución */}
        <div className="mt-6">
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            <div
              className="bg-emerald-500"
              style={{ width: `${porcentaje(Number(kpis.totalSocios))}%` }}
              title="Ahorros de socios"
            />
            <div
              className="bg-slate-700"
              style={{ width: `${porcentaje(Number(kpis.cuentaGastos))}%` }}
              title="Fondo común"
            />
            <div
              className="bg-blue-500"
              style={{ width: `${porcentaje(Number(kpis.cuentaIntereses))}%` }}
              title="Intereses"
            />
            <div
              className="bg-red-500"
              style={{ width: `${porcentaje(Number(kpis.cuentaMoras))}%` }}
              title="Moras"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Distribución del fondo total</span>
            <span>{formatoMoneda(totalParaGrafico)}</span>
          </div>
        </div>
      </div>

      {/* SEGUNDA FILA DE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<CreditCard size={22} />}
          label="Créditos activos"
          valor={kpis.creditosActivos.toString()}
          detalle={`${formatoMoneda(Number(kpis.capitalPrestado))} por cobrar`}
          color="blue"
        />
        <KPICard
          icon={<CheckCircle2 size={22} />}
          label="Créditos pagados"
          valor={kpis.creditosPagados.toString()}
          detalle="Histórico"
          color="emerald"
        />
        <KPICard
          icon={<AlertTriangle size={22} />}
          label="Cuotas vencidas"
          valor={kpis.cuotasVencidas.toString()}
          detalle="Requieren atención"
          color="red"
        />
        <KPICard
          icon={<Clock size={22} />}
          label="Cuotas pendientes"
          valor={kpis.cuotasPendientes.toString()}
          detalle={`${kpis.cuotasPagadas} pagadas en total`}
          color="amber"
        />
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AccionRapida
            icon={<Plus size={18} />}
            label="Crear Socio"
            onClick={() => navigate('/admin/usuarios')}
          />
          <AccionRapida
            icon={<Banknote size={18} />}
            label="Ver Depósitos"
            onClick={() => navigate('/admin/depositos')}
          />
          <AccionRapida
            icon={<CreditCard size={18} />}
            label="Ver Créditos"
            onClick={() => navigate('/admin/creditos')}
          />
          <AccionRapida
            icon={<Coins size={18} />}
            label="Ver Cuotas"
            onClick={() => navigate('/admin/cuotas')}
          />
        </div>
      </div>

      {/* ALERTA DE CAPITAL BAJO */}
      {Number(kpis.capitalDisponible) < 500 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">
              Capital disponible bajo
            </p>
            <p className="text-amber-700 text-sm mt-1">
              Actualmente hay {formatoMoneda(Number(kpis.capitalDisponible))}{' '}
              disponibles para prestar. Considera aumentar el fondo antes de
              aprobar nuevas solicitudes de crédito.
            </p>
          </div>
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
  detalle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
  detalle: string;
  color: 'emerald' | 'blue' | 'amber' | 'slate' | 'red';
}) {
  const colores = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-50 text-red-600',
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

function CuentaCard({
  color,
  label,
  valor,
  porcentaje,
}: {
  color: 'emerald' | 'slate' | 'blue' | 'red';
  label: string;
  valor: number;
  porcentaje: number;
}) {
  const colores = {
    emerald: 'text-emerald-600',
    slate: 'text-slate-700',
    blue: 'text-blue-600',
    red: 'text-red-600',
  };

  return (
    <div className="border border-slate-100 rounded-lg p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${colores[color]}`}>
        {formatoMoneda(valor)}
      </p>
      <p className="text-xs text-slate-400 mt-1">{porcentaje.toFixed(1)}% del fondo</p>
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