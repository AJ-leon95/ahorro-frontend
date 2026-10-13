import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { listarMisPeticiones } from '../../api/peticiones';
import type { Peticion, EstadoPeticion } from '../../types/peticion';

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

function calcularCuota(monto: number, interes: number, plazo: number): number {
  const i = interes / 100;
  const n = plazo;
  return (monto * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
}

const COLORES_ESTADO: Record<EstadoPeticion, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  APROBADA: 'bg-emerald-100 text-emerald-700',
  RECHAZADA: 'bg-red-100 text-red-700',
};

export default function MisPeticiones() {
  const navigate = useNavigate();
  const [peticiones, setPeticiones] = useState<Peticion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarMisPeticiones();
      setPeticiones(data);
    } catch {
      setError('No se pudieron cargar tus peticiones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const tienePendiente = peticiones.some((p) => p.estado === 'PENDIENTE');

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tus peticiones...
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
          <h1 className="text-2xl font-bold text-slate-800">Mis Peticiones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tus solicitudes de crédito
          </p>
        </div>
        <button
          onClick={() => navigate('/socio/solicitar-credito')}
          disabled={tienePendiente}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg transition-colors"
          title={tienePendiente ? 'Ya tienes una petición pendiente' : ''}
        >
          <Plus size={16} />
          Nueva Petición
        </button>
      </div>

      {tienePendiente && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm">
          Tienes una petición <strong>pendiente</strong>. Espera la respuesta del
          administrador antes de crear otra.
        </div>
      )}

      {/* Lista de peticiones */}
      {peticiones.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Aún no tienes peticiones</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">
            Solicita tu primer crédito y aparecerá aquí
          </p>
          <button
            onClick={() => navigate('/socio/solicitar-credito')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Solicitar Crédito
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {peticiones
            .sort(
              (a, b) =>
                new Date(b.fechaPeticion).getTime() -
                new Date(a.fechaPeticion).getTime()
            )
            .map((p) => {
              const cuota = calcularCuota(Number(p.monto), Number(p.interes), p.plazo);
              const total = cuota * p.plazo;
              const interesesTotales = total - Number(p.monto);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
                >
                  <div className="p-6">
                    {/* Cabecera de la card */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Petición #{p.id} ·{' '}
                          {new Date(p.fechaPeticion).toLocaleDateString('es-EC', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {formatoMoneda(Number(p.monto))}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          COLORES_ESTADO[p.estado]
                        }`}
                      >
                        {p.estado}
                      </span>
                    </div>

                    {/* Datos del crédito */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Interés
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">
                          {p.interes}% mensual
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Plazo
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">
                          {p.plazo} meses
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Cuota mensual
                        </p>
                        <p className="font-semibold text-emerald-600 mt-1">
                          {formatoMoneda(cuota)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Total a pagar
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">
                          {formatoMoneda(total)}
                        </p>
                      </div>
                    </div>

                    {/* Motivo */}
                    {p.motivo && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Motivo
                        </p>
                        <p className="text-sm text-slate-700">{p.motivo}</p>
                      </div>
                    )}

                    {/* Info de respuesta */}
                    {p.fechaRespuesta && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          {p.estado === 'APROBADA' ? '✅' : '❌'} Respuesta el{' '}
                          {new Date(p.fechaRespuesta).toLocaleDateString('es-EC')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Estado visual según tipo */}
                  {p.estado === 'PENDIENTE' && (
                    <div className="bg-amber-50 px-6 py-3 flex items-center gap-2 text-sm text-amber-800">
                      <Clock size={16} />
                      Esperando revisión del administrador
                    </div>
                  )}
                  {p.estado === 'APROBADA' && (
                    <div className="bg-emerald-50 px-6 py-3 flex items-center gap-2 text-sm text-emerald-800">
                      <CheckCircle2 size={16} />
                      Aprobada. El administrador generará tu crédito pronto.
                    </div>
                  )}
                  {p.estado === 'RECHAZADA' && (
                    <div className="bg-red-50 px-6 py-3 flex items-center gap-2 text-sm text-red-800">
                      <XCircle size={16} />
                      Rechazada. Contacta al administrador para más información.
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}