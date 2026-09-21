import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const tarjetas = [
    { label: 'Equipos activos', valor: '128', detalle: '+12 esta semana' },
    { label: 'Solicitudes', valor: '24', detalle: '7 pendientes' },
    { label: 'Total fichas', valor: '41', detalle: '3 nuevas' },
  ];

  return (
    <div style={{ padding: '24px 20px', display: 'grid', gap: 20 }}>
      <section
        style={{
          background: '#f3f6f8',
          borderRadius: 16,
          padding: 24,
          border: '1px solid #dfe7eb',
        }}
      >
        <p style={{ margin: 0, color: '#2c7a7b', fontWeight: 700 }}>Bienvenido</p>
        <h2 style={{ margin: '8px 0 0' }}>
          {user ? `${user.nombre} · ${user.rol}` : 'Usuario'}
        </h2>
        <p style={{ marginTop: 8, color: '#4a5568' }}>
          Aquí tienes un resumen del estado general del portal SENA SpaceHub.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {tarjetas.map((tarjeta) => (
          <div
            key={tarjeta.label}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            }}
          >
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{tarjeta.label}</p>
            <h3 style={{ margin: '12px 0 8px', fontSize: 28 }}>{tarjeta.valor}</h3>
            <small style={{ color: '#475569' }}>{tarjeta.detalle}</small>
          </div>
        ))}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Accesos rápidos</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <Link to="/inventario">Ver inventario</Link>
            <Link to="/perfil">Mi perfil</Link>
            {user?.rol === 'Administrador' && <Link to="/inventario/nuevo">Registrar equipo</Link>}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Actividades recientes</h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', display: 'grid', gap: 8 }}>
            <li>Se actualizó inventario de computadores.</li>
            <li>Se registró una nueva novedad en la ficha 3407169.</li>
            <li>Se aprobó la entrega de evidencias del equipo A-18.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
