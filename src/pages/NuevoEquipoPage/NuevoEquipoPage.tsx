import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'equipos';

export default function NuevoEquipoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    placa: '',
    tipo: 'Computador',
    marca: '',
    serial: '',
    responsable: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nuevoEquipo = {
      ...form,
      estado: 'Activo',
      ubicacion: 'Sin asignar',
    };

    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const listaActualizada = [...guardados, nuevoEquipo];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
    navigate('/inventario');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Registrar nuevo equipo</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <label>
            Placa SENA
            <input value={form.placa} onChange={(e) => handleChange('placa', e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Tipo
            <select value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
              <option>Computador</option>
              <option>Monitor</option>
              <option>Teclado</option>
              <option>Mouse</option>
            </select>
          </label>

          <label>
            Marca
            <input value={form.marca} onChange={(e) => handleChange('marca', e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Serial
            <input value={form.serial} onChange={(e) => handleChange('serial', e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }} />
          </label>
        </div>

        <label>
          Responsable
          <input value={form.responsable} onChange={(e) => handleChange('responsable', e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }} />
        </label>

        <button type="submit" style={{ padding: '12px 18px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Guardar equipo
        </button>
      </form>
    </div>
  );
}
