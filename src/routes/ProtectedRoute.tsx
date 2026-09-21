// =================================================================
// Archivo: src/routes/ProtectedRoute.tsx
// Guardián de Rutas con validación de Sesión y Rol RBAC
// Export default directo sin tipos obsoletos (como React.FC)
// =================================================================
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'Administrador' | 'Aprendiz' | 'Instructor';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // 1. Si no hay token JWT en sessionStorage -> Redirigir a Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta exige rol y el usuario no lo cumple -> Error 403
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="p-8 text-center bg-rose-950/40 border border-rose-500/50 rounded-2xl m-6 font-mono">
        <h2 className="text-xl font-bold text-rose-300">HTTP 403 - Acceso Denegado</h2>
        <p className="text-slate-300 mt-2 text-sm font-sans">
          Tu rol actual es <strong>{user?.role}</strong>. Requieres permisos de <strong>{requiredRole}</strong> para esta sección.
        </p>
      </div>
    );
  }

  return <Outlet />;
}