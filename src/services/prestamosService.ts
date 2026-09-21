// =================================================================
// Archivo: src/services/prestamosService.ts
// CAPA DE SERVICIO: dominio de Préstamos.
//   GET  /api/v1/prestamos
//   POST /api/v1/prestamos
//   PUT  /api/v1/prestamos/:id/devolver
// =================================================================
import { apiFetch } from './api';

export interface Prestamo {
  id: number;
  usuarioId: number;
  aprendiz: string;
  ficha: string;
  equipoPlaca: string;
  horaInicio: string;
  fecha: string; // ISO yyyy-mm-dd
  estado: 'Activo' | 'Devuelto';
  creadoPorRol: 'Administrador' | 'Aprendiz' | 'Instructor';
}

// - Aprendiz: solo envía equipoPlaca (el servidor toma nombre y ficha de su cuenta / token).
// - Administrador / Instructor: envía además aprendiz (nombre) y ficha, como en el simulador.
export interface NuevoPrestamo {
  equipoPlaca: string;
  aprendiz?: string;
  ficha?: string;
  aprendizId?: number; // alternativa: ID numérico de un usuario existente
}

export const prestamosService = {
  getAll: async (): Promise<Prestamo[]> => {
    return apiFetch<Prestamo[]>('/prestamos');
  },

  create: async (data: NuevoPrestamo): Promise<Prestamo> => {
    return apiFetch<Prestamo>('/prestamos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  devolver: async (id: number): Promise<Prestamo> => {
    return apiFetch<Prestamo>(`/prestamos/${id}/devolver`, {
      method: 'PUT',
    });
  },
};

export default prestamosService;
