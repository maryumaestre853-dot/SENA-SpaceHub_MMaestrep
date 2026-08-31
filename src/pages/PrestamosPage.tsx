// ============================================================================
// 📁 src/pages/PrestamosPage.tsx
// EL módulo que justifica todo el ejercicio de RBAC de la guía:
//
//  - Si el usuario logueado (useAuth) tiene rol === 'Aprendiz', los campos
//    "Aprendiz" y "Ficha" del formulario se BLOQUEAN (readOnly) y se
//    autocompletan con user.nombreCompleto / user.ficha. No puede solicitar
//    a nombre de otro aprendiz ni inventarse una ficha.
//
//  - Si el rol es 'Administrador' o 'Instructor' (operario), esos mismos
//    campos quedan LIBRES: puede escribir el nombre y la ficha de CUALQUIER
//    aprendiz, porque está registrando la entrega física del equipo, no
//    pidiendo uno para sí mismo.
//
// En ambos casos, `registrarPrestamo()` (DataContext) recibe también el
// `user` completo para guardar `creadoPorRol` — así el histórico siempre
// distingue un autoservicio de una asignación por operario (columna
// `creado_por_usuario_id` en database/schema.sql cumple el mismo propósito).
// ============================================================================

import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useSpaceHubData, type NuevoPrestamoPayload } from "../context/DataContext";

export function PrestamosPage() {
  const { user } = useAuth();
  const { equipos, prestamos, registrarPrestamo, devolverPrestamo } = useSpaceHubData();

  const esAprendiz = user?.rol === "Aprendiz";

  const [mostrarForm, setMostrarForm] = useState(false);
  const [aprendiz, setAprendiz] = useState(esAprendiz ? user?.nombreCompleto ?? "" : "");
  const [ficha, setFicha] = useState(esAprendiz ? user?.ficha ?? "" : "");
  const [equipoPlaca, setEquipoPlaca] = useState("");

  // Solo se pueden prestar equipos "Operativo" que no tengan ya un préstamo Activo
  // (coincide con el índice único parcial idx_equipo_un_solo_prestamo_activo del SQL)
  const placasEnPrestamo = useMemo(
    () => new Set(prestamos.filter((p) => p.estado === "Activo").map((p) => p.equipoPlaca)),
    [prestamos]
  );
  const equiposDisponibles = useMemo(
    () => equipos.filter((eq) => eq.estado === "Operativo" && !placasEnPrestamo.has(eq.placaSena)),
    [equipos, placasEnPrestamo]
  );

  const prestamosActivos = prestamos.filter((p) => p.estado === "Activo");
  const historial = prestamos.filter((p) => p.estado === "Devuelto");

  function abrirFormulario() {
    // Cada vez que se abre, re-sincroniza los campos bloqueados con la sesión
    // activa (por si el usuario cambió de rol con "⚡ Cambiar de Rol" y volvió)
    if (esAprendiz && user) {
      setAprendiz(user.nombreCompleto);
      setFicha(user.ficha ?? "");
    }
    setMostrarForm(true);
  }

  function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !aprendiz.trim() || !ficha.trim() || !equipoPlaca) return;

    const payload: NuevoPrestamoPayload = {
      usuarioId: user.id,
      aprendiz: aprendiz.trim(),
      ficha: ficha.trim(),
      equipoPlaca,
    };
    registrarPrestamo(payload, user);

    setEquipoPlaca("");
    if (!esAprendiz) {
      setAprendiz("");
      setFicha("");
    }
    setMostrarForm(false);
  }

  if (!user) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
        <span className="text-3xl">🔒</span>
        <p className="text-sm text-slate-300 font-bold">Inicia sesión para solicitar o gestionar préstamos</p>
        <p className="text-xs text-slate-500">El formulario necesita saber quién eres para aplicar el RBAC</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">Préstamos de Equipos</h3>
          <p className="text-xs text-slate-400">
            {prestamosActivos.length} activos · {historial.length} en historial
          </p>
        </div>
        <button
          onClick={abrirFormulario}
          disabled={mostrarForm}
          className="bg-sena-green hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
        >
          {esAprendiz ? "+ Solicitar Préstamo" : "+ Registrar Préstamo a Aprendiz"}
        </button>
      </div>

      {/* Formulario con el corazón del RBAC */}
      {mostrarForm && (
        <form
          onSubmit={manejarSubmit}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <div
            className={`text-[10px] font-mono px-3 py-2 rounded-xl border ${
              esAprendiz
                ? "bg-sena-green/10 border-sena-green/30 text-sena-green"
                : "bg-sky-500/10 border-sky-500/30 text-sky-400"
            }`}
          >
            {esAprendiz
              ? "🔒 Autocompletado activo: estos datos se tomaron de tu sesión y no se pueden editar."
              : "🔓 Modo Operario: puedes escribir el nombre y ficha de cualquier aprendiz."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Aprendiz</label>
              <input
                value={aprendiz}
                onChange={(e) => setAprendiz(e.target.value)}
                readOnly={esAprendiz}
                required
                placeholder="Nombre completo"
                className={`w-full border p-2.5 rounded-xl font-mono focus:outline-none ${
                  esAprendiz
                    ? "bg-slate-900/50 border-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 border-slate-800 text-white focus:border-sena-green"
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Ficha</label>
              <input
                value={ficha}
                onChange={(e) => setFicha(e.target.value)}
                readOnly={esAprendiz}
                required
                placeholder="2879451"
                className={`w-full border p-2.5 rounded-xl font-mono focus:outline-none ${
                  esAprendiz
                    ? "bg-slate-900/50 border-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 border-slate-800 text-white focus:border-sena-green"
                }`}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-slate-400 mb-1 font-mono">Equipo a prestar</label>
              <select
                value={equipoPlaca}
                onChange={(e) => setEquipoPlaca(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
              >
                <option value="">Selecciona un equipo disponible...</option>
                {equiposDisponibles.map((eq) => (
                  <option key={eq.id} value={eq.placaSena}>
                    {eq.placaSena} — {eq.marcaModelo} ({eq.ram})
                  </option>
                ))}
              </select>
              {equiposDisponibles.length === 0 && (
                <span className="text-[10px] text-rose-400 mt-1 block">
                  No hay equipos operativos disponibles en este momento.
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={equiposDisponibles.length === 0}
              className="bg-sena-green disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-xs"
            >
              Confirmar Préstamo
            </button>
          </div>
        </form>
      )}

      {/* Préstamos activos */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">
          📋 Activos ({prestamosActivos.length})
        </h4>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {prestamosActivos.length === 0 && (
            <p className="text-xs text-slate-500 p-4">No hay préstamos activos en este momento.</p>
          )}
          {prestamosActivos.map((p) => (
            <div key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-white">{p.aprendiz}</span>
                <span className="text-slate-500"> · Ficha {p.ficha}</span>
                <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                  {p.equipoPlaca} · {p.horaInicio} · {p.fecha}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg font-mono ${
                    p.creadoPorRol === "Aprendiz"
                      ? "bg-sena-green/20 text-sena-green"
                      : "bg-sky-500/20 text-sky-400"
                  }`}
                >
                  {p.creadoPorRol === "Aprendiz" ? "Autoservicio" : "Asignado por Operario"}
                </span>
                <button
                  onClick={() => devolverPrestamo(p.id)}
                  className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-all"
                >
                  ✔ Marcar Devuelto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">
          🗂️ Historial ({historial.length})
        </h4>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl divide-y divide-slate-800 max-h-72 overflow-y-auto custom-scrollbar">
          {historial.map((p) => (
            <div key={p.id} className="p-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-300">
                {p.aprendiz} <span className="text-slate-600">· Ficha {p.ficha}</span>
              </span>
              <span className="font-mono text-slate-500">
                {p.equipoPlaca} · {p.fecha} · {p.horaInicio}
              </span>
              <span className="text-slate-600 font-mono">Devuelto</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
