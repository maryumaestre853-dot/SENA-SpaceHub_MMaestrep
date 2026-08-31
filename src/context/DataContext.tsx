// ============================================================================
// 📁 src/context/DataContext.tsx
// Única fuente de verdad para equipos / préstamos / incidencias. Antes,
// DashboardPage importaba mockData.ts directamente y solo LEÍA los arreglos;
// ahora EquiposPage, PrestamosPage e IncidenciasPage necesitan también
// ESCRIBIR (agregar equipo, registrar préstamo, resolver ticket), así que ese
// estado sube a un Context — igual que ya se hizo con la sesión en
// AuthContext.tsx — para que TODOS los módulos (incluido el Dashboard) lean
// siempre la misma versión actualizada, sin pasar props a mano por 3 niveles.
//
// Cuando conectes el backend real: cada función `agregarX` / `cambiarX` de
// aquí se vuelve un `fetch(..., { method: 'POST' | 'PATCH' })` contra la API
// que consulta este mismo database/schema.sql. Los componentes que consumen
// useSpaceHubData() no cambian ni una línea.
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  AmbienteData,
  EquipoData,
  EstadoEquipo,
  IncidenciaData,
  PrestamoData,
  PrioridadIncidencia,
  UsuarioData,
} from "../types/spacehub.types";
import {
  ambientesData,
  equiposIniciales,
  incidenciasIniciales,
  prestamosIniciales,
} from "../data/mockData";

// ---- Payloads de las acciones (lo que exige cada formulario) --------------

/** Datos que pide el formulario "Agregar equipo" (rol Administrador/Instructor) */
export interface NuevoEquipoPayload {
  placaSena: string;
  marcaModelo: string;
  ram: string;
  ambienteId: number;
}

/**
 * Datos que pide el formulario "Solicitar préstamo". `usuarioId`, `aprendiz`
 * y `ficha` NO se piden por teclado cuando el rol es Aprendiz: se toman del
 * AuthContext y se inyectan aquí ya resueltos (ver PrestamosPage.tsx).
 */
export interface NuevoPrestamoPayload {
  usuarioId: number;
  aprendiz: string;
  ficha: string;
  equipoPlaca: string;
}

/** Datos que pide el formulario "Reportar incidencia" */
export interface NuevaIncidenciaPayload {
  placaSena: string;
  descripcion: string;
  prioridad: PrioridadIncidencia;
}

interface SpaceHubDataState {
  ambientes: AmbienteData[];
  equipos: EquipoData[];
  prestamos: PrestamoData[];
  incidencias: IncidenciaData[];

  agregarEquipo: (payload: NuevoEquipoPayload) => void;
  cambiarEstadoEquipo: (placaSena: string, estado: EstadoEquipo) => void;

  /** `usuarioQueRegistra` decide si `creadoPorRol` queda en 'Aprendiz' o 'Administrador' (RBAC) */
  registrarPrestamo: (
    payload: NuevoPrestamoPayload,
    usuarioQueRegistra: UsuarioData
  ) => void;
  devolverPrestamo: (id: number) => void;

  reportarIncidencia: (payload: NuevaIncidenciaPayload) => void;
  resolverIncidencia: (id: number) => void;
}

const DataContext = createContext<SpaceHubDataState | undefined>(undefined);

function horaActualLegible(): string {
  return new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function fechaActualISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [equipos, setEquipos] = useState<EquipoData[]>(equiposIniciales);
  const [prestamos, setPrestamos] = useState<PrestamoData[]>(prestamosIniciales);
  const [incidencias, setIncidencias] = useState<IncidenciaData[]>(incidenciasIniciales);

  const agregarEquipo = useCallback((payload: NuevoEquipoPayload) => {
    // En producción: POST /api/equipos -> INSERT INTO equipos (...)
    setEquipos((prev) => [
      ...prev,
      {
        id: Date.now(),
        placaSena: payload.placaSena,
        marcaModelo: payload.marcaModelo,
        ram: payload.ram,
        estado: "Operativo",
        ambienteId: payload.ambienteId,
      },
    ]);
  }, []);

  const cambiarEstadoEquipo = useCallback((placaSena: string, estado: EstadoEquipo) => {
    // En producción: PATCH /api/equipos/:id { estado }
    setEquipos((prev) =>
      prev.map((eq) => (eq.placaSena === placaSena ? { ...eq, estado } : eq))
    );
  }, []);

  const registrarPrestamo = useCallback(
    (payload: NuevoPrestamoPayload, usuarioQueRegistra: UsuarioData) => {
      // En producción: POST /api/prestamos -> INSERT INTO prestamos (...)
      setPrestamos((prev) => [
        {
          id: Date.now(),
          usuarioId: payload.usuarioId,
          aprendiz: payload.aprendiz,
          ficha: payload.ficha,
          equipoPlaca: payload.equipoPlaca,
          horaInicio: horaActualLegible(),
          fecha: fechaActualISO(),
          estado: "Activo",
          // La marca de "quién lo registró" es lo que el RBAC usa para diferenciar
          // en el histórico un autoservicio (Aprendiz) de una asignación (Operario)
          creadoPorRol: usuarioQueRegistra.rol,
        },
        ...prev,
      ]);
    },
    []
  );

  const devolverPrestamo = useCallback((id: number) => {
    // En producción: PATCH /api/prestamos/:id { estado: 'Devuelto', hora_fin: now() }
    setPrestamos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "Devuelto" } : p))
    );
  }, []);

  const reportarIncidencia = useCallback((payload: NuevaIncidenciaPayload) => {
    // En producción: POST /api/incidencias -> INSERT INTO incidencias (...)
    setIncidencias((prev) => [
      {
        id: Date.now(),
        placaSena: payload.placaSena,
        descripcion: payload.descripcion,
        prioridad: payload.prioridad,
        resuelta: false,
      },
      ...prev,
    ]);
  }, []);

  const resolverIncidencia = useCallback((id: number) => {
    // En producción: PATCH /api/incidencias/:id { resuelta: true, fecha_resolucion: now() }
    setIncidencias((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resuelta: true } : i))
    );
  }, []);

  const value: SpaceHubDataState = {
    ambientes: ambientesData,
    equipos,
    prestamos,
    incidencias,
    agregarEquipo,
    cambiarEstadoEquipo,
    registrarPrestamo,
    devolverPrestamo,
    reportarIncidencia,
    resolverIncidencia,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useSpaceHubData(): SpaceHubDataState {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useSpaceHubData() debe usarse dentro de un <DataProvider>");
  }
  return ctx;
}
