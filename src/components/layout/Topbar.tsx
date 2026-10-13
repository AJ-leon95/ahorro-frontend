import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface TopbarProps {
  onToggleSidebar: () => void;
  titulo?: string;
}

export default function Topbar({
  onToggleSidebar,
  titulo = 'Panel de Control',
}: TopbarProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      {/* Botón para colapsar/expandir sidebar */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Título */}
      <div className="flex-1 px-4">
        <h2 className="text-slate-700 font-semibold">{titulo}</h2>
      </div>

      {/* Usuario + Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <User size={18} className="text-emerald-600" />
          </div>
          <div className="hidden md:block">
            <p className="font-medium text-slate-800">{usuario?.nombre}</p>
            <p className="text-xs text-slate-500">{usuario?.rol}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}