import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RolUsuario } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolPermitido?: RolUsuario;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, rolPermitido }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolPermitido && user?.rol !== rolPermitido) {
    return (
      <div className="p-8 text-center text-rose-500">
        <h2>⛔ Acceso Denegado</h2>
        <p>Tu rol de {user?.rol} no tiene permisos para esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
};