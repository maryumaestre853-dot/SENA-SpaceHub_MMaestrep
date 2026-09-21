import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth, type RolUsuario } from '../../context/AuthContext';

const roles: RolUsuario[] = ['Aprendiz', 'Instructor', 'Administrador'];

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginSimulado, isAuthenticated } = useAuth();
  const [correo, setCorreo] = useState('aprendiz@sena.edu.co');
  const [rol, setRol] = useState<RolUsuario>('Aprendiz');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    loginSimulado(correo, rol);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(15, 23, 42, 0.12)',
          border: '1px solid #dfe7eb',
        }}
      >
        <div
          style={{
            background: '#1f3b2d',
            padding: '24px 28px',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 70,
              height: 70,
              borderRadius: 16,
              background: '#39a900',
              fontWeight: 900,
              fontSize: 26,
              marginBottom: 10,
            }}
          >
            SENA
          </div>
          <h2 style={{ margin: 0, fontSize: 28 }}>Portal SpaceHub</h2>
          <p style={{ margin: '8px 0 0', color: '#d7fbe0', fontSize: 14 }}>
            Centro de Gestión de Mercados, Logística y TI
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18, padding: 28 }}>
          <div>
            <label style={{ display: 'grid', gap: 6, fontWeight: 600, color: '#1f2937' }}>
              Correo institucional
              <input
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="correo@sena.edu.co"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: 15,
                }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'grid', gap: 6, fontWeight: 600, color: '#1f2937' }}>
              Rol
              <select
                value={rol}
                onChange={(event) => setRol(event.target.value as RolUsuario)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontSize: 15,
                }}
              >
                {roles.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            style={{
              padding: '14px 18px',
              border: 'none',
              borderRadius: 12,
              background: '#39a900',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(57, 169, 0, 0.25)',
            }}
          >
            Entrar al sistema
          </button>
        </form>
      </div>
    </div>
  );
}
