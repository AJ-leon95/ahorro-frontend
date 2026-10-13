import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Pencil,
  UserX,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarActivoUsuario,
  type CrearUsuarioRequest,
  type ActualizarUsuarioRequest,
} from '../../api/usuarios';
import type { Usuario } from '../../types/auth';

const POR_PAGINA = 10;

type FiltroEstado = 'todos' | 'activos' | 'inactivos' | 'pendientes';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [socioEditando, setSocioEditando] = useState<Usuario | null>(null);
  const [socioCambiandoEstado, setSocioCambiandoEstado] = useState<Usuario | null>(null);

  // Búsqueda + filtros + paginación
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [pagina, setPagina] = useState(1);

  const cargarUsuarios = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const admin = usuarios.find((u) => u.rol === 'ADMIN');
  const socios = usuarios.filter((u) => u.rol === 'SOCIO');

  // Filtrado por búsqueda + estado
  const sociosFiltrados = useMemo(() => {
    let lista = socios;

    // Filtro por estado
    if (filtro === 'activos') lista = lista.filter((u) => u.activo);
    else if (filtro === 'inactivos') lista = lista.filter((u) => !u.activo);
    else if (filtro === 'pendientes') lista = lista.filter((u) => !u.verificado);

    // Filtro por búsqueda (nombre, correo, cédula)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.correo.toLowerCase().includes(q) ||
          u.cedula.includes(q)
      );
    }

    return lista;
  }, [socios, busqueda, filtro]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(sociosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const fin = inicio + POR_PAGINA;
  const sociosPagina = sociosFiltrados.slice(inicio, fin);

  // Reiniciar página al cambiar filtro/búsqueda
  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtro]);

  const sociosActivos = socios.filter((u) => u.activo).length;

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500 text-sm mt-1">
            {sociosActivos} socios activos de {socios.length} totales
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarUsuarios}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Recargar
          </button>
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Crear Socio
          </button>
        </div>
      </div>

      {cargando && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Cargando usuarios...
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="space-y-6">
          {/* Card del Administrador */}
          {admin && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg shadow p-6 text-white">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Administrador del sistema
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  {admin.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{admin.nombre}</p>
                  <p className="text-sm text-slate-300">{admin.correo}</p>
                </div>
                <span className="ml-auto px-3 py-1 text-xs font-medium bg-emerald-500 rounded-full">
                  ADMIN
                </span>
              </div>
            </div>
          )}

          {/* Contenedor principal de la tabla */}
          <div className="bg-white rounded-lg shadow">
            {/* Barra de herramientas */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <h2 className="text-sm font-semibold text-slate-500 uppercase">
                Socios ({sociosFiltrados.length})
              </h2>

              {/* Búsqueda */}
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

            {/* Filtros rápidos */}
            <div className="px-6 py-3 border-b border-slate-100 flex gap-2 flex-wrap">
              <FiltroBtn activo={filtro === 'todos'} onClick={() => setFiltro('todos')}>
                Todos ({socios.length})
              </FiltroBtn>
              <FiltroBtn activo={filtro === 'activos'} onClick={() => setFiltro('activos')}>
                Activos ({socios.filter((u) => u.activo).length})
              </FiltroBtn>
              <FiltroBtn activo={filtro === 'inactivos'} onClick={() => setFiltro('inactivos')}>
                Inactivos ({socios.filter((u) => !u.activo).length})
              </FiltroBtn>
              <FiltroBtn
                activo={filtro === 'pendientes'}
                onClick={() => setFiltro('pendientes')}
              >
                Sin verificar ({socios.filter((u) => !u.verificado).length})
              </FiltroBtn>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Socio
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Cédula
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
                  {sociosPagina.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        {busqueda || filtro !== 'todos'
                          ? 'No se encontraron socios con esos criterios'
                          : 'No hay socios registrados'}
                      </td>
                    </tr>
                  )}
                  {sociosPagina.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !u.activo ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Socio: avatar + nombre + correo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                              u.activo
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.nombre}</p>
                            <p className="text-xs text-slate-500">{u.correo}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contacto: teléfono + dirección */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{u.telefono}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">
                          {u.direccion}
                        </p>
                      </td>

                      {/* Cédula */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">{u.cedula}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            color={u.activo ? 'emerald' : 'red'}
                            label={u.activo ? 'Activo' : 'Inactivo'}
                          />
                          <Badge
                            color={u.verificado ? 'emerald' : 'amber'}
                            label={u.verificado ? 'Verificado' : 'Pendiente'}
                            outline
                          />
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSocioEditando(u)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setSocioCambiandoEstado(u)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.activo
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.activo ? 'Desactivar' : 'Activar'}
                          >
                            {u.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {sociosFiltrados.length > POR_PAGINA && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Mostrando <strong>{inicio + 1}</strong>–
                  <strong>{Math.min(fin, sociosFiltrados.length)}</strong> de{' '}
                  <strong>{sociosFiltrados.length}</strong>
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
        </div>
      )}

      {/* Modales */}
      {modalCrear && (
        <ModalCrearUsuario
          onClose={() => setModalCrear(false)}
          onCreado={() => {
            setModalCrear(false);
            cargarUsuarios();
          }}
        />
      )}

      {socioEditando && (
        <ModalEditarUsuario
          socio={socioEditando}
          onClose={() => setSocioEditando(null)}
          onActualizado={() => {
            setSocioEditando(null);
            cargarUsuarios();
          }}
        />
      )}

      {socioCambiandoEstado && (
        <ModalCambiarEstado
          socio={socioCambiandoEstado}
          onClose={() => setSocioCambiandoEstado(null)}
          onCambiado={() => {
            setSocioCambiandoEstado(null);
            cargarUsuarios();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Sub-componentes UI
// ============================================

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

function Badge({
  color,
  label,
  outline = false,
}: {
  color: 'emerald' | 'red' | 'amber';
  label: string;
  outline?: boolean;
}) {
  const colores = {
    emerald: outline
      ? 'border-emerald-200 text-emerald-700'
      : 'bg-emerald-100 text-emerald-700',
    red: outline ? 'border-red-200 text-red-700' : 'bg-red-100 text-red-700',
    amber: outline ? 'border-amber-200 text-amber-700' : 'bg-amber-100 text-amber-700',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
        outline ? `border ${colores[color]}` : colores[color]
      }`}
    >
      {label}
    </span>
  );
}

// ============================================
// Modal Crear
// ============================================
interface ModalCrearUsuarioProps {
  onClose: () => void;
  onCreado: () => void;
}

function ModalCrearUsuario({ onClose, onCreado }: ModalCrearUsuarioProps) {
  const [form, setForm] = useState<CrearUsuarioRequest>({
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    direccion: '',
    cedula: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrores([]);
    try {
      await crearUsuario(form);
      onCreado();
    } catch (err: any) {
      setErrores(parsearErrores(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Crear Socio</h2>
        <p className="text-sm text-slate-500 mb-4">
          Se enviará un correo de verificación al socio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Campo label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} required />
          <Campo label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} required />
          <Campo label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} required maxLength={10} pattern="[0-9]{10}" placeholder="0999999999" />
          <Campo label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} required />
          <Campo label="Cédula" name="cedula" value={form.cedula} onChange={handleChange} required maxLength={10} pattern="[0-9]{10}" placeholder="1710034065" />

          {errores.length > 0 && <ErroresBloque errores={errores} />}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={enviando} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg">
              {enviando ? 'Creando...' : 'Crear Socio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal Editar
// ============================================
interface ModalEditarUsuarioProps {
  socio: Usuario;
  onClose: () => void;
  onActualizado: () => void;
}

function ModalEditarUsuario({ socio, onClose, onActualizado }: ModalEditarUsuarioProps) {
  const [form, setForm] = useState<ActualizarUsuarioRequest>({
    nombre: socio.nombre,
    correo: socio.correo,
    password: '',
    telefono: socio.telefono,
    direccion: socio.direccion,
    cedula: socio.cedula,
    rol: socio.rol,
    activo: socio.activo,
  });
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrores([]);
    try {
      await actualizarUsuario(socio.id, form);
      onActualizado();
    } catch (err: any) {
      setErrores(parsearErrores(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Editar Socio</h2>
        <p className="text-sm text-slate-500 mb-4">
          Ingresa la contraseña para confirmar los cambios.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Campo label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} required />
          <Campo label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} required />
          <Campo label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} required maxLength={10} pattern="[0-9]{10}" />
          <Campo label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} required />
          <Campo label="Cédula" name="cedula" value={form.cedula} onChange={handleChange} required maxLength={10} pattern="[0-9]{10}" />

          {errores.length > 0 && <ErroresBloque errores={errores} />}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={enviando} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg">
              {enviando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal Cambiar Estado
// ============================================
interface ModalCambiarEstadoProps {
  socio: Usuario;
  onClose: () => void;
  onCambiado: () => void;
}

function ModalCambiarEstado({ socio, onClose, onCambiado }: ModalCambiarEstadoProps) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nuevoEstado = !socio.activo;

  const handleCambiar = async () => {
    setProcesando(true);
    setError(null);
    try {
      await cambiarActivoUsuario(socio.id, nuevoEstado);
      onCambiado();
    } catch (err: any) {
      const errs = parsearErrores(err);
      setError(errs[0]);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {nuevoEstado ? 'Activar' : 'Desactivar'} Socio
        </h2>
        <p className="text-slate-600 mb-4">
          ¿Seguro que quieres {nuevoEstado ? 'activar' : 'desactivar'} a{' '}
          <strong>{socio.nombre}</strong>?
          {nuevoEstado
            ? ' Podrá iniciar sesión nuevamente.'
            : ' No podrá iniciar sesión hasta que lo reactives.'}
        </p>

        {error && <ErroresBloque errores={[error]} />}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleCambiar}
            disabled={procesando}
            className={`px-4 py-2 text-white rounded-lg ${
              nuevoEstado
                ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300'
                : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
            }`}
          >
            {procesando ? 'Procesando...' : nuevoEstado ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================
function parsearErrores(err: any): string[] {
  const data = err.response?.data;
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return [data];
  return ['Error inesperado'];
}

function ErroresBloque({ errores }: { errores: string[] }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
      <ul className="list-disc pl-4 space-y-1">
        {errores.map((e, i) => <li key={i}>{e}</li>)}
      </ul>
    </div>
  );
}

interface CampoProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
}

function Campo({ label, name, value, onChange, type = 'text', required = false, maxLength, pattern, placeholder }: CampoProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}