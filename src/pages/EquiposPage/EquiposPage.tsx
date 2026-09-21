import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'equipos';

type Equipo = {
  placa: string;
  tipo: string;
  estado: string;
  responsable: string;
  ubicacion: string;
};

const equiposIniciales: Equipo[] = [
  { placa: 'SENA-1024', tipo: 'Computador', estado: 'Activo', responsable: 'Aprendiz A', ubicacion: 'Laboratorio 1' },
  { placa: 'SENA-2048', tipo: 'Monitor', estado: 'Mantenimiento', responsable: 'Aprendiz B', ubicacion: 'Taller 2' },
  { placa: 'SENA-4096', tipo: 'Teclado', estado: 'Activo', responsable: 'Aprendiz C', ubicacion: 'Laboratorio 3' },
];

export default function EquiposPage() {
  const [equipos] = useState<Equipo[]>(() => {
    const guardados = localStorage.getItem(STORAGE_KEY);

    if (!guardados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equiposIniciales));
      return equiposIniciales;
    }

    try {
      return JSON.parse(guardados) as Equipo[];
    } catch {
      return equiposIniciales;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipos));
  }, [equipos]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, color: '#0f766e', fontWeight: 700 }}>Gestión</p>
          <h2 style={{ margin: '6px 0 0' }}>Inventario de equipos</h2>
        </div>

        <Link to="/inventario/nuevo" style={{ padding: '10px 16px', background: '#0f766e', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700 }}>
          + Nuevo equipo
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Placa</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Ubicación</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Responsable</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo: Equipo) => (
              <tr key={equipo.placa}>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>{equipo.placa}</td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>{equipo.tipo}</td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>{equipo.ubicacion}</td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>{equipo.responsable}</td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span
                    style={{
                      background: equipo.estado === 'Activo' ? '#dcfce7' : '#fef3c7',
                      color: equipo.estado === 'Activo' ? '#166534' : '#92400e',
                      padding: '6px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {equipo.estado}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <Link to={`/inventario/${equipo.placa}`} style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>
                    Ver más
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
