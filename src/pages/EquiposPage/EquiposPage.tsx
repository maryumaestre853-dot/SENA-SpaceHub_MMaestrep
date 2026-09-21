// =================================================================
// Archivo: src/pages/EquiposPage/EquiposPage.tsx
// Módulo "Inventario de Equipos de Cómputo" idéntico al simulador de la
// Sesión 3: formulario en línea "Nuevo Equipo" y botón "Cambiar Estado"
// (solo Administrador); el Aprendiz ve "Solo Operarios".
// Consume equipos desde DataContext (misma fuente que usa el header para el
// contador "Inventario (n)") y llama a refrescarEquipos() tras cada cambio.
// (NuevoEquipoPage y DetalleEquipoPage siguen existiendo y enrutadas en App.tsx.)
// =================================================================
import { useState } from 'react';
import Swal from 'sweetalert2';
import { equiposService, type Equipo } from '../../services/equiposService';
import { useAuth } from '../../context/AuthContext';
import { useSpaceHubData } from '../../context/DataContext';

export default function EquiposPage() {
  const { isAdmin } = useAuth();
  const { equipos, loading, error, refrescarEquipos } = useSpaceHubData();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [ram, setRam] = useState('16GB DDR4');

  const alertarError = (err: unknown, porDefecto: string) =>
    Swal.fire({
      title: 'Error',
      text: err instanceof Error ? err.message : porDefecto,
      icon: 'error',
      iconColor: '#8CCDD3',
      background: '#003A45',
      color: '#EAF6F8',
    });

  const handleGuardar = async () => {
    if (!placa.trim() || !marca.trim()) return;
    try {
      await equiposService.create({
        placaSena: placa.trim(),
        marcaModelo: marca.trim(),
        ram,
        estado: 'Operativo',
      });
      await refrescarEquipos();
      setPlaca('');
      setMarca('');
      setMostrarForm(false);
    } catch (err: unknown) {
      alertarError(err, 'No se pudo guardar el equipo');
    }
  };

  const handleCambiarEstado = async (eq: Equipo) => {
    try {
      await equiposService.update(eq.placaSena, {
        estado: eq.estado === 'Operativo' ? 'En Mantenimiento' : 'Operativo',
      });
      await refrescarEquipos();
    } catch (err: unknown) {
      alertarError(err, 'No se pudo cambiar el estado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-plaster">Inventario de Equipos de Cómputo</h3>
          <p className="text-xs text-slate-400">Control individualizado por Placa SENA e Interface `EquipoData`</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="bg-sena-green hover:bg-emerald-600 text-soot font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            ➕ Registrar Nuevo Equipo
          </button>
        )}
      </div>

      {/* Formulario Crear Equipo */}
      {isAdmin && mostrarForm && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-sena-green font-mono uppercase">
            Formulario: Nuevo Equipo (Interface `EquipoData`)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="Placa SENA (ej. SENA-8942)"
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green"
            />
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Marca / Modelo (ej. Lenovo ThinkPad L14)"
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green"
            />
            <select
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green"
            >
              <option value="16GB DDR4">16GB RAM DDR4</option>
              <option value="32GB DDR5">32GB RAM DDR5</option>
              <option value="8GB DDR4">8GB RAM DDR4</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setMostrarForm(false)}
              className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl"
            >
              Cancelar
            </button>
            <button onClick={handleGuardar} className="bg-sena-green text-soot font-bold text-xs px-4 py-1.5 rounded-xl">
              Guardar en Inventario
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Tabla de Equipos */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 font-mono text-xs">Cargando inventario...</div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-3">Placa SENA</th>
                  <th className="p-3">Equipo / Modelo</th>
                  <th className="p-3">Especificación</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {equipos.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-900/50">
                    <td className="p-3 text-sena-green font-bold">{eq.placaSena}</td>
                    <td className="p-3 font-bold text-plaster">{eq.marcaModelo}</td>
                    <td className="p-3 text-slate-400">{eq.ram}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eq.estado === 'Operativo'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {eq.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => handleCambiarEstado(eq)}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-slate-300"
                        >
                          Cambiar Estado
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Solo Operarios</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
