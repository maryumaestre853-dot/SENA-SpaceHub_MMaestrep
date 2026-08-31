// ============================================================================
// 📁 src/components/SenaHeader.tsx
// Navbar de SpaceHub. Lee el usuario activo desde useAuth() y pinta la barra
// de sesión distinta según el rol. Los 4 módulos ya están habilitados: los
// contadores de cada pestaña (Inventario, Préstamos, Ticketera) se leen en
// vivo desde useSpaceHubData(), nunca están escritos a mano.
// ============================================================================

import { useAuth } from "../context/AuthContext";
import { useSpaceHubData } from "../context/DataContext";
import type { ModuloSpaceHub } from "../types/spacehub.types";

interface SenaHeaderProps {
  onAbrirLogin: () => void;
  moduloActivo: ModuloSpaceHub;
  onCambiarModulo: (modulo: ModuloSpaceHub) => void;
}

export function SenaHeader({ onAbrirLogin, moduloActivo, onCambiarModulo }: SenaHeaderProps) {
  const { user, logout } = useAuth();
  const { equipos, prestamos, incidencias } = useSpaceHubData();
  const esAprendiz = user?.rol === "Aprendiz";

  const MODULOS: { id: ModuloSpaceHub; icono: string; nombre: string; cantidad: number }[] = [
    { id: "dashboard", icono: "📊", nombre: "Dashboard", cantidad: 0 },
    { id: "equipos", icono: "💻", nombre: "Inventario", cantidad: equipos.length },
    {
      id: "prestamos",
      icono: "📋",
      nombre: "Préstamos",
      cantidad: prestamos.filter((p) => p.estado === "Activo").length,
    },
    {
      id: "incidencias",
      icono: "🛠️",
      nombre: "Ticketera",
      cantidad: incidencias.filter((i) => !i.resuelta).length,
    },
  ];

  return (
    <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <span className="bg-sena-green text-white font-bold text-xs px-2.5 py-1 rounded-lg">
          SENA SpaceHub
        </span>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Centro de Gestión de Mercados, Logística y TI
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {MODULOS.map((m) => (
          <button
            key={m.id}
            onClick={() => onCambiarModulo(m.id)}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              moduloActivo === m.id
                ? "bg-sena-green text-white"
                : "text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {m.icono} {m.nombre}
            {m.id !== "dashboard" && ` (${m.cantidad})`}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-2 text-xs">
        {user ? (
          <div
            className={`flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border ${
              esAprendiz ? "border-sena-green/50" : "border-sky-500/50"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                esAprendiz ? "bg-sena-green" : "bg-sky-400"
              }`}
            />
            <span className="font-bold text-white">{user.nombreCompleto}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                esAprendiz ? "bg-sena-green/20 text-sena-green" : "bg-sky-500/20 text-sky-400"
              }`}
            >
              {user.rol}
            </span>
            <button
              onClick={logout}
              className="text-rose-400 hover:text-rose-300 font-bold ml-2 underline"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={onAbrirLogin}
            className="bg-sena-green hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
          >
            🔑 Iniciar Sesión
          </button>
        )}
      </div>
    </div>
  );
}
