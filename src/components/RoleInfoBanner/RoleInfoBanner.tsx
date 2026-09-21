// ============================================================================
// 📁 src/components/RoleInfoBanner/RoleInfoBanner.tsx
// Banner de rol idéntico al del simulador de la Sesión 3: explica qué puede
// hacer el usuario logueado y ofrece el enlace "⚡ Cambiar a ...".
// Diferencia con el simulador: el rol viene del JWT real que entregó el
// backend, así que "cambiar de rol" cierra la sesión y lleva a /login, donde
// están los accesos rápidos de Aprendiz y Administrador.
// ============================================================================

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleInfoBanner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const cambiarDeRol = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300 font-mono">
      {user.role === 'Aprendiz' && (
        <>
          <span>
            👨‍🎓 Modo <strong>Aprendiz ADSO</strong> activo (Ficha: {user.ficha ?? 'N/A'}). Las solicitudes de préstamo
            autocompletan tus datos personales.
          </span>
          <button onClick={cambiarDeRol} className="text-sky-400 font-bold underline hover:text-sky-300">
            ⚡ Cambiar a Operador/Admin
          </button>
        </>
      )}

      {user.role === 'Administrador' && (
        <>
          <span>
            👨‍💼 Modo <strong>Administrador / Operario de Computo</strong> activo. Tienes permisos para agregar equipos al
            inventario y asignar préstamos a cualquier aprendiz.
          </span>
          <button onClick={cambiarDeRol} className="text-sena-green font-bold underline hover:text-sena-green">
            ⚡ Cambiar a Aprendiz
          </button>
        </>
      )}

      {user.role === 'Instructor' && (
        <>
          <span>
            👨‍🏫 Modo <strong>Instructor SENA</strong> activo. Monitoreo de ambiente y reportes de incidencias.
          </span>
          <button onClick={cambiarDeRol} className="text-sky-400 font-bold underline hover:text-sky-300">
            ⚡ Cambiar de Rol
          </button>
        </>
      )}
    </div>
  );
}
