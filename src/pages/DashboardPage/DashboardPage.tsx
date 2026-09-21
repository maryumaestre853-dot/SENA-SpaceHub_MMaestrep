// ============================================================================
// 📁 src/pages/DashboardPage/DashboardPage.tsx
// Módulo "Dashboard" idéntico al simulador de la Sesión 3 (punto 4):
// 4 tarjetas KPI, ocupación por laboratorio y "Distribución de Estado e
// Historial" (donut + préstamos semanales). Todo llega de
// GET /dashboard/stats (dashboardService), nada está quemado en el frontend.
// ============================================================================
import { useEffect, useState } from 'react';
import { dashboardService, type DashboardStats } from '../../services/dashboardService';

// Colores por nivel de ocupación (90% verde · 75% azul · 40% ámbar, como en el simulador)
const colorBarraPorNivel = (pct: number) => {
  if (pct >= 80) return 'bg-sena-green';
  if (pct >= 50) return 'bg-sky-400';
  return 'bg-amber-400';
};

const colorTextoPorNivel = (pct: number) => {
  if (pct >= 80) return 'text-sena-green';
  if (pct >= 50) return 'text-sky-400';
  return 'text-amber-400';
};

// Tailwind necesita ver las clases completas: por eso no se arman con `bg-sena-green/${n}`
const claseBarraSemanal = (pct: number, destacado: boolean) => {
  if (destacado) return 'bg-sena-green shadow-sm shadow-sena-green/50';
  if (pct >= 80) return 'bg-sena-green/90';
  if (pct >= 70) return 'bg-sena-green/80';
  if (pct >= 60) return 'bg-sena-green/70';
  return 'bg-sena-green/60';
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de datos desde el servidor al montar la página ---
  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar los indicadores');
      } finally {
        setLoading(false);
      }
    };
    cargarStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400 font-mono text-xs animate-pulse">
        Cargando indicadores desde el servidor...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">
        {error || 'No se pudieron cargar los indicadores.'}
      </div>
    );
  }

  const pctOperativos =
    stats.totalEquipos > 0 ? Math.round((stats.equiposOperativos / stats.totalEquipos) * 100) : 0;
  const pctMantenimiento = stats.totalEquipos > 0 ? 100 - pctOperativos : 0;

  // "Laboratorios 301 y 302 activos": números de los ambientes marcados como activos
  const numerosActivos = stats.laboratoriosOcupacion
    .filter((lab) => lab.activo)
    .map((lab) => lab.nombre.match(/\d+/)?.[0])
    .filter((n): n is string => Boolean(n));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-plaster">Panel Principal de Ambientes y Tecnología</h3>
          <p className="text-xs text-slate-400">Indicadores en tiempo real de laboratorios de cómputo</p>
        </div>
        <span className="text-xs text-sena-green font-mono bg-sena-green/10 border border-sena-green/30 px-3 py-1 rounded-full">
          🟢 Estado del Sistema: Óptimo
        </span>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total Equipos Cómputo</span>
          <div className="text-2xl font-black text-plaster">{stats.totalEquipos}</div>
          <span className="text-[10px] text-emerald-400">
            ● {stats.equiposOperativos} Operativos / {stats.equiposMantenimiento} Mantenimiento
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Préstamos Activos</span>
          <div className="text-2xl font-black text-sena-green">{stats.prestamosActivos}</div>
          <span className="text-[10px] text-sena-green">En uso por aprendices ADSO</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Ocupación Ambientes</span>
          <div className="text-2xl font-black text-sky-400">{stats.tasaOcupacionGlobal}</div>
          <span className="text-[10px] text-sky-400">
            Laboratorios {numerosActivos.join(' y ')} activos
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Incidencias de Hardware</span>
          <div className="text-2xl font-black text-amber-400">{stats.incidencias.total}</div>
          <span className="text-[10px] text-amber-400">
            {stats.incidencias.alta} Prioridad Alta / {stats.incidencias.media} Media
          </span>
        </div>
      </div>

      {/* Gráficos del Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Ocupación por laboratorio */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
            <span>📈 Tasa de Ocupación por Laboratorio</span>
            <span className="text-[10px] text-sena-green">En tiempo real</span>
          </h4>

          <div className="space-y-3 text-xs font-mono">
            {stats.laboratoriosOcupacion.map((lab) => (
              <div key={lab.nombre}>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{lab.nombre}</span>
                  <span className={`font-bold ${colorTextoPorNivel(lab.porcentaje)}`}>{lab.porcentaje}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorBarraPorNivel(lab.porcentaje)}`}
                    style={{ width: `${lab.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Donut de estado + préstamos semanales */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
            <span>📊 Distribución de Estado e Historial</span>
            <span className="text-[10px] text-slate-400">Semana Actual</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Donut Chart SVG */}
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
                  <span className="text-base font-bold text-plaster leading-none">{stats.totalEquipos}</span>
                  <span className="block text-[8px] text-slate-400 uppercase font-mono">Equipos</span>
                </div>
              </div>
              <div className="flex gap-2 text-[9px] font-mono mt-2">
                <span className="text-sena-green">● Operativos ({stats.equiposOperativos})</span>
                <span className="text-amber-400">● Mantenimiento ({stats.equiposMantenimiento})</span>
              </div>
            </div>

            {/* Barras semanales */}
            <div className="space-y-1 text-[10px] font-mono">
              <span className="text-slate-400 font-bold block mb-1">Préstamos Semanales:</span>
              <div className="flex items-end justify-between h-20 pt-3 px-2 bg-slate-900 rounded-xl border border-slate-800">
                {stats.prestamosSemana.map((d) => (
                  <div key={d.dia} className="flex flex-col items-center justify-end h-full gap-0.5">
                    <div
                      className={`w-3 rounded-t ${claseBarraSemanal(d.porcentajeAltura, d.destacado)}`}
                      style={{ height: `${Math.round(d.porcentajeAltura * 0.5)}px` }}
                      title={`${d.dia}: ${d.cantidad} préstamos`}
                    />
                    <span className={d.destacado ? 'text-sena-green font-bold text-[8px]' : 'text-slate-500 text-[8px]'}>
                      {d.dia}
                    </span>
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
