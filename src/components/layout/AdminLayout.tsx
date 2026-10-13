import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  const toggleSidebar = () => {
    setSidebarAbierto((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar abierto={sidebarAbierto} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}