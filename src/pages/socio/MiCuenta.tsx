import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Calendar, User } from 'lucide-react';
import { obtenerMiCuenta  } from '../../api/cuentas';
import { useAuthStore } from '../../store/authStore';
import type { Cuenta } from '../../types/cuenta';

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

export default function MiCuenta() {
  const usuario = useAuthStore((state) => state.usuario);
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerMiCuenta();
        setCuenta(data);
      } catch {
        setError('No se pudo cargar tu cuenta');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [usuario]);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tu cuenta...
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

  if (!cuenta) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mi Cuenta</h1>
        <p className="text-slate-500 text-sm mt-1">
          Información de tu cuenta de ahorros
        </p>
      </div>

      {/* Tarjeta principal de saldo */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg p-8 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet size={22} className="opacity-90" />
          <p className="text-sm opacity-90 uppercase tracking-wider">
            Saldo disponible
          </p>
        </div>
        <p className="text-5xl font-bold mt-2">
          {formatoMoneda(Number(cuenta.saldoCuenta))}
        </p>
        <p className="text-sm opacity-75 mt-4">
          Cuenta de tipo <span className="font-semibold">{cuenta.tipoCuenta}</span>
        </p>
      </div>

      {/* Tarjetas de info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info del titular */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase">
              Titular
            </h2>
          </div>
          <p className="text-slate-800 font-semibold text-lg">
            {usuario?.nombre}
          </p>
          <p className="text-slate-500 text-sm mt-1">{usuario?.correo}</p>
          <p className="text-slate-500 text-sm mt-1">
            Cédula: <span className="font-mono">{usuario?.cedula}</span>
          </p>
        </div>

        {/* Info de la cuenta */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase">
              Detalles de la cuenta
            </h2>
          </div>
          <p className="text-slate-500 text-sm">
            Número de cuenta: <span className="font-mono text-slate-800">#{cuenta.id}</span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Abierta el:{' '}
            <span className="text-slate-800">
              {new Date(cuenta.fechaApertura).toLocaleDateString('es-EC', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Estado:{' '}
            <span className="text-emerald-600 font-medium">Activa</span>
          </p>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <TrendingUp size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Tu saldo solo cambia por operaciones</p>
          <p className="text-blue-700 mt-1">
            Los depósitos confirmados suman a tu saldo. Los pagos de cuotas y otros
            cargos restan. Consulta tus movimientos para ver el detalle.
          </p>
        </div>
      </div>
    </div>
  );
}