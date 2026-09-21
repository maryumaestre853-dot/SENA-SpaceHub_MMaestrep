// =================================================================
// Archivo: src/pages/RegistroPage/RegistroPage.tsx
// Registro idéntico al modal "📝 Registro de Usuario (Interface `RegistroData`)"
// del simulador de la Sesión 3, conectado a POST /auth/registro.
// El backend rechaza (403) cualquier intento de crear un usuario con
// role: 'Administrador' desde aquí — ese rol NO es autoregistrable, por eso
// el selector solo ofrece Aprendiz e Instructor.
// =================================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

export default function RegistroPage() {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [ficha, setFicha] = useState('');
  const [role, setRole] = useState<'Aprendiz' | 'Instructor'>('Aprendiz');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registro({ nombreCompleto, email, ficha: ficha || undefined, role, password });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ['#16A6B6', '#B9E2E8', '#EAF6F8', '#0B6673'] });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-plaster shadow-2xl">
        <div className="border-b border-slate-800 pb-3">
          <h4 className="font-bold text-sm text-sky-400 font-mono uppercase">
            📝 Registro de Usuario (Interface `RegistroData`)
          </h4>
        </div>

        {error && (
          <div className="p-3 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="regNombre" className="block text-slate-400 mb-1 font-mono">
              Nombre Completo:
            </label>
            <input
              id="regNombre"
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="ej. Carlos Eduardo Mendoza"
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>
          <div>
            <label htmlFor="regEmail" className="block text-slate-400 mb-1 font-mono">
              Correo Institucional:
            </label>
            <input
              id="regEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej. carlos.mendoza@sena.edu.co"
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="regFicha" className="block text-slate-400 mb-1 font-mono">
                Ficha SENA:
              </label>
              <input
                id="regFicha"
                type="text"
                value={ficha}
                onChange={(e) => setFicha(e.target.value)}
                placeholder="2879451"
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>
            <div>
              <label htmlFor="regRol" className="block text-slate-400 mb-1 font-mono">
                Rol Solicitado:
              </label>
              <select
                id="regRol"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Aprendiz' | 'Instructor')}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sky-400 font-mono"
              >
                <option value="Aprendiz">Aprendiz</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="regPassword" className="block text-slate-400 mb-1 font-mono">
              Contraseña Segura:
            </label>
            <input
              id="regPassword"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Link to="/login" className="bg-slate-800 text-slate-300 px-3 py-2 rounded-xl">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-500 text-soot font-bold px-5 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
