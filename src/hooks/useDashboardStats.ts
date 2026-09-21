// ============================================================================
// 📁 src/hooks/useDashboardStats.ts
// Ningún número aquí está "quemado": todo KPI, barra y porcentaje se calcula
// en vivo a partir de equipos / préstamos / incidencias que llegan de la API
// (ver DataContext.tsx). Si el backend cambia esos arreglos, este hook
// recalcula todo solo en el siguiente render.
// ============================================================================

import { useMemo } from 'react';
import type { Equipo } from '../services/equiposService';
import type { Prestamo } from '../services/prestamosService';
import type { Incidencia } from '../services/incidenciasService';

export interface DashboardKPIs {
  totalEquipos: number;
  equiposOperativos: number;
  equiposMantenimiento: number;
  prestamosActivos: number;
  incidenciasPendientes: number;
  incidenciasAlta: number;
  ocupacionPromedio: number;
}

export interface OcupacionAmbiente {
  nombre: string;
  totalEquipos: number;
  equiposEnPrestamo: number;
  porcentajeOcupacion: number;
}

export interface PrestamosPorDia {
  dia: 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie';
  cantidad: number;
  porcentajeAltura: number;
}

interface UseDashboardStatsParams {
  equipos: Equipo[];
  prestamos: Prestamo[];
  incidencias: Incidencia[];
}

const ORDEN_DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] as const;
const MAPA_DIA_JS: Record<number, (typeof ORDEN_DIAS)[number]> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
};

function obtenerDiaSemana(fechaISO: string): (typeof ORDEN_DIAS)[number] | null {
  const diaJS = new Date(`${fechaISO}T00:00:00`).getDay();
  return MAPA_DIA_JS[diaJS] ?? null;
}

export function useDashboardStats({ equipos, prestamos, incidencias }: UseDashboardStatsParams) {
  // ---- Ocupación por ambiente: agrupamos equipos por su campo `ambiente` ----
  const ocupacionPorAmbiente: OcupacionAmbiente[] = useMemo(() => {
    const ambienteDeCadaEquipo = new Map(equipos.map((eq) => [eq.placaSena, eq.ambiente]));
    const nombresAmbiente = Array.from(new Set(equipos.map((eq) => eq.ambiente)));

    return nombresAmbiente.map((nombre) => {
      const equiposDelAmbiente = equipos.filter((eq) => eq.ambiente === nombre);
      const totalEquipos = equiposDelAmbiente.length;

      const equiposEnPrestamo = prestamos.filter(
        (p) => p.estado === 'Activo' && ambienteDeCadaEquipo.get(p.equipoPlaca) === nombre
      ).length;

      const porcentajeOcupacion =
        totalEquipos > 0 ? Math.round((equiposEnPrestamo / totalEquipos) * 100) : 0;

      return { nombre, totalEquipos, equiposEnPrestamo, porcentajeOcupacion };
    });
  }, [equipos, prestamos]);

  const ocupacionPromedio = useMemo(() => {
    if (ocupacionPorAmbiente.length === 0) return 0;
    const suma = ocupacionPorAmbiente.reduce((acc, o) => acc + o.porcentajeOcupacion, 0);
    return Math.round(suma / ocupacionPorAmbiente.length);
  }, [ocupacionPorAmbiente]);

  // ---- KPIs generales -------------------------------------------------------
  const kpis: DashboardKPIs = useMemo(() => {
    const pendientes = incidencias.filter((i) => !i.resuelta);

    return {
      totalEquipos: equipos.length,
      equiposOperativos: equipos.filter((e) => e.estado === 'Operativo').length,
      equiposMantenimiento: equipos.filter((e) => e.estado === 'En Mantenimiento').length,
      prestamosActivos: prestamos.filter((p) => p.estado === 'Activo').length,
      incidenciasPendientes: pendientes.length,
      incidenciasAlta: pendientes.filter((i) => i.prioridad === 'Alta').length,
      ocupacionPromedio,
    };
  }, [equipos, prestamos, incidencias, ocupacionPromedio]);

  // ---- Préstamos por día de la semana (gráfico de barras) -------------------
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
