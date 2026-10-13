import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  AlertCircle,
  Clock,
  FileText,
  XCircle,
} from 'lucide-react';
import { crearPeticion, listarMisPeticiones } from '../../api/peticiones';
import type { Peticion } from '../../types/peticion';

// ✅ Tasa de interés FIJA de la junta (11% mensual)
const INTERES_FIJO = 11;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function calcularCuota(monto: number, interes: number, plazo: number): number {
  if (!monto || !interes || !plazo) return 0;
  const i = interes / 100;
  const n = plazo;
  return (monto * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
}

export default function SolicitarCredito() {
  const navigate = useNavigate();

  // Estado para verificar si puede solicitar
  const [verificando, setVerificando] = useState(true);
  const [peticionActiva, setPeticionActiva] = useState<Peticion | null>(null);

  // Estado del formulario
  const [monto, setMonto] = useState('');
  const [plazo, setPlazo] = useState('6');
  const [motivo, setMotivo] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  // ✅ Verificar si el socio ya tiene una petición activa
  useEffect(() => {
    const verificar = async () => {
      try {
        const peticiones = await listarMisPeticiones();
        const activa = peticiones.find(
          (p) => p.estado === 'PENDIENTE' || p.estado === 'APROBADA'
        );
        setPeticionActiva(activa || null);
      } catch {
        // Si falla, no bloqueamos, dejamos intentar
      } finally {
        setVerificando(false);
      }
    };
    verificar();
  }, []);

  const simulacion = useMemo(() => {
    const m = Number(monto);
    const n = Number(plazo);

    if (!m || m <= 0 || !n || n <= 0) {
      return null;
    }

    const cuota = calcularCuota(m, INTERES_FIJO, n);
    const total = cuota * n;
    const interesesTotales = total - m;

    return {
      monto: m,
      cuota,
      total,
      interesesTotales,
      porcentajeInteres: (interesesTotales / m) * 100,
    };
  }, [monto, plazo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    const erroresLocales: string[] = [];
    const m = Number(monto);
    const n = Number(plazo);

    if (!monto || isNaN(m) || m <= 0) {
      erroresLocales.push('Ingresa un monto válido');
    } else if (m < 100) {
      erroresLocales.push('El monto mínimo es $100');
    } else if (m > 10000) {
      erroresLocales.push('El monto máximo es $10,000');
    }

    if (!plazo || isNaN(n) || n <= 0) {
      erroresLocales.push('Ingresa un plazo válido');
    } else if (n > 24) {
      erroresLocales.push('El plazo máximo es 24 meses');
    }

    if (erroresLocales.length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setEnviando(true);
    try {
      await crearPeticion({
        monto: m,
        interes: INTERES_FIJO,
        plazo: n,
        motivo: motivo || undefined,
      });

      navigate('/socio/mis-peticiones');
    } catch (err: any) {
      const data = err.response?.data;
      if (Array.isArray(data)) setErrores(data);
      else if (typeof data === 'string') setErrores([data]);
      else setErrores(['Error al enviar la petición']);
    } finally {
      setEnviando(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (verificando) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
        Verificando tu situación...
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/socio/dashboard')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Volver"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Solicitar Crédito</h1>
          <p className="text-slate-500 text-sm mt-1">
            Simula tu crédito y envía la solicitud
          </p>
        </div>
      </div>

      {/* ============================================
          BLOQUEADO: el socio ya tiene una petición activa
          ============================================ */}
      {peticionActiva ? (
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              peticionActiva.estado === 'PENDIENTE'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {peticionActiva.estado === 'PENDIENTE' ? (
              <Clock size={28} />
            ) : (
              <FileText size={28} />
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {peticionActiva.estado === 'PENDIENTE'
              ? 'Tienes una petición pendiente'
              : 'Tienes un crédito aprobado en curso'}
          </h2>

          <p className="text-slate-600 mb-6">
            {peticionActiva.estado === 'PENDIENTE'
              ? 'Tu petición está siendo revisada por el administrador. Espera la respuesta antes de solicitar otro crédito.'
              : 'Debes terminar de pagar tu crédito actual antes de poder solicitar uno nuevo.'}
          </p>

          {/* Detalles de la petición activa */}
          <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Monto solicitado:</span>
              <span className="font-semibold text-slate-800">
                {formatoMoneda(Number(peticionActiva.monto))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Plazo:</span>
              <span className="font-semibold text-slate-800">
                {peticionActiva.plazo} meses
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Estado:</span>
              <span
                className={`font-semibold ${
                  peticionActiva.estado === 'PENDIENTE'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {peticionActiva.estado}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Fecha:</span>
              <span className="font-semibold text-slate-800">
                {new Date(peticionActiva.fechaPeticion).toLocaleDateString('es-EC')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/socio/mis-peticiones')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            Ver mis peticiones
          </button>
        </div>
      ) : (
        <>
          {/* ============================================
              NO BLOQUEADO: mostrar formulario
              ============================================ */}

          {/* Aviso general */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-4 flex items-start gap-3">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Antes de solicitar</p>
              <p className="text-blue-700 mt-1">
                La tasa de interés es <strong>{INTERES_FIJO}% mensual fija</strong> para
                todos los créditos. Solo elige el monto y el plazo. Si estás de acuerdo
                con la simulación, envía la solicitud. Un administrador la revisará.
              </p>
            </div>
          </div>

          {/* ✅ Nota de documentos requeridos (movida arriba, junto a los avisos) */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 mb-6">
            <p className="font-medium mb-2 flex items-center gap-2">
              <FileText size={16} />
              Documentos requeridos si tu crédito es aprobado
            </p>
            <p className="text-amber-800 mb-3">
              Deberás presentar los siguientes documentos{' '}
              <strong>físicamente en la oficina de la junta</strong> antes de
              recibir el desembolso del crédito:
            </p>
            <ul className="space-y-1 text-amber-800 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <li>• Acción personal en PDF</li>
              <li>• Copia de cédula</li>
              <li>• Papeleta de votación</li>
              <li>• Formulario de petición</li>
              <li>• Servicio básico</li>
              <li>• Rol de pagos</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FORMULARIO */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator size={18} className="text-emerald-600" />
                Simulador de Crédito
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Monto solicitado <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="100"
                      max="10000"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="500.00"
                      required
                      className="w-full pl-10 pr-3 py-3 text-lg font-semibold border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Entre $100 y $10,000
                  </p>
                </div>

                {/* Interés FIJO */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tasa de interés mensual
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    <Percent size={18} className="text-emerald-600" />
                    <span className="text-lg font-bold text-emerald-700">
                      {INTERES_FIJO}%
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      Tasa fija de la junta
                    </span>
                  </div>
                </div>

                {/* Plazo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Plazo en meses <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={plazo}
                      onChange={(e) => setPlazo(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Entre 1 y 24 meses
                  </p>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Motivo del crédito
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    placeholder="Ej: Compra de herramientas, negocio, emergencia médica..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Errores */}
                {errores.length > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      {errores.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón enviar */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={enviando || !simulacion}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg font-medium transition-colors"
                  >
                    <Send size={16} />
                    {enviando ? 'Enviando...' : 'Enviar Petición de Crédito'}
                  </button>
                </div>
              </form>
            </div>

            {/* PANEL DE SIMULACIÓN */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg shadow-lg p-6 text-white h-fit sticky top-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Resultado de la Simulación
              </h2>

              {!simulacion ? (
                <div className="text-center py-8">
                  <p className="text-emerald-100 text-sm">
                    Ingresa monto y plazo para ver el resultado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-xs opacity-90 uppercase tracking-wider">
                      Cuota mensual
                    </p>
                    <p className="text-4xl font-bold mt-1">
                      {formatoMoneda(simulacion.cuota)}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">Monto solicitado</span>
                      <span className="font-semibold">
                        {formatoMoneda(simulacion.monto)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">
                        Intereses totales ({INTERES_FIJO}% mensual)
                      </span>
                      <span className="font-semibold">
                        {formatoMoneda(simulacion.interesesTotales)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">
                        Costo del crédito ({simulacion.porcentajeInteres.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                      <span className="text-base font-semibold">Total a pagar</span>
                      <span className="text-2xl font-bold">
                        {formatoMoneda(simulacion.total)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 mt-4 text-xs space-y-2">
                    <p className="opacity-90">
                      <strong>Detalles:</strong>
                    </p>
                    <p className="opacity-75">
                      • {plazo} cuotas mensuales de {formatoMoneda(simulacion.cuota)}
                    </p>
                    <p className="opacity-75">
                      • Interés aplicado: {INTERES_FIJO}% mensual fijo
                    </p>
                    <p className="opacity-75">• Sistema de amortización: Francés</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}