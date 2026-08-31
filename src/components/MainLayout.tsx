// ============================================================================
// 📁 src/components/MainLayout.tsx
// Antes solo envolvía `children` (la Sesión 3 arrancó con Dashboard fijo).
// Ahora que los 4 módulos existen, MainLayout es quien decide CUÁL página se
// ve, guardando `moduloActivo` en un simple useState y pasándoselo a
// SenaHeader (para resaltar la pestaña) y usándolo aquí abajo para elegir
// qué <...Page /> renderizar. No hace falta Context para esto: es estado de
// navegación puramente local a este layout, nadie más lo necesita.
// ============================================================================

import { useState } from "react";
import { SenaHeader } from "./SenaHeader";
import { RoleInfoBanner } from "./RoleInfoBanner";
import { LoginModal } from "./LoginModal";
import { DashboardPage } from "../pages/DashboardPage";
import { EquiposPage } from "../pages/EquiposPage";
import { PrestamosPage } from "../pages/PrestamosPage";
import { IncidenciasPage } from "../pages/IncidenciasPage";
import type { ModuloSpaceHub } from "../types/spacehub.types";

export function MainLayout() {
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [moduloActivo, setModuloActivo] = useState<ModuloSpaceHub>("dashboard");

  function renderModulo() {
    switch (moduloActivo) {
      case "equipos":
        return <EquiposPage />;
      case "prestamos":
        return <PrestamosPage />;
      case "incidencias":
        return <IncidenciasPage />;
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      <SenaHeader
        onAbrirLogin={() => setLoginAbierto(true)}
        moduloActivo={moduloActivo}
        onCambiarModulo={setModuloActivo}
      />
      <RoleInfoBanner onAbrirLogin={() => setLoginAbierto(true)} />

      <div className="p-6">{renderModulo()}</div>

      <LoginModal abierto={loginAbierto} onClose={() => setLoginAbierto(false)} />
    </div>
  );
}
