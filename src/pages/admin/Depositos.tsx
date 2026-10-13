import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';
import {
  listarDepositos,
  crearDeposito,
  confirmarDeposito,
  rechazarDeposito,
  eliminarDeposito,
} from '../../api/depositos';
import { subirArchivo } from '../../api/archivos';
import { listarCuentas } from '../../api/cuentas';
import FileUpload from '../../components/ui/FileUpload';
import type { Deposito, EstadoDeposito } from '../../types/deposito';
import type { Cuenta } from '../../types/cuenta';

const POR_PAGINA = 10;

// 💰 Monto fijo del depósito (debe coincidir con el backend)
const MONTO_DEPOSITO = 10;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

const COLORES_ESTADO: Record<EstadoDeposito, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  CONFIRMADO: 'bg-emerald-100 text-emerald-700',
  RECHAZADO: 'bg-red-100 text-red-700',
};

export default function Depositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoDeposito | 'TODOS'>('TODOS');
  const [pagina, setPagina] = useState(1);

  const [modalCrear, setModalCrear] = useState(false);
  const [depositoConfirmando, setDepositoConfirmando] = useState<Deposito | null>(null);
  const [depositoRechazando, setDepositoRechazando] = useState<Deposito | null>(null);
  const [depositoEliminando, setDepositoEliminando] = useState<Deposito | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [depositosData, cuentasData] = await Promise.all([
        listarDepositos(),
        listarCuentas(),
      ]);
      setDepositos(depositosData);
      setCuentas(cuentasData);
    } catch {
      setError('Error al cargar depósitos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cuentasSocios = cuentas.filter((c) => c.tipoCuenta === 'SOCIO');

  const depositosFiltrados = useMemo(() => {
    let lista = depositos;

    if (filtroEstado !== 'TODOS') {
      lista = lista.filter((d) => d.estadoDeposito === filtroEstado);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (d) =>
          d.cuenta?.usuario?.nombre.toLowerCase().includes(q) ||
          d.cuenta?.usuario?.correo.toLowerCase().includes(q) ||
          d.cuenta?.usuario?.cedula.includes(q)
      );
    }

    return [...lista].sort(
      (a, b) =>
        new Date(b.fechaDeposito).getTime() - new Date(a.fechaDeposito).getTime()
    );
  }, [depositos, busqueda, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(depositosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const depositosPagina = depositosFiltrados.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);

  const pendientes = depositos.filter((d) => d.estadoDeposito === 'PENDIENTE');
  const confirmados = depositos.filter((d) => d.estadoDeposito === 'CONFIRMADO');
  const rechazados = depositos.filter((d) => d.estadoDeposito === 'RECHAZADO');
  const montoConfirmado = confirmados.reduce((acc, d) => acc + Number(d.monto), 0);

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Depósitos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registro y confirmación de depósitos de socios
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
            onClick={() => setModalCrear(true)}
            disabled={cuentasSocios.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Registrar Depósito
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
          icon={<CheckCircle2 size={20} />}
          label="Confirmados"
          valor={confirmados.length.toString()}
          color="emerald"
        />
        <KPICard
          icon={<XCircle size={20} />}
          label="Rechazados"
          valor={rechazados.length.toString()}
          color="red"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Total confirmado"
          valor={formatoMoneda(montoConfirmado)}
          color="slate"
        />
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando depósitos...
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
                Todos ({depositos.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'PENDIENTE'}
                onClick={() => setFiltroEstado('PENDIENTE')}
              >
                Pendientes ({pendientes.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'CONFIRMADO'}
                onClick={() => setFiltroEstado('CONFIRMADO')}
              >
                Confirmados ({confirmados.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === 'RECHAZADO'}
                onClick={() => setFiltroEstado('RECHAZADO')}
              >
                Rechazados ({rechazados.length})
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

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Comprobante
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depositosPagina.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      {busqueda || filtroEstado !== 'TODOS'
                        ? 'No se encontraron depósitos'
                        : 'No hay depósitos registrados'}
                    </td>
                  </tr>
                )}
                {depositosPagina.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {new Date(d.fechaDeposito).toLocaleDateString('es-EC')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(d.fechaDeposito).toLocaleTimeString('es-EC', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm flex-shrink-0">
                          {d.cuenta?.usuario?.nombre.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {d.cuenta?.usuario?.nombre || 'Sin asignar'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {d.cuenta?.usuario?.correo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-slate-800">
                        {formatoMoneda(Number(d.monto))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {d.archivo ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <FileText size={16} className="text-red-500 flex-shrink-0" />
                          <span className="text-xs truncate max-w-[150px]">
                            {d.archivo.nombre}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">— Sin comprobante —</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                          COLORES_ESTADO[d.estadoDeposito]
                        }`}
                      >
                        {d.estadoDeposito}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        {d.estadoDeposito === 'PENDIENTE' && (
                          <>
                            <button
                              onClick={() => setDepositoConfirmando(d)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Confirmar"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setDepositoRechazando(d)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Rechazar"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {(d.estadoDeposito === 'PENDIENTE' ||
                          d.estadoDeposito === 'RECHAZADO') && (
                          <button
                            onClick={() => setDepositoEliminando(d)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {depositosFiltrados.length > POR_PAGINA && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>{Math.min(inicio + POR_PAGINA, depositosFiltrados.length)}</strong>{' '}
                de <strong>{depositosFiltrados.length}</strong>
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

      {/* Modales */}
      {modalCrear && (
        <ModalCrearDeposito
          cuentas={cuentasSocios}
          onClose={() => setModalCrear(false)}
          onCreado={() => {
            setModalCrear(false);
            cargar();
          }}
        />
      )}

      {depositoConfirmando && (
        <ModalConfirmar
          deposito={depositoConfirmando}
          onClose={() => setDepositoConfirmando(null)}
          onConfirmado={() => {
            setDepositoConfirmando(null);
            cargar();
          }}
        />
      )}

      {depositoRechazando && (
        <ModalRechazar
          deposito={depositoRechazando}
          onClose={() => setDepositoRechazando(null)}
          onRechazado={() => {
            setDepositoRechazando(null);
            cargar();
          }}
        />
      )}

      {depositoEliminando && (
        <ModalEliminar
          deposito={depositoEliminando}
          onClose={() => setDepositoEliminando(null)}
          onEliminado={() => {
            setDepositoEliminando(null);
            cargar();
          }}
        />
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

// ============================================
// Modal: Registrar Depósito (ADMIN)
// ============================================

function ModalCrearDeposito({
  cuentas,
  onClose,
  onCreado,
}: {
  cuentas: Cuenta[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [cuentaId, setCuentaId] = useState<number | ''>('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    const erroresLocales: string[] = [];
    if (!cuentaId) erroresLocales.push('Debes seleccionar un socio');
    if (!archivo) erroresLocales.push('El comprobante es obligatorio');

    if (erroresLocales.length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setEnviando(true);
    try {
      // 1. Subir el archivo
      const archivoSubido = await subirArchivo(archivo!);

      // 2. Crear el depósito
      await crearDeposito({
        cuentaId: Number(cuentaId),
        monto: MONTO_DEPOSITO,
        archivoId: archivoSubido.id,
        observaciones: observaciones || undefined,
      });

      onCreado();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Registrar Depósito</h2>
        <p className="text-sm text-slate-500 mb-4">
          Monto fijo de ${MONTO_DEPOSITO} por depósito
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Socio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Socio <span className="text-red-500">*</span>
            </label>
            <select
              value={cuentaId}
              onChange={(e) =>
                setCuentaId(e.target.value ? Number(e.target.value) : '')
              }
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Selecciona un socio —</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.usuario?.nombre} — {c.usuario?.cedula}
                </option>
              ))}
            </select>
          </div>

          {/* Monto fijo (informativo) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto
            </label>
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <span className="text-slate-700">Monto del depósito</span>
              <span className="text-xl font-bold text-emerald-700">
                ${MONTO_DEPOSITO}.00
              </span>
            </div>
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
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Observaciones..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {errores.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              <ul className="list-disc pl-4 space-y-1">
                {errores.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg"
            >
              {enviando ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal: Confirmar
// ============================================

function ModalConfirmar({
  deposito,
  onClose,
  onConfirmado,
}: {
  deposito: Deposito;
  onClose: () => void;
  onConfirmado: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await confirmarDeposito(deposito.id);
      onConfirmado();
    } catch (err: any) {
      setError(err.response?.data || 'Error al confirmar');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Confirmar Depósito</h2>
        </div>

        <p className="text-slate-600 mb-4">
          ¿Confirmar el depósito de{' '}
          <strong>{formatoMoneda(Number(deposito.monto))}</strong> a la cuenta de{' '}
          <strong>{deposito.cuenta?.usuario?.nombre}</strong>?
          <br />
          <span className="text-sm text-slate-500 mt-2 block">
            Se sumará el monto al saldo del socio y se enviará un correo de
            notificación.
          </span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={procesando}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg"
          >
            {procesando ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Modal: Rechazar
// ============================================

function ModalRechazar({
  deposito,
  onClose,
  onRechazado,
}: {
  deposito: Deposito;
  onClose: () => void;
  onRechazado: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRechazar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await rechazarDeposito(deposito.id);
      onRechazado();
    } catch (err: any) {
      setError(err.response?.data || 'Error al rechazar');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <XCircle size={20} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Rechazar Depósito</h2>
        </div>

        <p className="text-slate-600 mb-4">
          ¿Rechazar el depósito de{' '}
          <strong>{formatoMoneda(Number(deposito.monto))}</strong> del socio{' '}
          <strong>{deposito.cuenta?.usuario?.nombre}</strong>?
          <br />
          <span className="text-sm text-slate-500 mt-2 block">
            El saldo del socio no se modificará.
          </span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleRechazar}
            disabled={procesando}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg"
          >
            {procesando ? 'Rechazando...' : 'Rechazar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Modal: Eliminar
// ============================================

function ModalEliminar({
  deposito,
  onClose,
  onEliminado,
}: {
  deposito: Deposito;
  onClose: () => void;
  onEliminado: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await eliminarDeposito(deposito.id);
      onEliminado();
    } catch (err: any) {
      setError(err.response?.data || 'Error al eliminar');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Eliminar Depósito</h2>
        <p className="text-slate-600 mb-4">
          ¿Seguro que quieres eliminar el depósito de{' '}
          <strong>{formatoMoneda(Number(deposito.monto))}</strong>? Esta acción no se
          puede deshacer.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleEliminar}
            disabled={procesando}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg"
          >
            {procesando ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}