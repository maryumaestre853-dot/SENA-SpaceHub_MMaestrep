// =================================================================
// Archivo: src/services/incidenciasService.ts
// CAPA DE SERVICIO: dominio de Incidencias (Ticketera).
// Cualquier usuario autenticado puede reportar y resolver tickets
// (igual que en el simulador de la Sesión 3).
// =================================================================
import { apiFetch } from './api';

export interface Incidencia {
  id: number;
  placaSena: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  resuelta: boolean;
}

export const incidenciasService = {
  // GET /api/v1/incidencias
  getAll: async (): Promise<Incidencia[]> => {
    return apiFetch<Incidencia[]>('/incidencias');
  },

  // POST /api/v1/incidencias
  create: async (data: Pick<Incidencia, 'placaSena' | 'descripcion' | 'prioridad'>): Promise<Incidencia> => {
    return apiFetch<Incidencia>('/incidencias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT /api/v1/incidencias/:id/resolver
  resolver: async (id: number): Promise<Incidencia> => {
    return apiFetch<Incidencia>(`/incidencias/${id}/resolver`, {
      method: 'PUT',
    });
  },
};

export default incidenciasService;
