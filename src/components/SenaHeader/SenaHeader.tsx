import './SenaHeader.css';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface SenaHeaderProps {
  tituloPortal?: string;
  centroFormacion?: string;
}

export default function SenaHeader({
  tituloPortal = 'Portal del Aprendiz',
  centroFormacion = 'Centro de Gestión de Mercados',
}: SenaHeaderProps) {
  const [usuarioActivo, setUsuarioActivo] = useState<boolean>(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sena-header">
      <div className="header-brand">
        <span className="logo-badge">SENA</span>
        <div>
          <h1 className="header-title">{tituloPortal}</h1>
          <p className="header-sub">{centroFormacion}</p>
        </div>
      </div>

      <div className="header-actions">
        <nav className="header-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/inventario" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Inventario
          </NavLink>
          <NavLink to="/perfil" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Perfil
          </NavLink>
          {user?.rol === 'Administrador' && (
            <NavLink to="/inventario/nuevo" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Nuevo equipo
            </NavLink>
          )}
        </nav>

        <button type="button" className="header-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>

        <div
          className="user-status-btn"
          onClick={() => setUsuarioActivo(!usuarioActivo)}
          title="Cambiar estado del usuario"
        >
          <span className={`status-dot ${usuarioActivo ? 'activo' : 'inactivo'}`}></span>
          <span className="user-name">
            {user ? `${user.nombre} (${user.rol})` : 'Usuario'}
          </span>
          <span className="arrow-icon">▼</span>
        </div>
      </div>
    </header>
  );
}