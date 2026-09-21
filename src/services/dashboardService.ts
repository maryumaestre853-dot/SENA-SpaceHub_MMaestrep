// =================================================================
// Archivo: src/services/dashboardService.ts
// CAPA DE SERVICIO: consume el endpoint analítico GET /dashboard/stats
// =================================================================
import { apiFetch } from './api';

export interface LaboratorioOcupacion {
  nombre: string;
  porcentaje: number;
  activo: boolean;
}

export interface PrestamoSemanal {
  dia: string;
  cantidad: number;
  porcentajeAltura: number;
  destacado: boolean; // el día con más préstamos (barra resaltada)
}

export interface DashboardStats {
  totalEquipos: number;
  equiposOperativos: number;
  equiposMantenimiento: number;
  prestamosActivos: number;
  tasaOcupacionGlobal: string;
  incidencias: {
    total: number;
    alta: number;
    media: number;
  };
  laboratoriosOcupacion: LaboratorioOcupacion[];
  prestamosSemana: PrestamoSemanal[];
}

export const dashboardService = {
  // GET /api/v1/dashboard/stats
  getStats: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>('/dashboard/stats');
  },
};

export default dashboardService;
