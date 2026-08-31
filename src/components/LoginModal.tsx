// ============================================================================
// 📁 src/components/LoginModal.tsx
// Props tipadas explícitamente: así, si el componente Padre olvida pasar
// `onClose`, TypeScript lo marca en rojo ANTES de guardar el archivo.
//
// Dos pestañas: "Iniciar Sesión" (ya existía) y "Crear Cuenta" (nueva). El
// registro usa la función `registro()` que YA estaba definida en
// AuthContext.tsx desde la base del proyecto — aquí solo se construye el
// formulario que la invoca. La validación de "ficha obligatoria si el rol es
// Aprendiz" refleja el CONSTRAINT chk_ficha_aprendiz de database/schema.sql.
// ============================================================================

import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import type { RegistroData, RolUsuario } from "../types/spacehub.types";

interface LoginModalProps {
  abierto: boolean;
  onClose: () => void;
}

type Pestana = "login" | "registro";

const ROLES_REGISTRO: RolUsuario[] = ["Aprendiz", "Instructor", "Administrador"];

export function LoginModal({ abierto, onClose }: LoginModalProps) {
  const { login, loginRapido, registro } = useAuth();
  const [pestana, setPestana] = useState<Pestana>("login");

  // ---- estado del formulario de login ----
  const [correo, setCorreo] = useState("ana.fajardo@sena.edu.co");
  const [password, setPassword] = useState("123456");

  // ---- estado del formulario de registro ----
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correoRegistro, setCorreoRegistro] = useState("");
  const [passwordRegistro, setPasswordRegistro] = useState("");
  const [rolRegistro, setRolRegistro] = useState<RolUsuario>("Aprendiz");
  const [fichaRegistro, setFichaRegistro] = useState("");
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);

  if (!abierto) return null;

  function manejarLoginRapido(rol: RolUsuario) {
    loginRapido(rol);
    cerrarYLimpiar();
  }

  async function manejarSubmitLogin(e: FormEvent) {
    e.preventDefault();
    await login({ correo, password });
    cerrarYLimpiar();
  }

  function manejarSubmitRegistro(e: FormEvent) {
    e.preventDefault();
    setErrorRegistro(null);

    // Misma regla del CHECK de Postgres: rol Aprendiz exige ficha
    if (rolRegistro === "Aprendiz" && !fichaRegistro.trim()) {
      setErrorRegistro("La ficha es obligatoria cuando el rol es Aprendiz.");
      return;
    }
    if (!correoRegistro.toLowerCase().endsWith("@sena.edu.co")) {
      setErrorRegistro("Usa tu correo institucional (@sena.edu.co).");
      return;
    }

    const payload: RegistroData = {
      nombreCompleto: nombreCompleto.trim(),
      correo: correoRegistro.trim().toLowerCase(),
      password: passwordRegistro,
      rol: rolRegistro,
      ficha: rolRegistro === "Aprendiz" ? fichaRegistro.trim() : undefined,
    };
    registro(payload);
    cerrarYLimpiar();
  }

  function cerrarYLimpiar() {
    setNombreCompleto("");
    setCorreoRegistro("");
    setPasswordRegistro("");
    setFichaRegistro("");
    setRolRegistro("Aprendiz");
    setErrorRegistro(null);
    setPestana("login");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h4 className="font-bold text-sm text-sena-green font-mono uppercase">
              🔐 Acceso a SENA SpaceHub
            </h4>
            <p className="text-[10px] text-slate-400">
              Inicia sesión con un usuario de prueba o crea una cuenta nueva
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 text-xs font-bold font-mono">
          <button
            onClick={() => setPestana("login")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              pestana === "login"
                ? "bg-sena-green text-white"
                : "bg-slate-950 text-slate-400 border border-slate-800"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setPestana("registro")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              pestana === "registro"
                ? "bg-sena-green text-white"
                : "bg-slate-950 text-slate-400 border border-slate-800"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {pestana === "login" ? (
          <>
            <div className="space-y-2 text-xs font-mono">
              <p className="text-slate-400 text-[11px]">Probar como:</p>

              <button
                onClick={() => manejarLoginRapido("Aprendiz")}
                className="w-full text-left bg-slate-950 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-sena-green block">👨‍🎓 Ana María Fajardo</span>
                  <span className="text-[10px] text-slate-400">Rol: Aprendiz ADSO • Ficha 2879451</span>
                </div>
                <span className="text-xs bg-sena-green/20 text-sena-green px-2 py-0.5 rounded font-bold">
                  Aprendiz
                </span>
              </button>

              <button
                onClick={() => manejarLoginRapido("Administrador")}
                className="w-full text-left bg-slate-950 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-sky-400 block">
                    👨‍💼 Ing. Roberto Gómez (Operario/Admin)
                  </span>
                  <span className="text-[10px] text-slate-400">Rol: Administrador • Gestión Total</span>
                </div>
                <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-bold">
                  Admin
                </span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono">
                O ingresa manualmente
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <form onSubmit={manejarSubmitLogin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Correo Institucional (@sena.edu.co):
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Contraseña:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 text-slate-300 px-3 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-sena-green text-white font-bold px-5 py-2 rounded-xl"
                >
                  Autenticar (JWT)
                </button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={manejarSubmitRegistro} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Nombre completo:</label>
              <input
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Ej: Juan Esteban Ríos"
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">
                Correo Institucional (@sena.edu.co):
              </label>
              <input
                type="email"
                required
                value={correoRegistro}
                onChange={(e) => setCorreoRegistro(e.target.value)}
                placeholder="tucorreo@sena.edu.co"
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Rol:</label>
                <select
                  value={rolRegistro}
                  onChange={(e) => setRolRegistro(e.target.value as RolUsuario)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
                >
                  {ROLES_REGISTRO.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Ficha {rolRegistro === "Aprendiz" && <span className="text-rose-400">*</span>}
                </label>
                <input
                  value={fichaRegistro}
                  onChange={(e) => setFichaRegistro(e.target.value)}
                  disabled={rolRegistro !== "Aprendiz"}
                  placeholder={rolRegistro === "Aprendiz" ? "2879451" : "No aplica"}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Contraseña:</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordRegistro}
                onChange={(e) => setPasswordRegistro(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sena-green font-mono"
              />
            </div>

            {errorRegistro && (
              <p className="text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 text-[11px]">
                ⚠️ {errorRegistro}
              </p>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 text-slate-300 px-3 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-sena-green text-white font-bold px-5 py-2 rounded-xl"
              >
                Crear Cuenta e Iniciar Sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
