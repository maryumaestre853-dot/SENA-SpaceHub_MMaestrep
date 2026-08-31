// ============================================================================
// 📁 src/types/spacehub.types.ts
// Contratos de datos de SENA SpaceHub.
// IMPORTANTE: cada interfaz aquí refleja 1 a 1 una tabla de database/schema.sql
// Si cambias una columna en el SQL, actualiza también su interfaz aquí.
// ============================================================================

/** Identifica cuál de los 4 módulos de la SPA está visible ahora mismo (MainLayout) */
export type ModuloSpaceHub = "dashboard" | "equipos" | "prestamos" | "incidencias";

// ---- 1. UNION TYPES (coinciden con los CHECK constraints de Postgres) -----

/** Coincide con CHECK de la tabla `usuarios` */
export type RolUsuario = "Aprendiz" | "Instructor" | "Administrador";

/** Coincide con CHECK de la tabla `equipos` */
export type EstadoEquipo = "Operativo" | "En Mantenimiento" | "De Baja";

/** Coincide con CHECK de la tabla `prestamos` */
export type EstadoPrestamo = "Activo" | "Devuelto";

/** Coincide con CHECK de la tabla `incidencias` */
export type PrioridadIncidencia = "Alta" | "Media" | "Baja";

// ---- 2. TABLA: usuarios ----------------------------------------------------

/** Usuario autenticado. NUNCA incluye password/password_hash en el frontend. */
export interface UsuarioData {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: RolUsuario;
  /** Obligatorio (por lógica de negocio) cuando rol === 'Aprendiz' */
  ficha?: string;
}

/** Payload para POST /api/auth/login */
export interface LoginCredentials {
  correo: string;
  password: string;
}

/** Payload para POST /api/auth/registro */
export interface RegistroData {
  nombreCompleto: string;
  correo: string;
  ficha?: string;
  rol: RolUsuario;
  password: string;
}

// ---- 3. TABLA: ambientes (laboratorios) ------------------------------------

export interface AmbienteData {
  id: number;
  codigo: string; // ej. "301"
  nombre: string; // ej. "Desarrollo Web (ADSO)"
  capacidadEquipos: number;
}

// ---- 4. TABLA: equipos ------------------------------------------------------

export interface EquipoData {
  id: number;
  placaSena: string;
  marcaModelo: string;
  ram: string;
  estado: EstadoEquipo;
  ambienteId: number; // FK -> ambientes.id
}

// ---- 5. TABLA: prestamos ----------------------------------------------------

export interface PrestamoData {
  id: number;
  usuarioId: number; // FK -> usuarios.id (aprendiz solicitante)
  aprendiz: string; // nombre desnormalizado para pintar la UI sin otro join
  ficha: string;
  equipoPlaca: string;
  horaInicio: string; // hora legible, ej. "08:00 AM"
  fecha: string; // ISO yyyy-mm-dd, usada para el gráfico semanal
  estado: EstadoPrestamo;
  creadoPorRol: RolUsuario; // 'Aprendiz' (autoservicio) o 'Administrador' (operario)
}

// ---- 6. TABLA: incidencias ---------------------------------------------------

export interface IncidenciaData {
  id: number;
  placaSena: string;
  descripcion: string;
  prioridad: PrioridadIncidencia;
  resuelta: boolean;
}

// ---- 7. VALORES CALCULADOS (equivalentes a las VIEWS de Postgres) -----------

/** Espejo de la vista SQL `vista_dashboard_kpis` */
export interface DashboardKPIs {
  totalEquipos: number;
  equiposOperativos: number;
  equiposMantenimiento: number;
  prestamosActivos: number;
  incidenciasPendientes: number;
  incidenciasAlta: number;
  ocupacionPromedio: number;
}

/** Espejo de la vista SQL `vista_ocupacion_ambientes` (una fila por ambiente) */
export interface OcupacionAmbiente {
  ambienteId: number;
  codigo: string;
  nombre: string;
  totalEquipos: number;
  equiposEnPrestamo: number;
  porcentajeOcupacion: number;
}

/** Un punto del gráfico de préstamos por día de la semana */
export interface PrestamosPorDia {
  dia: "Lun" | "Mar" | "Mié" | "Jue" | "Vie";
  cantidad: number;
  porcentajeAltura: number; // relativo al día con más préstamos, para pintar la barra
}

// ---- 8. ESTADO GLOBAL DE AUTENTICACIÓN (React Context) -----------------------

export interface AuthState {
  user: UsuarioData | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginRapido: (rol: RolUsuario) => void;
  registro: (data: RegistroData) => void;
  logout: () => void;
}
