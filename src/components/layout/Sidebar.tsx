import {
  LayoutDashboard,
  Users,
  Wallet,
  Banknote,
  FileText,
  CreditCard,
  Calendar,
  BarChart3,
  Bell,
  User,
} from 'lucide-react';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  abierto: boolean;
}

export default function Sidebar({ abierto }: SidebarProps) {
  const menuItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { to: '/admin/cuentas', icon: Wallet, label: 'Cuentas' },
    { to: '/admin/depositos', icon: Banknote, label: 'Depósitos' },
    { to: '/admin/peticiones', icon: FileText, label: 'Peticiones' },
    { to: '/admin/creditos', icon: CreditCard, label: 'Créditos' },
    { to: '/admin/cuotas', icon: Calendar, label: 'Cuotas' },
    { to: '/admin/transacciones', icon: BarChart3, label: 'Transacciones' },
    { to: '/admin/notificaciones', icon: Bell, label: 'Notificaciones' },
    { to: '/admin/mi-perfil', icon: User, label: 'Mi Perfil' },
  ];

  return (
    <aside
      className={`bg-slate-800 text-white h-screen flex flex-col transition-all duration-300 ${
        abierto ? 'w-64' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Logo / Marca */}
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-emerald-400">CACM</h1>
        <p className="text-xs text-slate-400 mt-1">Panel de Administración</p>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        v1.0.0 — Ahorro App
      </div>
    </aside>
  );
}