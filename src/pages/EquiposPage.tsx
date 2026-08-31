// ============================================================================
// 📁 src/pages/EquiposPage.tsx
// RBAC en este módulo: TODOS los roles pueden ver el inventario (transparencia
// para el Aprendiz sobre qué equipos existen), pero solo Administrador /
// Instructor pueden agregar un equipo nuevo o cambiar su estado — el mismo
// patrón "esAprendiz ? bloqueado : libre" que ya usa PrestamosPage.tsx.
// ============================================================================

import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useSpaceHubData, type NuevoEquipoPayload } from "../context/DataContext";
import type { EstadoEquipo } from "../types/spacehub.types";

const BADGE_POR_ESTADO: Record<EstadoEquipo, string> = {
  Operativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "En Mantenimiento": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "De Baja": "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const ESTADOS: EstadoEquipo[] = ["Operativo", "En Mantenimiento", "De Baja"];

export function EquiposPage() {
  const { user } = useAuth();
  const { equipos, ambientes, prestamos, agregarEquipo, cambiarEstadoEquipo } =
    useSpaceHubData();

  const puedeGestionar = user?.rol === "Administrador" || user?.rol === "Instructor";

  const [mostrarForm, setMostrarForm] = useState(false);
  const [placaSena, setPlacaSena] = useState("");
  const [marcaModelo, setMarcaModelo] = useState("");
  const [ram, setRam] = useState("");
  const [ambienteId, setAmbienteId] = useState<number>(ambientes[0]?.id ?? 1);

  // Un equipo está "en préstamo" ahora mismo si figura en algún préstamo Activo
  const placasEnPrestamo = useMemo(
    () => new Set(prestamos.filter((p) => p.estado === "Activo").map((p) => p.equipoPlaca)),
    [prestamos]
  );

  const nombreAmbiente = (id: number) => ambientes.find((a) => a.id === id)?.nombre ?? "—";

  function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    if (!placaSena.trim() || !marcaModelo.trim() || !ram.trim()) return;

    const payload: NuevoEquipoPayload = {
      placaSena: placaSena.trim().toUpperCase(),
      marcaModelo: marcaModelo.trim(),
      ram: ram.trim(),
      ambienteId,
    };
    agregarEquipo(payload);

    setPlacaSena("");
    setMarcaModelo("");
    setRam("");
    setMostrarForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">Inventario de Equipos de Cómputo</h3>
          <p className="text-xs text-slate-400">
            {equipos.length} equipos registrados en {ambientes.length} ambientes
          </p>
        </div>

        {puedeGestionar ? (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="bg-sena-green hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            {mostrarForm ? "✕ Cancelar" : "+ Agregar Equipo"}
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full">
            🔒 Solo Administrador/Instructor pueden agregar equipos
          </span>
        )}
      </div>

      {/* Formulario de alta — solo si puedeGestionar (protegido también arriba, aquí es defensa doble) */}
      {mostrarForm && puedeGestionar && (
        <form
          onSubmit={manejarSubmit}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs"
        >
          <div className="lg:col-span-1">
            <label className="block text-slate-400 mb-1 font-mono">Placa SENA</label>
            <input
              value={placaSena}
              onChange={(e) => setPlacaSena(e.target.value)}
              placeholder="SENA-1006"
              required
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-slate-400 mb-1 font-mono">Marca / Modelo</label>
            <input
              value={marcaModelo}
              onChange={(e) => setMarcaModelo(e.target.value)}
              placeholder="Lenovo ThinkPad L14 G3"
              required
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-slate-400 mb-1 font-mono">RAM</label>
            <input
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              placeholder="16GB DDR4"
              required
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-slate-400 mb-1 font-mono">Ambiente</label>
            <select
              value={ambienteId}
              onChange={(e) => setAmbienteId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
            >
              {ambientes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codigo} - {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
            <button
              type="submit"
              className="bg-sena-green text-white font-bold px-5 py-2 rounded-xl text-xs"
            >
              Guardar Equipo (estado inicial: Operativo)
            </button>
          </div>
        </form>
      )}

      {/* Tabla de inventario */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="text-left px-4 py-3">Placa</th>
              <th className="text-left px-4 py-3">Marca / Modelo</th>
              <th className="text-left px-4 py-3">RAM</th>
              <th className="text-left px-4 py-3">Ambiente</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Disponibilidad</th>
              {puedeGestionar && <th className="text-left px-4 py-3">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {equipos.map((eq) => {
              const enPrestamo = placasEnPrestamo.has(eq.placaSena);
              return (
                <tr key={eq.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{eq.placaSena}</td>
                  <td className="px-4 py-3 text-slate-300">{eq.marcaModelo}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{eq.ram}</td>
                  <td className="px-4 py-3 text-slate-400">{nombreAmbiente(eq.ambienteId)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${BADGE_POR_ESTADO[eq.estado]}`}
                    >
                      {eq.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {eq.estado !== "Operativo" ? (
                      <span className="text-slate-600">—</span>
                    ) : enPrestamo ? (
                      <span className="text-amber-400 text-[10px] font-mono">🔴 En préstamo</span>
                    ) : (
                      <span className="text-sena-green text-[10px] font-mono">🟢 Disponible</span>
                    )}
                  </td>
                  {puedeGestionar && (
                    <td className="px-4 py-3">
                      <select
                        value={eq.estado}
                        onChange={(e) =>
                          cambiarEstadoEquipo(eq.placaSena, e.target.value as EstadoEquipo)
                        }
                        className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-sena-green"
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
