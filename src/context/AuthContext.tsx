// =================================================================
// Archivo: src/context/AuthContext.tsx
// Contexto global leyendo URL base de la API desde .env
// Manejo seguro de sesión utilizando sessionStorage y export default directo
// =================================================================
import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: number;
  nombreCompleto: string;
  email: string;
  role: 'Administrador' | 'Aprendiz' | 'Instructor';
  ficha?: string; // Aprendiz: número de ficha SENA · Administrador: 'STAFF-TI'
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  registro: (data: RegistroPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface RegistroPayload {
  nombreCompleto: string;
  email: string;
  ficha?: string;
  role: 'Aprendiz' | 'Instructor';
  password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // SEGURIDAD & BUENAS PRÁCTICAS:
  // Se prefiere sessionStorage sobre localStorage para evitar que la sesión persista
  // indefinidamente en equipos de salas de cómputo compartidas (Laboratorios SENA).
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    setToken(data.accessToken);
    setUser(data.user);
    // Guardar token y usuario en sessionStorage
    sessionStorage.setItem('token', data.accessToken);
    sessionStorage.setItem('user', JSON.stringify(data.user));
  };

  const registro = async (data: RegistroPayload) => {
    const response = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const respuesta = await response.json();

    if (!response.ok) {
      throw new Error(respuesta.message || 'Error al crear la cuenta');
    }

    setToken(respuesta.accessToken);
    setUser(respuesta.user);
    sessionStorage.setItem('token', respuesta.accessToken);
    sessionStorage.setItem('user', JSON.stringify(respuesta.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      registro,
      logout,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'Administrador',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

export default AuthContext;