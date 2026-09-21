// ============================================================================
// 📁 src/context/DataContext.tsx
// Única fuente de verdad para equipos / préstamos / incidencias, ya venidos
// de la API real (no de un mock local). SenaHeader (contadores en las
// pestañas), DashboardPage (KPIs y gráficas) y EquiposPage leen todos de
// aquí, así que si registras/editas/eliminas un equipo y llamas a
// refrescarEquipos(), TODOS se enteran en el siguiente render.
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { equiposService, type Equipo } from '../services/equiposService';
import { prestamosService, type Prestamo } from '../services/prestamosService';
import { incidenciasService, type Incidencia } from '../services/incidenciasService';

interface SpaceHubDataState {
  equipos: Equipo[];
  prestamos: Prestamo[];
  incidencias: Incidencia[];
  loading: boolean;
  error: string | null;
  refrescarEquipos: () => Promise<void>;
  refrescarTodo: () => Promise<void>;
}

const DataContext = createContext<SpaceHubDataState | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refrescarEquipos = useCallback(async () => {
    const data = await equiposService.getAll();
    setEquipos(data);
  }, []);

  // "Cargando..." solo se muestra la primera vez; los refrescos posteriores
  // (crear/devolver/resolver) actualizan los datos sin parpadeo ni cerrar formularios.
  const cargaInicialHecha = useRef(false);

  const refrescarTodo = useCallback(async () => {
    try {
      if (!cargaInicialHecha.current) setLoading(true);
      setError(null);
      const [eq, pr, inc] = await Promise.all([
        equiposService.getAll(),
        prestamosService.getAll(),
        incidenciasService.getAll(),
      ]);
      setEquipos(eq);
      setPrestamos(pr);
      setIncidencias(inc);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de SpaceHub');
    } finally {
      cargaInicialHecha.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refrescarTodo();
  }, [refrescarTodo]);

  const value: SpaceHubDataState = {
    equipos,
    prestamos,
    incidencias,
    loading,
    error,
    refrescarEquipos,
    refrescarTodo,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useSpaceHubData(): SpaceHubDataState {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useSpaceHubData() debe usarse dentro de un <DataProvider>');
  }
  return ctx;
}
