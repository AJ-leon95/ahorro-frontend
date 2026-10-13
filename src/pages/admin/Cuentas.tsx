import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import {
  listarCuentas,
  crearCuentaDeSocio,
  crearCuentaEspecial,
  eliminarCuenta,
  registrarGasto,
} from "../../api/cuentas";
import { listarSocios } from "../../api/usuarios";
import type { Cuenta, TipoCuenta } from "../../types/cuenta";
import type { Usuario } from "../../types/auth";

const POR_PAGINA = 10;

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(valor);
}

const COLORES_TIPO: Record<TipoCuenta, string> = {
  SOCIO: "bg-blue-100 text-blue-700",
  INTERESES: "bg-emerald-100 text-emerald-700",
  MORAS: "bg-amber-100 text-amber-700",
  GASTOS: "bg-red-100 text-red-700",
};

export default function Cuentas() {
  const navigate = useNavigate();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [socios, setSocios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoCuenta | "TODOS">("TODOS");
  const [pagina, setPagina] = useState(1);

  const [modalCrearSocio, setModalCrearSocio] = useState(false);
  const [modalCrearEspecial, setModalCrearEspecial] = useState(false);
  const [cuentaEliminando, setCuentaEliminando] = useState<Cuenta | null>(null);
  const [cuentaRegistrandoGasto, setCuentaRegistrandoGasto] =
    useState<Cuenta | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [cuentasData, sociosData] = await Promise.all([
        listarCuentas(),
        listarSocios(),
      ]);
      setCuentas(cuentasData);
      setSocios(sociosData);
    } catch {
      setError("Error al cargar cuentas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cuentasEspeciales = cuentas.filter((c) => c.tipoCuenta !== "SOCIO");
  const cuentasSocios = cuentas.filter((c) => c.tipoCuenta === "SOCIO");

  const cuentasFiltradas = useMemo(() => {
    let lista = cuentasSocios;

    if (filtroTipo !== "TODOS") {
      lista = lista.filter((c) => c.tipoCuenta === filtroTipo);
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

    return lista;
  }, [cuentasSocios, busqueda, filtroTipo]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(cuentasFiltradas.length / POR_PAGINA),
  );
  const inicio = (pagina - 1) * POR_PAGINA;
  const cuentasPagina = cuentasFiltradas.slice(inicio, inicio + POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroTipo]);

  const sociosSinCuenta = socios.filter(
    (s) => !cuentas.some((c) => c.usuario?.id === s.id),
  );

  const tiposEspecialesDisponibles: TipoCuenta[] = (
    ["INTERESES", "MORAS", "GASTOS"] as TipoCuenta[]
  ).filter((t) => !cuentas.some((c) => c.tipoCuenta === t));

  const totalSocios = cuentasSocios.reduce(
    (acc, c) => acc + Number(c.saldoCuenta),
    0,
  );
  const totalEspeciales = cuentasEspeciales.reduce(
    (acc, c) => acc + Number(c.saldoCuenta),
    0,
  );

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cuentas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {cuentasSocios.length} cuentas de socios +{" "}
            {cuentasEspeciales.length} especiales
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
            onClick={() => setModalCrearEspecial(true)}
            disabled={tiposEspecialesDisponibles.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg transition-colors"
            title={
              tiposEspecialesDisponibles.length === 0
                ? "Ya existen todas las cuentas especiales"
                : ""
            }
          >
            <Plus size={16} />
            Cuenta Especial
          </button>
          <button
            onClick={() => setModalCrearSocio(true)}
            disabled={sociosSinCuenta.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg transition-colors"
            title={
              sociosSinCuenta.length === 0
                ? "Todos los socios ya tienen cuenta"
                : ""
            }
          >
            <Plus size={16} />
            Cuenta de Socio
          </button>
        </div>
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando cuentas...
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90">Total en cuentas de socios</p>
              <p className="text-3xl font-bold mt-1">
                {formatoMoneda(totalSocios)}
              </p>
              <p className="text-xs opacity-75 mt-2">
                {cuentasSocios.length}{" "}
                {cuentasSocios.length === 1 ? "socio" : "socios"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90">Total en cuentas especiales</p>
              <p className="text-3xl font-bold mt-1">
                {formatoMoneda(totalEspeciales)}
              </p>
              <p className="text-xs opacity-75 mt-2">
                {cuentasEspeciales.length} cuentas del sistema
              </p>
            </div>
          </div>

          {/* Cuentas especiales */}
          {cuentasEspeciales.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">
                Cuentas Especiales del Sistema
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cuentasEspeciales.map((c) => (
                  <div
                    key={c.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          COLORES_TIPO[c.tipoCuenta]
                        }`}
                      >
                        {c.tipoCuenta}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setCuentaRegistrandoGasto(c)}
                          disabled={Number(c.saldoCuenta) <= 0}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          title={
                            Number(c.saldoCuenta) <= 0
                              ? "No hay saldo disponible"
                              : "Registrar gasto"
                          }
                        >
                          <TrendingDown size={14} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/transacciones?cuenta=${c.id}`)
                          }
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Ver movimientos"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mt-2">
                      {formatoMoneda(Number(c.saldoCuenta))}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Abierta:{" "}
                      {new Date(c.fechaApertura).toLocaleDateString("es-EC")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de cuentas de socios */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <h2 className="text-sm font-semibold text-slate-500 uppercase">
                Cuentas de Socios ({cuentasFiltradas.length})
              </h2>
              <div className="relative w-full md:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o cédula..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Socio
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Fecha Apertura
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cuentasPagina.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-slate-400"
                      >
                        {busqueda
                          ? "No se encontraron cuentas"
                          : "No hay cuentas de socios"}
                      </td>
                    </tr>
                  )}
                  {cuentasPagina.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                            {c.usuario?.nombre.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {c.usuario?.nombre || "Sin asignar"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {c.usuario?.correo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">
                          {c.usuario?.cedula}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-slate-800">
                          {formatoMoneda(Number(c.saldoCuenta))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(c.fechaApertura).toLocaleDateString("es-EC")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              navigate(`/admin/transacciones?cuenta=${c.id}`)
                            }
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Ver movimientos"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setCuentaEliminando(c)}
                            disabled={Number(c.saldoCuenta) !== 0}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                            title={
                              Number(c.saldoCuenta) !== 0
                                ? "No se puede eliminar una cuenta con saldo"
                                : "Eliminar cuenta"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cuentasFiltradas.length > POR_PAGINA && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Mostrando <strong>{inicio + 1}</strong>–
                  <strong>
                    {Math.min(inicio + POR_PAGINA, cuentasFiltradas.length)}
                  </strong>{" "}
                  de <strong>{cuentasFiltradas.length}</strong>
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

          {/* Nota informativa */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                Los saldos solo cambian por operaciones
              </p>
              <p className="text-blue-700 mt-1">
                Los depósitos confirmados suman al saldo. Los pagos de cuotas y
                otros cargos restan. Todas las operaciones quedan registradas en
                el historial de transacciones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {modalCrearSocio && (
        <ModalCrearCuentaSocio
          sociosSinCuenta={sociosSinCuenta}
          onClose={() => setModalCrearSocio(false)}
          onCreado={() => {
            setModalCrearSocio(false);
            cargar();
          }}
        />
      )}

      {modalCrearEspecial && (
        <ModalCrearCuentaEspecial
          tiposDisponibles={tiposEspecialesDisponibles}
          onClose={() => setModalCrearEspecial(false)}
          onCreado={() => {
            setModalCrearEspecial(false);
            cargar();
          }}
        />
      )}

      {cuentaEliminando && (
        <ModalEliminarCuenta
          cuenta={cuentaEliminando}
          onClose={() => setCuentaEliminando(null)}
          onEliminada={() => {
            setCuentaEliminando(null);
            cargar();
          }}
        />
      )}

      {cuentaRegistrandoGasto && (
        <ModalRegistrarGasto
          cuenta={cuentaRegistrandoGasto}
          onClose={() => setCuentaRegistrandoGasto(null)}
          onRegistrado={() => {
            setCuentaRegistrandoGasto(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Modal: Crear Cuenta de Socio
// ============================================
function ModalCrearCuentaSocio({
  sociosSinCuenta,
  onClose,
  onCreado,
}: {
  sociosSinCuenta: Usuario[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return;
    setEnviando(true);
    setError(null);
    try {
      await crearCuentaDeSocio(Number(usuarioId));
      onCreado();
    } catch (err: any) {
      setError(err.response?.data || "Error al crear la cuenta");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Crear Cuenta de Socio
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Selecciona un socio que aún no tenga cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Socio <span className="text-red-500">*</span>
            </label>
            <select
              value={usuarioId}
              onChange={(e) =>
                setUsuarioId(e.target.value ? Number(e.target.value) : "")
              }
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Selecciona un socio —</option>
              {sociosSinCuenta.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {s.correo}
                </option>
              ))}
            </select>
          </div>

          {error && <ErroresBloque errores={[error]} />}

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
              disabled={enviando || !usuarioId}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg"
            >
              {enviando ? "Creando..." : "Crear Cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal: Crear Cuenta Especial
// ============================================
function ModalCrearCuentaEspecial({
  tiposDisponibles,
  onClose,
  onCreado,
}: {
  tiposDisponibles: TipoCuenta[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [tipo, setTipo] = useState<TipoCuenta | "">("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo) return;
    setEnviando(true);
    setError(null);
    try {
      await crearCuentaEspecial(tipo as TipoCuenta);
      onCreado();
    } catch (err: any) {
      setError(err.response?.data || "Error al crear la cuenta");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Crear Cuenta Especial
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Solo puede existir una cuenta de cada tipo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCuenta)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Selecciona un tipo —</option>
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {error && <ErroresBloque errores={[error]} />}

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
              disabled={enviando || !tipo}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg"
            >
              {enviando ? "Creando..." : "Crear Cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal: Eliminar Cuenta
// ============================================
function ModalEliminarCuenta({
  cuenta,
  onClose,
  onEliminada,
}: {
  cuenta: Cuenta;
  onClose: () => void;
  onEliminada: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await eliminarCuenta(cuenta.id);
      onEliminada();
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
          Eliminar Cuenta
        </h2>
        <p className="text-slate-600 mb-4">
          ¿Seguro que quieres eliminar la cuenta de{" "}
          <strong>{cuenta.usuario?.nombre || cuenta.tipoCuenta}</strong>? Esta
          acción no se puede deshacer.
        </p>

        {error && <ErroresBloque errores={[error]} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
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

// ============================================
// Modal: Registrar Gasto
// ============================================
function ModalRegistrarGasto({
  cuenta,
  onClose,
  onRegistrado,
}: {
  cuenta: Cuenta;
  onClose: () => void;
  onRegistrado: () => void;
}) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    const erroresLocales: string[] = [];
    const montoNum = Number(monto);

    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      erroresLocales.push("Ingresa un monto válido");
    }
    if (montoNum > Number(cuenta.saldoCuenta)) {
      erroresLocales.push(
        `El monto no puede superar el saldo disponible (${formatoMoneda(Number(cuenta.saldoCuenta))})`,
      );
    }
    if (!descripcion.trim()) {
      erroresLocales.push("La descripción es obligatoria");
    }

    if (erroresLocales.length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setEnviando(true);
    try {
      await registrarGasto(cuenta.id, montoNum, descripcion);
      onRegistrado();
    } catch (err: any) {
      const data = err.response?.data;
      if (Array.isArray(data)) setErrores(data);
      else if (typeof data === "string") setErrores([data]);
      else setErrores(["Error al registrar el gasto"]);
    } finally {
      setEnviando(false);
    }
  };

  const saldoActual = Number(cuenta.saldoCuenta);
  const montoNum = Number(monto);
  const saldoRestante = saldoActual - (isNaN(montoNum) ? 0 : montoNum);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <TrendingDown size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Registrar Gasto
            </h2>
            <p className="text-sm text-slate-500">
              Cuenta: <strong>{cuenta.tipoCuenta}</strong>
            </p>
          </div>
        </div>

        {/* Info del saldo */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Saldo disponible:</span>
            <span className="font-bold text-slate-800">
              {formatoMoneda(saldoActual)}
            </span>
          </div>
          {monto && montoNum > 0 && (
            <div className="flex justify-between text-sm border-t border-slate-200 pt-1 mt-1">
              <span className="text-slate-500">Saldo después del gasto:</span>
              <span
                className={`font-bold ${
                  saldoRestante < 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatoMoneda(saldoRestante)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto del gasto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={saldoActual}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-3 py-2 text-lg font-semibold border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción del gasto <span className="text-red-500">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              required
              maxLength={300}
              placeholder="Ej: Pago de mantenimiento del servidor, papelería, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Describe brevemente el motivo del gasto
            </p>
          </div>

          {errores.length > 0 && <ErroresBloque errores={errores} />}

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
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg"
            >
              <TrendingDown size={16} />
              {enviando ? "Registrando..." : "Registrar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================
function ErroresBloque({ errores }: { errores: string[] }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
      <ul className="list-disc pl-4 space-y-1">
        {errores.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
