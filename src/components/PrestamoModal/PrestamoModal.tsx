// =================================================================
// Archivo: src/components/PrestamoModal/PrestamoModal.tsx
// Ventana modal para registrar un nuevo préstamo de equipo.
// - Aprendiz: solo elige el equipo (el backend usa su propio ID del token).
// - Administrador: además debe indicar el ID numérico del aprendiz,
//   porque el backend (POST /api/v1/prestamos) espera { aprendizId, equipoPlaca }.
// =================================================================
import React, { useState } from 'react';
import type { Equipo } from '../../services/equiposService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { equipoPlaca: string; aprendizId?: number }) => Promise<void>;
  isAdmin: boolean;
  equipos: Equipo[];
}

export default function PrestamoModal({ isOpen, onClose, onSubmit, isAdmin, equipos }: Props) {
  const [equipoPlaca, setEquipoPlaca] = useState('');
  const [aprendizId, setAprendizId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Solo mostramos equipos que sí pueden prestarse.
  const equiposDisponibles = equipos.filter((e) => e.estado === 'Operativo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        equipoPlaca,
        ...(isAdmin && aprendizId ? { aprendizId: Number(aprendizId) } : {}),
      });
      setEquipoPlaca('');
      setAprendizId('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-plaster relative">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-sena-green">Registrar Nuevo Préstamo</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-plaster font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Seleccionar Equipo</label>
            <select
              required
              value={equipoPlaca}
              onChange={(e) => setEquipoPlaca(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-plaster"
            >
              <option value="">-- Selecciona un equipo --</option>
              {equiposDisponibles.map((equipo) => (
                <option key={equipo.id} value={equipo.placaSena}>
                  {equipo.placaSena} - {equipo.marcaModelo}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">ID del Aprendiz</label>
              <input
                type="number"
                required
                value={aprendizId}
                onChange={(e) => setAprendizId(e.target.value)}
                placeholder="Ej: 101"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-plaster"
              />
              <span className="block text-[10px] text-slate-500 mt-1 font-sans">
                El backend solo acepta el ID numérico del usuario, no su nombre.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sena-green hover:bg-emerald-600 text-slate-900 font-extrabold rounded-xl text-xs cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Asignar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
