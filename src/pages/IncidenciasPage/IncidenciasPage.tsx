// =================================================================
// Archivo: src/pages/IncidenciasPage/IncidenciasPage.tsx
// Módulo "Mesa de Ayuda y Ticketera de Fallas" idéntico al simulador de la
// Sesión 3: "🛠️ Reportar Incidencia" (formulario en línea), lista de tickets
// pendientes y "Resolver Ticket". Disponible para cualquier usuario
// autenticado. Se alimenta del DataContext y refresca tras cada cambio.
// =================================================================
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useSpaceHubData } from '../../context/DataContext';
import { incidenciasService, type Incidencia } from '../../services/incidenciasService';

export default function IncidenciasPage() {
  const { incidencias, equipos, loading, error, refrescarTodo } = useSpaceHubData();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [placaElegida, setPlacaElegida] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Incidencia['prioridad']>('Alta');

  const pendientes = incidencias.filter((i) => !i.resuelta);
  // El <select> muestra por defecto el primer equipo del inventario
  const placaForm = equipos.some((e) => e.placaSena === placaElegida) ? placaElegida : (equipos[0]?.placaSena ?? '');

  const alertarError = (err: unknown, porDefecto: string) =>
    Swal.fire({
      title: 'Error',
      text: err instanceof Error ? err.message : porDefecto,
      icon: 'error',
      iconColor: '#8CCDD3',
      background: '#003A45',
      color: '#EAF6F8',
    });

  const handleGenerarTicket = async () => {
    if (!placaForm || !descripcion.trim()) return;
    try {
      await incidenciasService.create({ placaSena: placaForm, descripcion: descripcion.trim(), prioridad });
      await refrescarTodo();
      setDescripcion('');
      setMostrarForm(false);
    } catch (err: unknown) {
      alertarError(err, 'No se pudo generar el ticket');
    }
  };

  const handleResolver = async (id: number) => {
    try {
      await incidenciasService.resolver(id);
      await refrescarTodo();
    } catch (err: unknown) {
      alertarError(err, 'No se pudo resolver el ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-plaster">Mesa de Ayuda y Ticketera de Fallas</h3>
          <p className="text-xs text-slate-400">Reportes de fallas técnicas e incidencias de hardware</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-amber-500 hover:bg-amber-600 text-soot font-bold text-xs px-4 py-2 rounded-xl transition-all"
        >
          🛠️ Reportar Incidencia
        </button>
      </div>

      {/* Formulario Ticketera */}
      {mostrarForm && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-amber-400 font-mono uppercase">
            Formulario: Ticket de Soporte (Interface `IncidenciaData`)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <select
              value={placaForm}
              onChange={(e) => setPlacaElegida(e.target.value)}
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none font-mono"
            >
              {equipos.map((e) => (
                <option key={e.id} value={e.placaSena}>
                  {e.placaSena} - {e.marcaModelo}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción breve de la falla"
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none"
            />
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Incidencia['prioridad'])}
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none"
            >
              <option value="Alta">Prioridad: Alta</option>
              <option value="Media">Prioridad: Media</option>
              <option value="Baja">Prioridad: Baja</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setMostrarForm(false)} className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl">
              Cancelar
            </button>
            <button onClick={handleGenerarTicket} className="bg-amber-500 text-soot font-bold text-xs px-4 py-1.5 rounded-xl">
              Generar Ticket
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Lista de Tickets */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 font-mono text-xs">Cargando incidencias...</div>
      ) : (
        <div className="space-y-3">
          {pendientes.map((inc) => (
            <div
              key={inc.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-400 font-mono">{inc.placaSena}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      inc.prioridad === 'Alta'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    Prioridad {inc.prioridad}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{inc.descripcion}</p>
              </div>
              <button
                onClick={() => handleResolver(inc.id)}
                className="bg-sena-green text-soot font-bold text-[10px] px-3 py-1.5 rounded-xl self-start sm:self-auto"
              >
                Resolver Ticket
              </button>
            </div>
          ))}
          {pendientes.length === 0 && (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">No hay incidencias pendientes 🎉</div>
          )}
        </div>
      )}
    </div>
  );
}
