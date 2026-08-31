// ============================================================================
// 📁 src/hooks/useDashboardStats.ts
// Aquí NO hay números "quemados". Todo KPI y toda barra se recalculan a partir
// de los arreglos equipos / prestamos / incidencias. Esto es el equivalente en
// el frontend a las vistas SQL `vista_dashboard_kpis` y
// `vista_ocupacion_ambientes` de database/schema.sql — misma lógica, dos capas.
//
// Resultado práctico: si alguien devuelve un préstamo, cambia el estado de un
// equipo a "En Mantenimiento", o resuelve un ticket, TODAS las barras y KPIs
// del dashboard se actualizan solos en el siguiente render. Nada queda
// desincronizado.
// ============================================================================

import { useMemo } from "react";
import type {
  AmbienteData,
  DashboardKPIs,
  EquipoData,
  IncidenciaData,
  OcupacionAmbiente,
  PrestamoData,
  PrestamosPorDia,
} from "../types/spacehub.types";

interface UseDashboardStatsParams {
  equipos: EquipoData[];
  prestamos: PrestamoData[];
  incidencias: IncidenciaData[];
  ambientes: AmbienteData[];
}

const ORDEN_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"] as const;
const MAPA_DIA_JS: Record<number, (typeof ORDEN_DIAS)[number]> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
};

function obtenerDiaSemana(fechaISO: string): (typeof ORDEN_DIAS)[number] | null {
  const diaJS = new Date(`${fechaISO}T00:00:00`).getDay(); // 0=Dom ... 6=Sáb
  return MAPA_DIA_JS[diaJS] ?? null;
}

export function useDashboardStats({
  equipos,
  prestamos,
  incidencias,
  ambientes,
}: UseDashboardStatsParams) {
  // ---- Ocupación por ambiente: equipos con préstamo activo / total equipos ----
  const ocupacionPorAmbiente: OcupacionAmbiente[] = useMemo(() => {
    const ambienteDeCadaEquipo = new Map(
      equipos.map((eq) => [eq.placaSena, eq.ambienteId])
    );

    return ambientes.map((amb) => {
      const equiposDelAmbiente = equipos.filter((eq) => eq.ambienteId === amb.id);
      const totalEquipos = equiposDelAmbiente.length;

      const equiposEnPrestamo = prestamos.filter(
        (p) =>
          p.estado === "Activo" &&
          ambienteDeCadaEquipo.get(p.equipoPlaca) === amb.id
      ).length;

      const porcentajeOcupacion =
        totalEquipos > 0 ? Math.round((equiposEnPrestamo / totalEquipos) * 100) : 0;

      return {
        ambienteId: amb.id,
        codigo: amb.codigo,
        nombre: amb.nombre,
        totalEquipos,
        equiposEnPrestamo,
        porcentajeOcupacion,
      };
    });
  }, [ambientes, equipos, prestamos]);

  const ocupacionPromedio = useMemo(() => {
    if (ocupacionPorAmbiente.length === 0) return 0;
    const suma = ocupacionPorAmbiente.reduce((acc, o) => acc + o.porcentajeOcupacion, 0);
    return Math.round(suma / ocupacionPorAmbiente.length);
  }, [ocupacionPorAmbiente]);

  // ---- KPIs generales -----------------------------------------------------
  const kpis: DashboardKPIs = useMemo(() => {
    const pendientes = incidencias.filter((i) => !i.resuelta);

    return {
      totalEquipos: equipos.length,
      equiposOperativos: equipos.filter((e) => e.estado === "Operativo").length,
      equiposMantenimiento: equipos.filter((e) => e.estado === "En Mantenimiento").length,
      prestamosActivos: prestamos.filter((p) => p.estado === "Activo").length,
      incidenciasPendientes: pendientes.length,
      incidenciasAlta: pendientes.filter((i) => i.prioridad === "Alta").length,
      ocupacionPromedio,
    };
  }, [equipos, prestamos, incidencias, ocupacionPromedio]);

  // ---- Préstamos por día de la semana (para el gráfico de barras) --------
  const prestamosPorDia: PrestamosPorDia[] = useMemo(() => {
    const conteos: Record<string, number> = { Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0 };

    prestamos.forEach((p) => {
      const dia = obtenerDiaSemana(p.fecha);
      if (dia) conteos[dia] += 1;
    });

    const maxConteo = Math.max(...Object.values(conteos), 1);

    return ORDEN_DIAS.map((dia) => ({
      dia,
      cantidad: conteos[dia],
      porcentajeAltura: Math.round((conteos[dia] / maxConteo) * 100),
    }));
  }, [prestamos]);

  return { kpis, ocupacionPorAmbiente, prestamosPorDia };
}
