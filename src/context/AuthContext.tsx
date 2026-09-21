import React, { createContext, useContext, useState, useEffect } from 'react';

export type RolUsuario = 'Aprendiz' | 'Instructor' | 'Administrador';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  loginSimulado: (correo: string, rol: RolUsuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('spacehub_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const loginSimulado = (correo: string, rol: RolUsuario) => {
    const mockUser: Usuario = { id: Date.now(), nombre: correo.split('@')[0], correo, rol };
    setUser(mockUser);
    localStorage.setItem('spacehub_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('spacehub_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginSimulado, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;