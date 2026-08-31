// ============================================================================
// 📁 src/context/AuthContext.tsx
// Estado global de sesión. Cualquier componente puede leer el rol activo con
// el hook useAuth() y reaccionar (autocompletar formularios, ocultar botones
// de administrador, etc.) sin tener que pasar props manualmente por cada nivel.
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthState,
  LoginCredentials,
  RegistroData,
  RolUsuario,
  UsuarioData,
} from "../types/spacehub.types";

const AuthContext = createContext<AuthState | undefined>(undefined);

// Usuarios de prueba — en producción esto SIEMPRE se valida contra la tabla
// `usuarios` de Postgres (columna password_hash) desde un backend, nunca en
// el cliente. Aquí solo simulamos la respuesta de esa API.
const USUARIOS_DEMO: Record<string, UsuarioData & { password: string }> = {
  "ana.fajardo@sena.edu.co": {
    id: 101,
    nombreCompleto: "Ana María Fajardo",
    correo: "ana.fajardo@sena.edu.co",
    ficha: "2879451",
    rol: "Aprendiz",
    password: "123456",
  },
  "roberto.gomez@sena.edu.co": {
    id: 999,
    nombreCompleto: "Ing. Roberto Gómez",
    correo: "roberto.gomez@sena.edu.co",
    ficha: "STAFF-TI",
    rol: "Administrador",
    password: "123456",
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Por defecto arrancamos con la Aprendiz logueada, igual que el prototipo original
  const [user, setUser] = useState<UsuarioData | null>(
    USUARIOS_DEMO["ana.fajardo@sena.edu.co"]
  );

  const login = useCallback(async ({ correo, password }: LoginCredentials) => {
    // ---- EN PRODUCCIÓN ----
    // const res = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ correo, password }),
    // });
    // const usuario: UsuarioData = await res.json();
    // setUser(usuario);

    const encontrado = USUARIOS_DEMO[correo.toLowerCase()];
    if (encontrado && encontrado.password === password) {
      const { password: _pw, ...usuario } = encontrado;
      setUser(usuario);
      return;
    }

    // Fallback solo para la demo: infiere el rol por el correo digitado
    let rolInferido: RolUsuario = "Aprendiz";
    if (correo.includes("admin") || correo.includes("roberto")) rolInferido = "Administrador";
    else if (correo.includes("instructor")) rolInferido = "Instructor";

    setUser({
      id: Date.now(),
      nombreCompleto: correo.split("@")[0].replace(".", " ").toUpperCase(),
      correo,
      ficha: rolInferido === "Aprendiz" ? "2879451" : "STAFF-TI",
      rol: rolInferido,
    });
  }, []);

  const loginRapido = useCallback((rol: RolUsuario) => {
    if (rol === "Aprendiz") setUser(USUARIOS_DEMO["ana.fajardo@sena.edu.co"]);
    else if (rol === "Administrador") setUser(USUARIOS_DEMO["roberto.gomez@sena.edu.co"]);
  }, []);

  const registro = useCallback((data: RegistroData) => {
    // En producción: POST /api/auth/registro -> INSERT INTO usuarios (...)
    setUser({
      id: Date.now(),
      nombreCompleto: data.nombreCompleto,
      correo: data.correo,
      ficha: data.ficha || "2879451",
      rol: data.rol,
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value: AuthState = {
    user,
    isAuthenticated: user !== null,
    login,
    loginRapido,
    registro,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() debe usarse dentro de un <AuthProvider>");
  }
  return ctx;
}
