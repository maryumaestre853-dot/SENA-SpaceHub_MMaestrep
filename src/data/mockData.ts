// ============================================================================
// 📁 src/data/mockData.ts
// Simula el resultado de "SELECT * FROM ..." sobre cada tabla de Postgres.
// Cuando conectes el backend real, este archivo se reemplaza por llamadas a
// tu API (ej. GET /api/equipos) — las interfaces de spacehub.types.ts no cambian.
// ============================================================================

import type {
  AmbienteData,
  EquipoData,
  PrestamoData,
  IncidenciaData,
} from "../types/spacehub.types";

// SELECT * FROM ambientes;
export const ambientesData: AmbienteData[] = [
  { id: 1, codigo: "301", nombre: "Desarrollo Web (ADSO)", capacidadEquipos: 5 },
  { id: 2, codigo: "302", nombre: "Redes y Bases de Datos", capacidadEquipos: 4 },
  { id: 3, codigo: "303", nombre: "Mantenimiento Hardware", capacidadEquipos: 3 },
];

// SELECT * FROM equipos;
export const equiposIniciales: EquipoData[] = [
  { id: 1, placaSena: "SENA-1001", marcaModelo: "Lenovo ThinkPad L14 G3", ram: "16GB DDR4", estado: "Operativo", ambienteId: 1 },
  { id: 2, placaSena: "SENA-1002", marcaModelo: "HP ProBook 440 G8", ram: "16GB DDR4", estado: "En Mantenimiento", ambienteId: 2 },
  { id: 3, placaSena: "SENA-1003", marcaModelo: "Dell Latitude 3420", ram: "32GB DDR5", estado: "Operativo", ambienteId: 1 },
  { id: 4, placaSena: "SENA-1004", marcaModelo: "Lenovo ThinkPad L14 G3", ram: "16GB DDR4", estado: "Operativo", ambienteId: 2 },
  { id: 5, placaSena: "SENA-1005", marcaModelo: "ASUS ExpertBook P2", ram: "8GB DDR4", estado: "Operativo", ambienteId: 3 },
];

// SELECT * FROM prestamos;  (fechas = semana del 17 al 21 de agosto de 2026)
export const prestamosIniciales: PrestamoData[] = [
  { id: 1, usuarioId: 101, aprendiz: "Ana María Fajardo", ficha: "2879451", equipoPlaca: "SENA-1001", horaInicio: "08:00 AM", fecha: "2026-08-19", estado: "Activo", creadoPorRol: "Aprendiz" },
  { id: 2, usuarioId: 102, aprendiz: "Carlos Mendoza", ficha: "2879451", equipoPlaca: "SENA-1003", horaInicio: "09:30 AM", fecha: "2026-08-19", estado: "Activo", creadoPorRol: "Aprendiz" },
  { id: 3, usuarioId: 103, aprendiz: "Jennifer Andrea", ficha: "2879432", equipoPlaca: "SENA-1004", horaInicio: "10:15 AM", fecha: "2026-08-19", estado: "Activo", creadoPorRol: "Administrador" },
  { id: 4, usuarioId: 104, aprendiz: "Luis Fernando Rico", ficha: "2879410", equipoPlaca: "SENA-1005", horaInicio: "07:45 AM", fecha: "2026-08-17", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 5, usuarioId: 105, aprendiz: "Marcela Ortiz", ficha: "2879455", equipoPlaca: "SENA-1002", horaInicio: "08:20 AM", fecha: "2026-08-17", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 6, usuarioId: 101, aprendiz: "Ana María Fajardo", ficha: "2879451", equipoPlaca: "SENA-1003", horaInicio: "09:00 AM", fecha: "2026-08-18", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 7, usuarioId: 106, aprendiz: "Diego Salazar", ficha: "2879460", equipoPlaca: "SENA-1004", horaInicio: "10:00 AM", fecha: "2026-08-18", estado: "Devuelto", creadoPorRol: "Administrador" },
  { id: 8, usuarioId: 107, aprendiz: "Paula Beltrán", ficha: "2879470", equipoPlaca: "SENA-1001", horaInicio: "11:00 AM", fecha: "2026-08-18", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 9, usuarioId: 102, aprendiz: "Carlos Mendoza", ficha: "2879451", equipoPlaca: "SENA-1005", horaInicio: "08:10 AM", fecha: "2026-08-20", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 10, usuarioId: 108, aprendiz: "Sara Gómez", ficha: "2879480", equipoPlaca: "SENA-1002", horaInicio: "09:15 AM", fecha: "2026-08-20", estado: "Devuelto", creadoPorRol: "Administrador" },
  { id: 11, usuarioId: 103, aprendiz: "Jennifer Andrea", ficha: "2879432", equipoPlaca: "SENA-1003", horaInicio: "07:50 AM", fecha: "2026-08-20", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 12, usuarioId: 104, aprendiz: "Luis Fernando Rico", ficha: "2879410", equipoPlaca: "SENA-1001", horaInicio: "08:00 AM", fecha: "2026-08-21", estado: "Devuelto", creadoPorRol: "Aprendiz" },
  { id: 13, usuarioId: 105, aprendiz: "Marcela Ortiz", ficha: "2879455", equipoPlaca: "SENA-1004", horaInicio: "09:40 AM", fecha: "2026-08-21", estado: "Devuelto", creadoPorRol: "Aprendiz" },
];

// SELECT * FROM incidencias WHERE resuelta = false;
export const incidenciasIniciales: IncidenciaData[] = [
  { id: 1, placaSena: "SENA-1002", descripcion: "Falla en el teclado y puerto HDMI intermitente", prioridad: "Alta", resuelta: false },
  { id: 2, placaSena: "SENA-1005", descripcion: "Batería no retiene carga más de 30 minutos", prioridad: "Media", resuelta: false },
];
