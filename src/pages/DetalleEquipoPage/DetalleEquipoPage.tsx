import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const STORAGE_KEY = 'equipos';

const equipos = {
  'SENA-1024': {
    tipo: 'Computador Portátil',
    marca: 'HP',
    serial: 'HP-2024-1024',
    responsable: 'Aprendiz A',
    estado: 'Activo',
    ubicacion: 'Laboratorio 1',
    procesador: 'Intel Core i5 12va gen',
    memoria: '16 GB RAM',
    almacenamiento: '512 GB SSD',
    historial: ['Se realizó mantenimiento preventivo', 'Actualización de software', 'Cambio de teclado'],
  },
  'SENA-2048': {
    tipo: 'Monitor',
    marca: 'Dell',
    serial: 'DEL-2048-88',
    responsable: 'Aprendiz B',
    estado: 'Mantenimiento',
    ubicacion: 'Taller 2',
    procesador: 'N/A',
    memoria: 'N/A',
    almacenamiento: 'N/A',
    historial: ['Se detectó falla en la pantalla', 'Solicitado repuesto', 'Pendiente revisión'],
  },
};

export default function DetalleEquipoPage() {
  const { placaSena } = useParams<{ placaSena: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const guardados = useMemo(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, []);

  const equipoGuardado = guardados.find((item: any) => item.placa === placaSena);
  const equipo = placaSena ? equipos[placaSena as keyof typeof equipos] : undefined;

  const datos = equipoGuardado ?? equipo ?? {
    tipo: 'Equipo no encontrado',
    marca: '-',
    serial: '-',
    responsable: '-',
    estado: 'Sin información',
    ubicacion: '-',
    procesador: '-',
    memoria: '-',
    almacenamiento: '-',
    historial: ['Sin historial disponible'],
  };

  const [form, setForm] = useState({
    tipo: datos.tipo,
    marca: datos.marca,
    serial: datos.serial,
    responsable: datos.responsable,
    estado: datos.estado,
    ubicacion: datos.ubicacion,
    procesador: datos.procesador,
    memoria: datos.memoria,
    almacenamiento: datos.almacenamiento,
  });

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const nuevaLista = lista.map((item: any) =>
      item.placa === placaSena ? { ...item, ...form, placa: placaSena } : item,
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevaLista));
    setIsEditing(false);
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 8 }}>
      <div style={{ marginBottom: 18 }}>
        <Link to="/inventario" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>
          ← Volver al inventario
        </Link>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#0f766e', fontWeight: 700 }}>Ficha técnica</p>
            <h2 style={{ margin: '8px 0 0' }}>{datos.tipo}</h2>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                background: datos.estado === 'Activo' ? '#dcfce7' : '#fef3c7',
                color: datos.estado === 'Activo' ? '#166534' : '#92400e',
                borderRadius: 999,
                padding: '8px 12px',
                fontWeight: 700,
              }}
            >
              {datos.estado}
            </span>

            {!isEditing ? (
              <button type="button" onClick={handleEdit} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                Editar
              </button>
            ) : (
              <button type="button" onClick={handleSave} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#0f766e', color: '#fff', cursor: 'pointer' }}>
                Guardar
              </button>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginTop: 24 }}>
            <div><strong>Placa SENA</strong><p style={{ margin: '8px 0 0' }}>{placaSena ?? 'N/A'}</p></div>
            <div><strong>Marca</strong><p style={{ margin: '8px 0 0' }}>{datos.marca}</p></div>
            <div><strong>Serial</strong><p style={{ margin: '8px 0 0' }}>{datos.serial}</p></div>
            <div><strong>Responsable</strong><p style={{ margin: '8px 0 0' }}>{datos.responsable}</p></div>
            <div><strong>Ubicación</strong><p style={{ margin: '8px 0 0' }}>{datos.ubicacion}</p></div>
            <div><strong>Procesador</strong><p style={{ margin: '8px 0 0' }}>{datos.procesador}</p></div>
            <div><strong>Memoria</strong><p style={{ margin: '8px 0 0' }}>{datos.memoria}</p></div>
            <div><strong>Almacenamiento</strong><p style={{ margin: '8px 0 0' }}>{datos.almacenamiento}</p></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginTop: 24 }}>
            {Object.entries(form).map(([key, value]) => (
              <label key={key} style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
                {key}
                <input
                  value={value}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: 28 }}>
          <h3 style={{ marginBottom: 12 }}>Historial</h3>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8, color: '#475569' }}>
            {datos.historial.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
