// ============================================================================
// 📁 src/components/SenaHeader/SenaHeader.tsx
// Header visual de SpaceHub, igual al simulador de la Sesión 3: badge verde
// SENA, 4 pestañas con contador (Dashboard, Inventario, Préstamos, Ticketera)
// y el estado de sesión a la derecha. Los contadores y la pestaña activa ya
// no dependen de un useState interno: vienen de datos reales (DataContext) y
// de la URL (NavLink), respectivamente.
// ============================================================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSpaceHubData } from '../../context/DataContext';

export default function SenaHeader() {
  const { user, logout } = useAuth();
  const { equipos, prestamos, incidencias } = useSpaceHubData();
  const navigate = useNavigate();
  const esAprendiz = user?.role === 'Aprendiz';

  const MODULOS = [
    { to: '/dashboard', icono: '📊', nombre: 'Dashboard', contador: null as number | null },
    { to: '/inventario', icono: '💻', nombre: 'Inventario', contador: equipos.length },
    { to: '/prestamos', icono: '📋', nombre: 'Préstamos', contador: prestamos.filter((p) => p.estado === 'Activo').length },
    { to: '/incidencias', icono: '🛠️', nombre: 'Ticketera', contador: incidencias.filter((i) => !i.resuelta).length },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <span className="bg-sena-green text-soot font-bold text-xs px-2.5 py-1 rounded-lg">
          SENA SpaceHub
        </span>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Centro de Gestión de Mercados, Logística y TI
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {MODULOS.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-sena-green text-soot font-bold'
                  : 'text-slate-400 hover:text-plaster'
              }`
            }
          >
            {m.icono} {m.nombre}
            {m.contador !== null && ` (${m.contador})`}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center space-x-2 text-xs">
        {user && (
          <div
            className={`flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border ${
              esAprendiz ? 'border-sena-green/50' : 'border-sky-500/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${esAprendiz ? 'bg-sena-green' : 'bg-sky-400'}`} />
            <span className="font-bold text-plaster">{user.nombreCompleto}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                esAprendiz ? 'bg-sena-green/20 text-sena-green' : 'bg-sky-500/20 text-sky-400'
              }`}
            >
              {user.role}
            </span>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-bold ml-2 underline">
              Salir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
