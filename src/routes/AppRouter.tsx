import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Verificar from '../pages/Verificar';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import SocioLayout from '../components/layout/SocioLayout';
import OlvidePassword from '../pages/OlvidePassword';
import ResetPassword from '../pages/ResetPassword';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Usuarios from '../pages/admin/Usuarios';
import Cuentas from '../pages/admin/Cuentas';
import Depositos from '../pages/admin/Depositos';
import Peticiones from '../pages/admin/Peticiones';
import Creditos from '../pages/admin/Creditos';
import Cuotas from '../pages/admin/Cuotas';
import Transacciones from '../pages/admin/Transacciones';
import Notificaciones from '../pages/admin/Notificaciones';
import AdminMiPerfil from '../pages/admin/MiPerfil';

// Socio pages
import SocioDashboard from '../pages/socio/Dashboard';
import MiCuenta from '../pages/socio/MiCuenta';
import MisDepositos from '../pages/socio/MisDepositos';
import SolicitarDeposito from '../pages/socio/SolicitarDeposito';
import MisTransacciones from '../pages/socio/MisTransacciones';
import MiPerfil from '../pages/socio/MiPerfil';
import SolicitarCredito from '../pages/socio/SolicitarCredito';
import MisPeticiones from '../pages/socio/MisPeticiones';
import MisCreditos from '../pages/socio/MisCreditos'; 
import MisNotificaciones from '../pages/socio/MisNotificaciones';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verificar" element={<Verificar />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />     
        <Route path="/reset-password" element={<ResetPassword />} /> 

        {/* ADMIN */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route path="/admin/cuentas" element={<Cuentas />} />
            <Route path="/admin/depositos" element={<Depositos />} />
            <Route path="/admin/peticiones" element={<Peticiones />} />
            <Route path="/admin/creditos" element={<Creditos />} />
            <Route path="/admin/cuotas" element={<Cuotas />} />
            <Route path="/admin/transacciones" element={<Transacciones />} />
            <Route path="/admin/notificaciones" element={<Notificaciones />} />
             <Route path="/admin/mi-perfil" element={<AdminMiPerfil />} /> 
          </Route>
        </Route>

        {/* SOCIO */}
        <Route element={<ProtectedRoute roles={['SOCIO']} />}>
          <Route element={<SocioLayout />}>
            <Route path="/socio/dashboard" element={<SocioDashboard />} />
            <Route path="/socio/mi-cuenta" element={<MiCuenta />} />
            <Route path="/socio/mis-depositos" element={<MisDepositos />} />
            <Route path="/socio/solicitar-deposito" element={<SolicitarDeposito />} />
            <Route path="/socio/mis-transacciones" element={<MisTransacciones />} />
            <Route path="/socio/solicitar-credito" element={<SolicitarCredito />} />
            <Route path="/socio/mis-peticiones" element={<MisPeticiones />} />
            <Route path="/socio/mis-creditos" element={<MisCreditos />} />  
            <Route path="/socio/mis-notificaciones" element={<MisNotificaciones />} /> 
            <Route path="/socio/mi-perfil" element={<MiPerfil />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}