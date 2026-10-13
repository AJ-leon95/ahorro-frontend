import {
  LayoutDashboard,
  Wallet,
  Banknote,
  Plus,
  CreditCard,
  FileText,
  BarChart3,
  User,
  Coins,  
  Bell,
} from 'lucide-react';
import SidebarItem from './SidebarItem';

interface SidebarSocioProps {
  abierto: boolean;
}

export default function SidebarSocio({ abierto }: SidebarSocioProps) {
  const menuItems = [
    { to: '/socio/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/socio/mi-cuenta', icon: Wallet, label: 'Mi Cuenta' },
    { to: '/socio/mis-depositos', icon: Banknote, label: 'Mis Depósitos' },
    { to: '/socio/solicitar-deposito', icon: Plus, label: 'Solicitar Depósito' },
    { to: '/socio/mis-peticiones', icon: FileText, label: 'Mis Peticiones' },
    { to: '/socio/solicitar-credito', icon: CreditCard, label: 'Solicitar Crédito' },
    { to: '/socio/mis-creditos', icon: Coins, label: 'Mis Créditos' },   
    { to: '/socio/mis-notificaciones', icon: Bell, label: 'Notificaciones' },
    { to: '/socio/mis-transacciones', icon: BarChart3, label: 'Mis Movimientos' },
    { to: '/socio/mi-perfil', icon: User, label: 'Mi Perfil' },
  ];

  return (
    <aside
      className={`bg-slate-800 text-white h-screen flex flex-col transition-all duration-300 ${
        abierto ? 'w-64' : 'w-0 overflow-hidden'
      }`}
    >
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-emerald-400">CACM</h1>
        <p className="text-xs text-slate-400 mt-1">Panel del Socio</p>
      </div>

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

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        v1.0.0 — Ahorro App
      </div>
    </aside>
  );
}