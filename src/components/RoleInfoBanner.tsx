// ============================================================================
// 📁 src/components/RoleInfoBanner.tsx
// Explica en lenguaje simple qué puede hacer el usuario logueado según su rol.
// ============================================================================

import { useAuth } from "../context/AuthContext";

interface RoleInfoBannerProps {
  onAbrirLogin: () => void;
}

export function RoleInfoBanner({ onAbrirLogin }: RoleInfoBannerProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300 font-mono">
        <span className="text-amber-400">
          ⚠️ No has iniciado sesión. Para solicitar préstamos, inicia sesión como Aprendiz u Operario.
        </span>
        <button
          onClick={onAbrirLogin}
          className="bg-sena-green text-white font-bold px-3 py-1 rounded-lg"
        >
          Iniciar Sesión Ahora
        </button>
      </div>
    );
  }

  const mensajes: Record<string, string> = {
    Aprendiz: `👨‍🎓 Modo Aprendiz ADSO activo (Ficha: ${user.ficha ?? "—"}). Las solicitudes de préstamo autocompletan tus datos personales.`,
    Administrador: "👨‍💼 Modo Administrador / Operario de Cómputo activo. Tienes permisos para agregar equipos al inventario y asignar préstamos a cualquier aprendiz.",
    Instructor: "👨‍🏫 Modo Instructor SENA activo. Monitoreo de ambiente y reportes de incidencias.",
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300 font-mono">
      <span>{mensajes[user.rol]}</span>
      <button
        onClick={onAbrirLogin}
        className="text-sky-400 font-bold underline hover:text-sky-300"
      >
        ⚡ Cambiar de Rol
      </button>
    </div>
  );
}
