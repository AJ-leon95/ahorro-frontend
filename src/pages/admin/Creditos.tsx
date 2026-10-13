import { useEffect, useState, useMemo } from "react";
import { Printer } from "lucide-react";
import {
  RefreshCw,
  Search,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  listarCreditos,
  crearCreditoDesdePeticion,
  eliminarCredito,
} from "../../api/creditos";
import { listarPeticiones, aprobarPeticion } from "../../api/peticiones";
import { listarCuotasPorCredito, pagarCuota } from "../../api/cuotas";
import type { Credito, EstadoCredito } from "../../types/credito";
import type { Peticion } from "../../types/peticion";
import type { Cuota, EstadoCuota } from "../../types/cuota";
import { imprimirTablaAmortizacion } from "../../utils/imprimirTablaAmortizacion";

const POR_PAGINA = 10;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(valor);
}

const COLORES_CREDITO: Record<EstadoCredito, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700",
  PAGADO: "bg-blue-100 text-blue-700",
  VENCIDO: "bg-red-100 text-red-700",
};

const COLORES_CUOTA: Record<EstadoCuota, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  PAGADA: "bg-emerald-100 text-emerald-700",
  VENCIDA: "bg-red-100 text-red-700",
};

export default function Creditos() {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [peticionesAprobadas, setPeticionesAprobadas] = useState<Peticion[]>(
    [],
  );
  const [cuotasPorCredito, setCuotasPorCredito] = useState<
    Record<number, Cuota[]>
  >({});
  const [creditoExpandido, setCreditoExpandido] = useState<number | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoCredito | "TODOS">(
    "TODOS",
  );
  const [pagina, setPagina] = useState(1);

  const [modalCrear, setModalCrear] = useState(false);
  const [creditoEliminando, setCreditoEliminando] = useState<Credito | null>(
    null,
  );

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [creditosData, peticionesData] = await Promise.all([
        listarCreditos(),
        listarPeticiones(),
      ]);
      setCreditos(creditosData);

      // Filtrar peticiones APROBADAS que aún no tienen crédito
      const creditosPeticionIds = new Set(
        creditosData.map((c) => c.peticion?.id).filter(Boolean),
      );
      const aprobadas = peticionesData.filter(
        (p) => p.estado === "APROBADA" && !creditosPeticionIds.has(p.id),
      );
      setPeticionesAprobadas(aprobadas);
    } catch {
      setError("Error al cargar créditos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const creditosFiltrados = useMemo(() => {
    let lista = creditos;

    if (filtroEstado !== "TODOS") {
      lista = lista.filter((c) => c.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (c) =>
          c.usuario?.nombre.toLowerCase().includes(q) ||
          c.usuario?.correo.toLowerCase().includes(q) ||
          c.usuario?.cedula.includes(q),
      );
    }

    return [...lista].sort(
      (a, b) =>
        new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime(),
    );
  }, [creditos, busqueda, filtroEstado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(creditosFiltrados.length / POR_PAGINA),
  );
  const inicio = (pagina - 1) * POR_PAGINA;
  const creditosPagina = creditosFiltrados.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);

  const activos = creditos.filter((c) => c.estado === "ACTIVO");
  const pagados = creditos.filter((c) => c.estado === "PAGADO");
  const vencidos = creditos.filter((c) => c.estado === "VENCIDO");
  const montoActivo = activos.reduce((acc, c) => acc + Number(c.monto), 0);

  const toggleExpandir = async (creditoId: number) => {
    if (creditoExpandido === creditoId) {
      setCreditoExpandido(null);
      return;
    }
    setCreditoExpandido(creditoId);
    if (!cuotasPorCredito[creditoId]) {
      try {
        const cuotas = await listarCuotasPorCredito(creditoId);
        setCuotasPorCredito((prev) => ({ ...prev, [creditoId]: cuotas }));
      } catch {
        console.error("Error al cargar cuotas");
      }
    }
  };

  const recargarCuotas = async (creditoId: number) => {
    try {
      const cuotas = await listarCuotasPorCredito(creditoId);
      setCuotasPorCredito((prev) => ({ ...prev, [creditoId]: cuotas }));
    } catch {
      console.error("Error al recargar cuotas");
    }
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Créditos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Créditos activos, pagados y vencidos
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
            disabled={peticionesAprobadas.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg transition-colors"
            title={
              peticionesAprobadas.length === 0
                ? "No hay peticiones aprobadas sin crédito"
                : "Crear crédito desde una petición aprobada"
            }
          >
            <Plus size={16} />
            Crear desde Petición
            {peticionesAprobadas.length > 0 && (
              <span className="bg-white text-emerald-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {peticionesAprobadas.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={<Clock size={20} />}
          label="Activos"
          valor={activos.length.toString()}
          color="emerald"
        />
        <KPICard
          icon={<CheckCircle2 size={20} />}
          label="Pagados"
          valor={pagados.length.toString()}
          color="blue"
        />
        <KPICard
          icon={<XCircle size={20} />}
          label="Vencidos"
          valor={vencidos.length.toString()}
          color="red"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Capital activo"
          valor={formatoMoneda(montoActivo)}
          color="slate"
        />
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando créditos...
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="bg-white rounded-lg shadow">
          {/* Filtros */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              <FiltroBtn
                activo={filtroEstado === "TODOS"}
                onClick={() => setFiltroEstado("TODOS")}
              >
                Todos ({creditos.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === "ACTIVO"}
                onClick={() => setFiltroEstado("ACTIVO")}
              >
                Activos ({activos.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === "PAGADO"}
                onClick={() => setFiltroEstado("PAGADO")}
              >
                Pagados ({pagados.length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtroEstado === "VENCIDO"}
                onClick={() => setFiltroEstado("VENCIDO")}
              >
                Vencidos ({vencidos.length})
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

          {/* Lista de créditos */}
          {creditosPagina.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              {busqueda || filtroEstado !== "TODOS"
                ? "No se encontraron créditos"
                : "No hay créditos registrados"}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {creditosPagina.map((c) => {
                const expandido = creditoExpandido === c.id;
                const cuotas = cuotasPorCredito[c.id] || [];
                const pagadas = cuotas.filter(
                  (q) => q.estado === "PAGADA",
                ).length;
                const progreso =
                  cuotas.length > 0 ? (pagadas / cuotas.length) * 100 : 0;

                return (
                  <div key={c.id}>
                    <div className="p-6 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between gap-4">
                        {/* Info del socio y crédito */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                            {c.usuario?.nombre.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="font-semibold text-slate-800">
                                {c.usuario?.nombre}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  COLORES_CREDITO[c.estado]
                                }`}
                              >
                                {c.estado}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {c.usuario?.correo} · Cédula: {c.usuario?.cedula}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Crédito #{c.id} ·{" "}
                              {new Date(c.fechaInicio).toLocaleDateString(
                                "es-EC",
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Monto */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-slate-800">
                            {formatoMoneda(Number(c.monto))}
                          </p>
                          <p className="text-xs text-slate-500">
                            {c.plazo} cuotas de{" "}
                            {formatoMoneda(Number(c.cuotaMensual))}
                          </p>
                        </div>
                      </div>

                      {/* Progreso */}
                      {cuotas.length > 0 && (
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            {pagadas}/{cuotas.length} pagadas
                          </span>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => toggleExpandir(c.id)}
                          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          {expandido ? (
                            <>
                              Ocultar cuotas <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              Ver cuotas <ChevronDown size={14} />
                            </>
                          )}
                        </button>

                        {c.estado === "ACTIVO" && (
                          <button
                            onClick={() => setCreditoEliminando(c)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tabla de cuotas */}

                    {expandido && (
                      <div className="bg-slate-50 border-t border-slate-200">
                        {cuotas.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">
                            Cargando cuotas...
                          </div>
                        ) : (
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
                                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                                      Acción
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {cuotas.map((q) => (
                                    <tr
                                      key={q.id}
                                      className="hover:bg-slate-50"
                                    >
                                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                        {q.numero}
                                      </td>
                                      <td className="px-4 py-3 text-slate-600">
                                        {new Date(
                                          q.fechaVencimiento,
                                        ).toLocaleDateString("es-EC")}
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
                                      <td className="px-4 py-3 text-right">
                                        {q.estado === "PENDIENTE" ||
                                        q.estado === "VENCIDA" ? (
                                          <PagarCuotaButton
                                            cuota={q}
                                            onPagada={() =>
                                              recargarCuotas(c.id)
                                            }
                                          />
                                        ) : (
                                          <span className="text-xs text-slate-400">
                                            {q.fechaPago
                                              ? `Pagada el ${new Date(q.fechaPago).toLocaleDateString("es-EC")}`
                                              : "—"}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Botón Imprimir (FUERA de la tabla) */}
                            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                              <button
                                onClick={() =>
                                  imprimirTablaAmortizacion(c, cuotas)
                                }
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {creditosFiltrados.length > POR_PAGINA && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>
                  {Math.min(inicio + POR_PAGINA, creditosFiltrados.length)}
                </strong>{" "}
                de <strong>{creditosFiltrados.length}</strong>
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
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
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

      {/* Modal crear */}
      {modalCrear && (
        <ModalCrearCredito
          peticiones={peticionesAprobadas}
          onClose={() => setModalCrear(false)}
          onCreado={() => {
            setModalCrear(false);
            setCuotasPorCredito({});
            cargar();
          }}
        />
      )}

      {/* Modal eliminar */}
      {creditoEliminando && (
        <ModalEliminarCredito
          credito={creditoEliminando}
          onClose={() => setCreditoEliminando(null)}
          onEliminado={() => {
            setCreditoEliminando(null);
            setCuotasPorCredito({});
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
  color: "emerald" | "blue" | "red" | "slate";
}) {
  const colores = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
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
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            {label}
          </p>
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
          ? "bg-emerald-500 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================
// Botón pagar cuota (inline)
// ============================================

function PagarCuotaButton({
  cuota,
  onPagada,
}: {
  cuota: Cuota;
  onPagada: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const handlePagar = async () => {
    setProcesando(true);
    try {
      await pagarCuota(cuota.id);
      onPagada();
    } catch (err: any) {
      alert(err.response?.data || "Error al pagar la cuota");
    } finally {
      setProcesando(false);
      setConfirmando(false);
    }
  };

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded"
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
        {procesando ? "..." : "Sí"}
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

// ============================================
// Modal crear crédito desde petición
// ============================================

function ModalCrearCredito({
  peticiones,
  onClose,
  onCreado,
}: {
  peticiones: Peticion[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [peticionId, setPeticionId] = useState<number | "">("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peticionSeleccionada = peticiones.find((p) => p.id === peticionId);

  // Cálculo de simulación (sistema francés)
  const calcular = (monto: number, interes: number, plazo: number) => {
    const i = interes / 100;
    const n = plazo;
    const cuota = (monto * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
    const total = cuota * n;
    return { cuota, total, intereses: total - monto };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peticionId) return;
    setEnviando(true);
    setError(null);
    try {
      await crearCreditoDesdePeticion(Number(peticionId));
      onCreado();
    } catch (err: any) {
      setError(err.response?.data || "Error al crear el crédito");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Crear Crédito</h2>
        <p className="text-sm text-slate-500 mb-4">
          Selecciona una petición APROBADA para generar el crédito con sus
          cuotas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Petición aprobada <span className="text-red-500">*</span>
            </label>
            <select
              value={peticionId}
              onChange={(e) =>
                setPeticionId(e.target.value ? Number(e.target.value) : "")
              }
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Selecciona una petición —</option>
              {peticiones.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.usuario?.nombre} — $
                  {Number(p.monto).toLocaleString("es-EC")}
                </option>
              ))}
            </select>
          </div>

          {/* Detalle de la petición seleccionada */}
          {peticionSeleccionada && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-slate-700 mb-2">
                Resumen del crédito a crear:
              </p>
              <div className="flex justify-between">
                <span className="text-slate-500">Socio:</span>
                <span className="font-medium text-slate-800">
                  {peticionSeleccionada.usuario?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto:</span>
                <span className="font-medium text-slate-800">
                  {formatoMoneda(Number(peticionSeleccionada.monto))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interés:</span>
                <span className="font-medium text-slate-800">
                  {peticionSeleccionada.interes}% mensual
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plazo:</span>
                <span className="font-medium text-slate-800">
                  {peticionSeleccionada.plazo} meses
                </span>
              </div>
              {(() => {
                const sim = calcular(
                  Number(peticionSeleccionada.monto),
                  Number(peticionSeleccionada.interes),
                  peticionSeleccionada.plazo,
                );
                return (
                  <>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                      <span className="text-slate-500">Cuota mensual:</span>
                      <span className="font-bold text-emerald-600">
                        {formatoMoneda(sim.cuota)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total a pagar:</span>
                      <span className="font-bold text-slate-800">
                        {formatoMoneda(sim.total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Intereses totales:</span>
                      <span className="font-medium text-slate-700">
                        {formatoMoneda(sim.intereses)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
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
              disabled={enviando || !peticionId}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg"
            >
              {enviando ? "Creando..." : "Crear Crédito"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal eliminar crédito
// ============================================

function ModalEliminarCredito({
  credito,
  onClose,
  onEliminado,
}: {
  credito: Credito;
  onClose: () => void;
  onEliminado: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await eliminarCredito(credito.id);
      onEliminado();
    } catch (err: any) {
      setError(err.response?.data || "Error al eliminar");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Eliminar Crédito
        </h2>
        <p className="text-slate-600 mb-4">
          ¿Seguro que quieres eliminar el crédito de{" "}
          <strong>{credito.usuario?.nombre}</strong> por{" "}
          <strong>{formatoMoneda(Number(credito.monto))}</strong>?
          <br />
          <span className="text-sm text-red-600 mt-2 block">
            ⚠️ Esta acción eliminará también todas las cuotas asociadas.
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
            onClick={handleEliminar}
            disabled={procesando}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg"
          >
            {procesando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
