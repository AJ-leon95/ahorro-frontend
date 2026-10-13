import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { listarMisCreditos } from '../../api/creditos';
import { listarCuotasPorCredito } from '../../api/cuotas';
import type { Credito, EstadoCredito } from '../../types/credito';
import type { Cuota, EstadoCuota } from '../../types/cuota';
import { imprimirTablaAmortizacion } from '../../utils/imprimirTablaAmortizacion';

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

const COLORES_CREDITO: Record<EstadoCredito, string> = {
  ACTIVO: 'bg-emerald-100 text-emerald-700',
  PAGADO: 'bg-blue-100 text-blue-700',
  VENCIDO: 'bg-red-100 text-red-700',
};

const COLORES_CUOTA: Record<EstadoCuota, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  PAGADA: 'bg-emerald-100 text-emerald-700',
  VENCIDA: 'bg-red-100 text-red-700',
};

export default function MisCreditos() {
  const navigate = useNavigate();

  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creditoExpandidoId, setCreditoExpandidoId] = useState<number | null>(null);
  const [cuotasActuales, setCuotasActuales] = useState<Cuota[]>([]);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await listarMisCreditos();
        setCreditos(data);
      } catch {
        setError('No se pudieron cargar tus créditos');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const toggleExpandir = async (creditoId: number) => {
    if (creditoExpandidoId === creditoId) {
      setCreditoExpandidoId(null);
      setCuotasActuales([]);
      return;
    }

    setCreditoExpandidoId(creditoId);
    setCuotasActuales([]);
    setCargandoCuotas(true);
    try {
      const cuotas = await listarCuotasPorCredito(creditoId);
      setCuotasActuales(cuotas);
    } catch {
      setCuotasActuales([]);
    } finally {
      setCargandoCuotas(false);
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Cargando tus créditos...
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
          <h1 className="text-2xl font-bold text-slate-800">Mis Créditos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tus créditos aprobados y su tabla de cuotas
          </p>
        </div>
        <button
          onClick={() => navigate('/socio/solicitar-credito')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          Solicitar Crédito
        </button>
      </div>

      {/* Estado vacío */}
      {creditos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No tienes créditos aún</p>
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
          {creditos.map((c) => {
            const expandido = creditoExpandidoId === c.id;
            const cuotasParaProgreso = expandido ? cuotasActuales : [];
            const pagadas = cuotasParaProgreso.filter((q) => q.estado === 'PAGADA').length;
            const progreso =
              cuotasParaProgreso.length > 0
                ? (pagadas / cuotasParaProgreso.length) * 100
                : 0;

            return (
              <div
                key={c.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
              >
                {/* Cabecera de la card */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Crédito #{c.id} · Desde{' '}
                        {new Date(c.fechaInicio).toLocaleDateString('es-EC', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatoMoneda(Number(c.monto))}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        COLORES_CREDITO[c.estado]
                      }`}
                    >
                      {c.estado}
                    </span>
                  </div>

                  {/* Datos del crédito */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Interés
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {c.interes}% mensual
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Plazo
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {c.plazo} meses
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Cuota mensual
                      </p>
                      <p className="font-semibold text-emerald-600 mt-1">
                        {formatoMoneda(Number(c.cuotaMensual))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Total a pagar
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {formatoMoneda(Number(c.montoTotal))}
                      </p>
                    </div>
                  </div>

                  {/* Progreso */}
                  {expandido && cuotasActuales.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Progreso de pago</span>
                        <span>
                          {pagadas} de {cuotasActuales.length} cuotas pagadas
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Botón expandir */}
                  <button
                    onClick={() => toggleExpandir(c.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
                  >
                    <span>
                      {expandido ? 'Ocultar cuotas' : `Ver cuotas (${c.plazo})`}
                    </span>
                    {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Tabla de cuotas */}
                {expandido && (
                  <div className="border-t border-slate-200 bg-slate-50">
                    {cargandoCuotas && (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        Cargando cuotas...
                      </div>
                    )}

                    {!cargandoCuotas && cuotasActuales.length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No hay cuotas registradas para este crédito.
                      </div>
                    )}

                    {!cargandoCuotas && cuotasActuales.length > 0 && (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                  #
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                  Vencimiento
                                </th>
                                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                  Capital
                                </th>
                                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                  Interés
                                </th>
                                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                  Cuota
                                </th>
                                <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {cuotasActuales.map((q) => (
                                <tr
                                  key={`cuota-${c.id}-${q.id}`}
                                  className="hover:bg-white"
                                >
                                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                    {q.numero}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">
                                    {new Date(q.fechaVencimiento).toLocaleDateString(
                                      'es-EC'
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right text-slate-600">
                                    {formatoMoneda(Number(q.montoCapital))}
                                  </td>
                                  <td className="px-4 py-3 text-right text-slate-600">
                                    {formatoMoneda(Number(q.montoInteres))}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                    {formatoMoneda(Number(q.monto))}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                        COLORES_CUOTA[q.estado]
                                      }`}
                                    >
                                      {q.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Botón Imprimir (FUERA de la tabla) */}
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                          <button
                            onClick={() => imprimirTablaAmortizacion(c, cuotasActuales)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Printer size={16} />
                            Imprimir Tabla
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Estado visual del crédito */}
                {c.estado === 'ACTIVO' && (
                  <div className="bg-amber-50 px-6 py-3 flex items-center gap-2 text-sm text-amber-800">
                    <Clock size={16} />
                    Crédito en curso. Acércate a la oficina en la fecha de cada
                    cuota para evitar moras.
                  </div>
                )}
                {c.estado === 'PAGADO' && (
                  <div className="bg-emerald-50 px-6 py-3 flex items-center gap-2 text-sm text-emerald-800">
                    <CheckCircle2 size={16} />
                    ¡Crédito pagado en su totalidad! Puedes solicitar uno nuevo.
                  </div>
                )}
                {c.estado === 'VENCIDO' && (
                  <div className="bg-red-50 px-6 py-3 flex items-center gap-2 text-sm text-red-800">
                    <AlertCircle size={16} />
                    Crédito vencido. Acércate a la oficina para regularizar tu
                    situación.
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