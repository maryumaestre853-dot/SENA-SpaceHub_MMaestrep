// =================================================================
// Archivo: src/pages/LoginPage/LoginPage.tsx
// Login idéntico al modal "🔐 Iniciar Sesión Rápida (Probar Roles)" del
// simulador de la Sesión 3: accesos rápidos para Aprendiz y Administrador
// + formulario manual (correo / contraseña) conectado a POST /auth/login.
// =================================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface UsuarioRapido {
  nombre: string;
  email: string;
  password: string;
  rolTexto: string;
  badge: string;
  claseNombre: string;
  claseBadge: string;
}

const USUARIOS_RAPIDOS: UsuarioRapido[] = [
  {
    nombre: '👨‍🎓 Maryuri Maestre',
    email: 'maryuri.maestre@sena.edu.co',
    password: 'aprendiz123password',
    rolTexto: 'Rol: Aprendiz ADSO • Ficha 2879451',
    badge: 'Aprendiz',
    claseNombre: 'text-sena-green',
    claseBadge: 'bg-sena-green/20 text-sena-green',
  },
  {
    nombre: '👨‍💼 Ing. Milena Parra (Operario/Admin)',
    email: 'milena.parra@sena.edu.co',
    password: 'admin123password',
    rolTexto: 'Rol: Administrador • Gestión Total',
    badge: 'Admin',
    claseNombre: 'text-sky-400',
    claseBadge: 'bg-sky-500/20 text-sky-400',
  },
];

// Confeti con los colores de la paleta (Eucalyptus, Mist, Plaster, Moss)
const COLORES_CONFETI = ['#16A6B6', '#B9E2E8', '#EAF6F8', '#0B6673'];

// Valores iniciales del formulario manual (en el simulador viene con la cuenta de Ana)
const EMAIL_INICIAL = 'maryuri.maestre@sena.edu.co';
const PASSWORD_INICIAL = 'aprendiz123password';

export default function LoginPage() {
  const [email, setEmail] = useState(EMAIL_INICIAL);
  const [password, setPassword] = useState(PASSWORD_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const autenticar = async (correo: string, clave: string, particulas: number) => {
    setError(null);
    setLoading(true);
    try {
      await login(correo, clave);
      confetti({ particleCount: particulas, spread: particulas === 60 ? 50 : 60, origin: { y: 0.6 }, colors: COLORES_CONFETI });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    autenticar(email, password, 70);
  };

  const handleCancelar = () => {
    setEmail(EMAIL_INICIAL);
    setPassword(PASSWORD_INICIAL);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-plaster shadow-2xl">
        <div className="border-b border-slate-800 pb-3">
          <h4 className="font-bold text-sm text-sena-green font-mono uppercase">
            🔐 Iniciar Sesión Rápida (Probar Roles)
          </h4>
          <p className="text-[10px] text-slate-400">
            Selecciona un usuario de prueba para cambiar de contexto inmediatamente
          </p>
        </div>

        {/* Botones Rápidos de Cambio de Rol */}
        <div className="space-y-2 text-xs font-mono">
          <p className="text-slate-400 text-[11px]">Probar como:</p>
          {USUARIOS_RAPIDOS.map((u) => (
            <button
              key={u.email}
              type="button"
              disabled={loading}
              onClick={() => autenticar(u.email, u.password, 60)}
              className="w-full text-left bg-slate-950 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 flex items-center justify-between disabled:opacity-50"
            >
              <div>
                <span className={`font-bold block ${u.claseNombre}`}>{u.nombre}</span>
                <span className="text-[10px] text-slate-400">{u.rolTexto}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${u.claseBadge}`}>{u.badge}</span>
            </button>
          ))}
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono">O ingresa manualmente</span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {error && (
          <div className="p-3 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="loginEmail" className="block text-slate-400 mb-1 font-mono">
              Correo Institucional (@sena.edu.co):
            </label>
            <input
              id="loginEmail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green font-mono"
            />
          </div>
          <div>
            <label htmlFor="loginPassword" className="block text-slate-400 mb-1 font-mono">
              Contraseña:
            </label>
            <input
              id="loginPassword"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green font-mono"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={handleCancelar} className="bg-slate-800 text-slate-300 px-3 py-2 rounded-xl">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-sena-green text-soot font-bold px-5 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Autenticando...' : 'Autenticar (JWT)'}
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] text-slate-400 font-mono pt-1">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-sky-400 font-bold underline hover:text-sky-300">
            📝 Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
