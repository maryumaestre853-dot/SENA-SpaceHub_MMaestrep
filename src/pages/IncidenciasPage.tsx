// ============================================================================
// 📁 src/pages/IncidenciasPage.tsx
// RBAC en este módulo (al revés que Equipos): CUALQUIER rol autenticado puede
// reportar una falla (un Aprendiz es normalmente quien detecta el problema
// usando el equipo), pero solo Administrador/Instructor pueden marcarla como
// resuelta — la resolución es una acción operativa, no de autoservicio.
// ============================================================================

import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useSpaceHubData, type NuevaIncidenciaPayload } from "../context/DataContext";
import type { PrioridadIncidencia } from "../types/spacehub.types";

const BADGE_POR_PRIORIDAD: Record<PrioridadIncidencia, string> = {
  Alta: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Media: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Baja: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

export function IncidenciasPage() {
  const { user } = useAuth();
  const { equipos, incidencias, reportarIncidencia, resolverIncidencia } = useSpaceHubData();

  const puedeResolver = user?.rol === "Administrador" || user?.rol === "Instructor";

  const [mostrarForm, setMostrarForm] = useState(false);
  const [placaSena, setPlacaSena] = useState(equipos[0]?.placaSena ?? "");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PrioridadIncidencia>("Media");

  const pendientes = incidencias.filter((i) => !i.resuelta);
  const resueltas = incidencias.filter((i) => i.resuelta);

  function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    if (!placaSena || !descripcion.trim()) return;

    const payload: NuevaIncidenciaPayload = {
      placaSena,
      descripcion: descripcion.trim(),
      prioridad,
    };
    reportarIncidencia(payload);

    setDescripcion("");
    setPrioridad("Media");
    setMostrarForm(false);
  }

  if (!user) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
        <span className="text-3xl">🔒</span>
        <p className="text-sm text-slate-300 font-bold">Inicia sesión para reportar o gestionar incidencias</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">Ticketera de Incidencias de Hardware</h3>
          <p className="text-xs text-slate-400">
            {pendientes.length} pendientes · {resueltas.length} resueltas
          </p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-sena-green hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
        >
          {mostrarForm ? "✕ Cancelar" : "+ Reportar Falla"}
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={manejarSubmit}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
        >
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Equipo</label>
            <select
              value={placaSena}
              onChange={(e) => setPlacaSena(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            >
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.placaSena}>
                  {eq.placaSena} — {eq.marcaModelo}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-slate-400 mb-1 font-mono">Descripción de la falla</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: la pantalla parpadea al mover el cable"
              required
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Prioridad</label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadIncidencia)}
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="bg-sena-green text-white font-bold px-5 py-2 rounded-xl text-xs"
            >
              Enviar Reporte
            </button>
          </div>
        </form>
      )}

      {/* Pendientes */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">
          🛠️ Pendientes ({pendientes.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pendientes.length === 0 && (
            <p className="text-xs text-slate-500 col-span-2">
              No hay incidencias pendientes. Todo el inventario está sano. ✅
            </p>
          )}
          {pendientes.map((inc) => (
            <div
              key={inc.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white text-xs">{inc.placaSena}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${BADGE_POR_PRIORIDAD[inc.prioridad]}`}
                >
                  {inc.prioridad}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{inc.descripcion}</p>
              {puedeResolver ? (
                <button
                  onClick={() => resolverIncidencia(inc.id)}
                  className="text-[10px] bg-sena-green/20 text-sena-green border border-sena-green/30 font-bold px-3 py-1.5 rounded-lg hover:bg-sena-green/30 transition-all"
                >
                  ✔ Marcar como Resuelta
                </button>
              ) : (
                <span className="text-[10px] text-slate-600 font-mono block">
                  🔒 Solo Administrador/Instructor puede resolver tickets
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resueltas */}
      {resueltas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">
            ✅ Resueltas ({resueltas.length})
          </h4>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl divide-y divide-slate-800 max-h-56 overflow-y-auto custom-scrollbar">
            {resueltas.map((inc) => (
              <div key={inc.id} className="p-3 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-mono text-slate-500">{inc.placaSena}</span>
                <span className="text-slate-400 flex-1 px-3 truncate">{inc.descripcion}</span>
                <span className="text-slate-600">Resuelta</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
