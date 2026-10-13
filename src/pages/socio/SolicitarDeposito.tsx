import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { crearMiDeposito } from '../../api/depositos';
import { subirArchivo } from '../../api/archivos';
import FileUpload from '../../components/ui/FileUpload';

// 💰 Monto fijo del depósito (debe coincidir con el backend)
const MONTO_DEPOSITO = 10;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

export default function SolicitarDeposito() {
  const navigate = useNavigate();

  const [archivo, setArchivo] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    if (!archivo) {
      setErrores(['El comprobante es obligatorio']);
      return;
    }

    setEnviando(true);
    try {
      // 1. Subir el archivo
      const archivoSubido = await subirArchivo(archivo);

      // 2. Crear el depósito
      await crearMiDeposito({
        monto: MONTO_DEPOSITO,
        archivoId: archivoSubido.id,
        observaciones: observaciones || undefined,
      });

      navigate('/socio/mis-depositos');
    } catch (err: any) {
      const data = err.response?.data;
      if (Array.isArray(data)) setErrores(data);
      else if (typeof data === 'string') setErrores([data]);
      else setErrores(['Error al registrar el depósito']);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/socio/mis-depositos')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Volver"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Solicitar Depósito</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registra tu depósito y adjunta el comprobante
          </p>
        </div>
      </div>

      {/* Aviso informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6 flex items-start gap-3">
        <Banknote size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">¿Cómo funciona?</p>
          <p className="text-blue-700 mt-1">
            1. Realiza el depósito en efectivo o transferencia en la junta.{' '}
            2. Sube el comprobante aquí. 3. Un administrador confirmará tu depósito
            y se reflejará en tu saldo.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Monto fijo (solo informativo) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto del depósito
            </label>
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <span className="text-slate-700">Monto a depositar</span>
              <span className="text-2xl font-bold text-emerald-700">
                {formatoMoneda(MONTO_DEPOSITO)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monto fijo establecido por la junta
            </p>
          </div>

          {/* Comprobante */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comprobante <span className="text-red-500">*</span>
            </label>
            <FileUpload archivo={archivo} onChange={setArchivo} />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Ej: Depósito en efectivo en la caja de la junta, voucher #1234..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Asegúrate de que el comprobante sea legible y muestre claramente el monto
              y la fecha del depósito.
            </span>
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

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/socio/mis-depositos')}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg font-medium transition-colors"
            >
              <Send size={16} />
              {enviando ? 'Enviando...' : 'Enviar Depósito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}