import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout/MainLayout';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import EquiposPage from './pages/EquiposPage/EquiposPage';
import NuevoEquipoPage from './pages/NuevoEquipoPage/NuevoEquipoPage';
import DetalleEquipoPage from './pages/DetalleEquipoPage/DetalleEquipoPage';
import PerfilPage from './pages/PerfilPage/PerfilPage';
import LoginPage from './pages/LoginPage/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 🔒 Envolvemos las rutas en  sin tocar los componentes de página */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="inventario" element={
          <ProtectedRoute>
            <EquiposPage />
          </ProtectedRoute>
        } />

        <Route path="inventario/:placaSena" element={
          <ProtectedRoute>
            <DetalleEquipoPage />
          </ProtectedRoute>
        } />

        <Route path="perfil" element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        } />

        <Route path="inventario/nuevo" element={
          <ProtectedRoute rolPermitido="Administrador">
            <NuevoEquipoPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}