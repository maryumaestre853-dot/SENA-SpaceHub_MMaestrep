// ============================================================================
// 📁 src/pages/DashboardPage.tsx
// Ningún porcentaje aquí está escrito a mano: todos vienen de useDashboardStats,
// que a su vez lee los arreglos equipos/prestamos/incidencias del DataContext
// (la misma fuente de verdad que usan EquiposPage, PrestamosPage e
// IncidenciasPage). Por eso, si agregas un equipo, registras un préstamo o
// resuelves un ticket en esos módulos, estas barras se mueven solas al volver
// aquí — nada queda desincronizado.
// ============================================================================

import { useDashboardStats } from "../hooks/useDashboardStats";
import { useSpaceHubData } from "../context/DataContext";

const COLOR_BARRA_POR_NIVEL = (pct: number) => {
  if (pct >= 75) return "bg-sena-green";
  if (pct >= 40) return "bg-sky-400";
  return "bg-amber-400";
};

const COLOR_TEXTO_POR_NIVEL = (pct: number) => {
  if (pct >= 75) return "text-sena-green";
  if (pct >= 40) return "text-sky-400";
  return "text-amber-400";
};

export function DashboardPage() {
  const { equipos, prestamos, incidencias, ambientes } = useSpaceHubData();
  const { kpis, ocupacionPorAmbiente, prestamosPorDia } = useDashboardStats({
    equipos,
    prestamos,
    incidencias,
    ambientes,
  });

  // Geometría del donut (stroke-dasharray sobre un círculo de perímetro 100)
  const pctOperativos =
    kpis.totalEquipos > 0 ? Math.round((kpis.equiposOperativos / kpis.totalEquipos) * 100) : 0;
  const pctMantenimiento = 100 - pctOperativos;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">
            Panel Principal de Ambientes y Tecnología
          </h3>
          <p className="text-xs text-slate-400">
            Indicadores calculados en vivo a partir del inventario, préstamos e incidencias
          </p>
        </div>
        <span className="text-xs text-sena-green font-mono bg-sena-green/10 border border-sena-green/30 px-3 py-1 rounded-full">
          🟢 Estado del Sistema: Óptimo
        </span>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
            Total Equipos Cómputo
          </span>
          <div className="text-2xl font-black text-white">{kpis.totalEquipos}</div>
          <span className="text-[10px] text-emerald-400">
            ● {kpis.equiposOperativos} Operativos / {kpis.equiposMantenimiento} Mantenimiento
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
            Préstamos Activos
          </span>
          <div className="text-2xl font-black text-sena-green">{kpis.prestamosActivos}</div>
          <span className="text-[10px] text-sena-green">En uso por aprendices ADSO</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
            Ocupación Ambientes
          </span>
          <div className="text-2xl font-black text-sky-400">{kpis.ocupacionPromedio}%</div>
          <span className="text-[10px] text-sky-400">Promedio de los {ambientes.length} laboratorios</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
            Incidencias de Hardware
          </span>
          <div className="text-2xl font-black text-amber-400">{kpis.incidenciasPendientes}</div>
          <span className="text-[10px] text-amber-400">
            {kpis.incidenciasAlta} Prioridad Alta / {kpis.incidenciasPendientes - kpis.incidenciasAlta} Media o Baja
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ocupación por laboratorio — barras calculadas por useDashboardStats */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
            <span>📈 Tasa de Ocupación por Laboratorio</span>
            <span className="text-[10px] text-sena-green">Calculado en vivo</span>
          </h4>

          <div className="space-y-3 text-xs font-mono">
            {ocupacionPorAmbiente.map((amb) => (
              <div key={amb.ambienteId}>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>
                    Ambiente {amb.codigo} - {amb.nombre}
                  </span>
                  <span className={`font-bold ${COLOR_TEXTO_POR_NIVEL(amb.porcentajeOcupacion)}`}>
                    {amb.porcentajeOcupacion}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${COLOR_BARRA_POR_NIVEL(
                      amb.porcentajeOcupacion
                    )}`}
                    style={{ width: `${amb.porcentajeOcupacion}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  {amb.equiposEnPrestamo} de {amb.totalEquipos} equipos en préstamo activo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut (operativos vs mantenimiento) + barras semanales */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
            <span>📊 Distribución de Estado e Historial</span>
            <span className="text-[10px] text-slate-400">Semana Actual</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-col items-center justify-center p-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-sena-green"
                    strokeDasharray={`${pctOperativos}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400"
                    strokeDasharray={`${pctMantenimiento}, 100`}
                    strokeDashoffset={`-${pctOperativos}`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-bold text-white leading-none">
                    {kpis.totalEquipos}
                  </span>
                  <span className="block text-[8px] text-slate-400 uppercase font-mono">
                    Equipos
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-[9px] font-mono mt-2">
                <span className="text-sena-green">
                  ● Operativos ({kpis.equiposOperativos})
                </span>
                <span className="text-amber-400">
                  ● Mantenimiento ({kpis.equiposMantenimiento})
                </span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <span className="text-slate-400 font-bold block mb-1">Préstamos Semanales:</span>
              <div className="flex items-end justify-between h-20 pt-3 px-2 bg-slate-900 rounded-xl border border-slate-800">
                {prestamosPorDia.map((d) => (
                  <div key={d.dia} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-3 bg-sena-green rounded-t transition-all duration-500"
                      style={{
                        height: `${Math.max(d.porcentajeAltura, 6)}%`,
                        opacity: d.cantidad === 0 ? 0.25 : 1,
                      }}
                      title={`${d.cantidad} préstamo(s)`}
                    />
                    <span className="text-slate-500 text-[8px]">{d.dia}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
