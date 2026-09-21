// =================================================================
// Archivo: src/pages/DetalleEquipoPage/DetalleEquipoPage.tsx
// =================================================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equiposService, type Equipo } from '../../services/equiposService';
import { useSpaceHubData } from '../../context/DataContext';

export default function DetalleEquipoPage() {
  const { placaSena } = useParams<{ placaSena: string }>();
  const { equipos, refrescarEquipos } = useSpaceHubData();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [ram, setRam] = useState('16GB DDR4');
  const [ambiente, setAmbiente] = useState('');
  const [estado, setEstado] = useState<'Operativo' | 'En Mantenimiento'>('Operativo');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const found = equipos.find((e) => e.placaSena.toUpperCase() === placaSena?.toUpperCase());
    if (found) {
      setEquipo(found);
      setRam(found.ram);
      setAmbiente(found.ambiente);
      setEstado(found.estado);
    }
  }, [equipos, placaSena]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await equiposService.update(placaSena!, { ram, ambiente, estado });
      await refrescarEquipos();
      navigate('/inventario');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  if (!equipo && !error) return <div className="p-6 text-plaster text-center font-mono text-xs">Cargando recurso...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-slate-800 border border-slate-700 rounded-2xl text-plaster shadow-xl">
      <h2 className="text-xl font-bold text-sena-green mb-1">Editar Equipo (PUT)</h2>
      <p className="text-xs text-slate-400 mb-4 font-mono">Placa SENA: <span className="text-plaster font-bold">{placaSena}</span></p>
      {error && <div className="p-3 mb-4 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">{error}</div>}
      <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block font-bold text-slate-300 mb-1">Memoria RAM</label>
          <select value={ram} onChange={(e) => setRam(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-plaster focus:outline-none focus:border-sena-green">
            <option value="8GB DDR4">8GB DDR4</option>
            <option value="16GB DDR4">16GB DDR4</option>
            <option value="32GB DDR5">32GB DDR5</option>
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-300 mb-1">Estado Técnico</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-plaster focus:outline-none focus:border-sena-green">
            <option value="Operativo">Operativo</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-300 mb-1">Ambiente Asignado</label>
          <input type="text" value={ambiente} onChange={(e) => setAmbiente(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-plaster focus:outline-none focus:border-sena-green" />
        </div>
        <div className="pt-2 flex justify-end gap-3 font-sans">
          <button type="button" onClick={() => navigate('/inventario')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-300">Volver</button>
          <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-soot font-bold rounded-xl text-xs shadow-lg">Actualizar Recurso (PUT)</button>
        </div>
      </form>
    </div>
  );
}