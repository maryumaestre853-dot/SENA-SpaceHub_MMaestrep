// =================================================================
// Archivo: src/pages/PrestamosPage/PrestamosPage.tsx
// Módulo "Gestión de Solicitudes de Préstamo" idéntico al simulador de la
// Sesión 3, con formulario ADAPTATIVO según el rol de la sesión:
//   - Aprendiz: nombre y ficha se autocompletan desde la cuenta autenticada
//     (campos bloqueados, evita suplantación). Solo elige el equipo.
//   - Administrador / Operario: escribe el aprendiz y la ficha de cualquiera.
// Los préstamos activos se muestran como tarjetas con "✅ Registrar Devolución"
// (con confirmación SweetAlert2). Al crear o devolver se llama a
// refrescarTodo() para que Dashboard, SenaHeader y esta grilla se actualicen.
// =================================================================
import { useState } from 'react';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { useSpaceHubData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { prestamosService } from '../../services/prestamosService';

const CLASE_INPUT_LIBRE =
  'w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green';
const CLASE_INPUT_BLOQUEADO =
  'w-full bg-slate-950 border border-emerald-700/50 p-2.5 rounded-xl text-emerald-400 font-bold focus:outline-none cursor-not-allowed';

export default function PrestamosPage() {
  const { user } = useAuth();
  const { prestamos, equipos, loading, error, refrescarTodo } = useSpaceHubData();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [aprendizManual, setAprendizManual] = useState('');
  const [fichaManual, setFichaManual] = useState('2879451');
  const [equipoElegido, setEquipoElegido] = useState('');
  const [enviando, setEnviando] = useState(false);

  const esAprendiz = user?.role === 'Aprendiz';
  const activos = prestamos.filter((p) => p.estado === 'Activo');
  const operativos = equipos.filter((e) => e.estado === 'Operativo');

  // Datos efectivos del formulario según el rol (autocompletado de sesión)
  const aprendizForm = esAprendiz ? (user?.nombreCompleto ?? '') : aprendizManual;
  const fichaForm = esAprendiz ? (user?.ficha ?? 'N/A') : fichaManual;
  // El <select> muestra por defecto el primer equipo operativo
  const equipoForm = operativos.some((e) => e.placaSena === equipoElegido)
    ? equipoElegido
    : (operativos[0]?.placaSena ?? '');

  // --- Crear un nuevo préstamo ---
  const handleConfirmar = async () => {
    if (!aprendizForm.trim() || !fichaForm.trim() || !equipoForm) return;
    setEnviando(true);
    try {
      await prestamosService.create({
        equipoPlaca: equipoForm,
        // El backend ignora estos datos para un Aprendiz (usa su propio token)
        ...(esAprendiz ? {} : { aprendiz: aprendizForm.trim(), ficha: fichaForm.trim() }),
      });
      await refrescarTodo();
      setAprendizManual('');
      setMostrarForm(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ['#16A6B6', '#B9E2E8', '#EAF6F8', '#0B6673'] });
    } catch (err: unknown) {
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'No se pudo registrar el préstamo',
        icon: 'error',
      iconColor: '#8CCDD3',
        background: '#003A45',
        color: '#EAF6F8',
      });
    } finally {
      setEnviando(false);
    }
  };

  // --- Devolver un equipo prestado ---
  const handleDevolver = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Confirmar Devolución?',
      text: 'El equipo quedará nuevamente disponible en el inventario.',
      icon: 'warning',
      iconColor: '#63C8CB',
      showCancelButton: true,
      confirmButtonColor: '#0B6673',
      cancelButtonColor: '#3D9DA8',
      confirmButtonText: 'Sí, registrar devolución',
      cancelButtonText: 'Cancelar',
      background: '#003A45',
      color: '#EAF6F8',
    });

    if (result.isConfirmed) {
      try {
        await prestamosService.devolver(id);
        await refrescarTodo();
        Swal.fire({
          title: '¡Devuelto!',
          text: 'El equipo ha sido devuelto exitosamente.',
          icon: 'success',
          iconColor: '#16A6B6',
          background: '#003A45',
          color: '#EAF6F8',
          confirmButtonColor: '#0B6673',
        });
      } catch (err: unknown) {
        Swal.fire({
          title: 'Error',
          text: err instanceof Error ? err.message : 'No se pudo procesar la devolución',
          icon: 'error',
      iconColor: '#8CCDD3',
          background: '#003A45',
          color: '#EAF6F8',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-plaster">Gestión de Solicitudes de Préstamo</h3>
          <p className="text-xs text-slate-400">Control de entregas y devoluciones para aprendices e instructores</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-sena-green hover:bg-emerald-600 text-soot font-bold text-xs px-4 py-2 rounded-xl transition-all"
        >
          📋 Solicitar Préstamo de Equipo
        </button>
      </div>

      {/* Formulario Préstamo (Adaptativo según Sesión Activa) */}
      {mostrarForm && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-sena-green font-mono uppercase">
              Formulario: Nueva Solicitud (Interface `PrestamoData`)
            </h4>
            {esAprendiz ? (
              <span className="text-[10px] bg-sena-green/20 text-sena-green px-2.5 py-0.5 rounded-full font-mono font-bold">
                Modo Autoservicio Aprendiz
              </span>
            ) : (
              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Modo Gestión Operario
              </span>
            )}
          </div>

          {esAprendiz ? (
            <p className="text-xs text-sena-green bg-emerald-950/60 p-3 rounded-xl border border-emerald-800 font-mono">
              ⚡ <strong>Datos Autocompletados:</strong> Se vinculó automáticamente a{' '}
              <strong>{user?.nombreCompleto}</strong> (Ficha #{user?.ficha ?? 'N/A'}). Solo selecciona el equipo.
            </p>
          ) : (
            <p className="text-xs text-sky-400 bg-sky-950/60 p-3 rounded-xl border border-sky-800 font-mono">
              🛠️ <strong>Modo Operario / Administrador:</strong> Puedes registrar la entrega física de un equipo
              ingresando los datos del aprendiz solicitante.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Aprendiz Solicitante:</label>
              <input
                type="text"
                value={aprendizForm}
                onChange={(e) => setAprendizManual(e.target.value)}
                disabled={esAprendiz}
                placeholder={esAprendiz ? 'Nombre Aprendiz' : 'Nombre del Aprendiz Solicitante'}
                className={esAprendiz ? CLASE_INPUT_BLOQUEADO : CLASE_INPUT_LIBRE}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Número de Ficha SENA:</label>
              <input
                type="text"
                value={fichaForm}
                onChange={(e) => setFichaManual(e.target.value)}
                disabled={esAprendiz}
                placeholder="Ficha (ej. 2879451)"
                className={esAprendiz ? CLASE_INPUT_BLOQUEADO : CLASE_INPUT_LIBRE}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Equipo Requerido (Placa SENA):</label>
              <select
                value={equipoForm}
                onChange={(e) => setEquipoElegido(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-plaster focus:outline-none focus:border-sena-green font-mono"
              >
                {operativos.map((e) => (
                  <option key={e.id} value={e.placaSena}>
                    {e.placaSena} - {e.marcaModelo} ({e.ram})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setMostrarForm(false)} className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl">
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={enviando}
              className="bg-sena-green text-soot font-bold text-xs px-4 py-1.5 rounded-xl disabled:opacity-50"
            >
              {enviando ? 'Guardando...' : 'Confirmar Solicitud de Préstamo'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-900/80 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Grilla de Tarjetas de Préstamo */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 font-mono text-xs">Cargando préstamos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activos.map((p) => (
            <div key={p.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-sena-green/10 text-sena-green text-[10px] font-bold px-2 py-0.5 rounded">
                  Ficha #{p.ficha}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{p.horaInicio}</span>
              </div>
              <div>
                <h5 className="font-bold text-xs text-plaster">{p.aprendiz}</h5>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Equipo: <strong className="text-sena-green">{p.equipoPlaca}</strong>
                </p>
              </div>
              <button
                onClick={() => handleDevolver(p.id)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold py-1.5 rounded-xl border border-slate-800"
              >
                ✅ Registrar Devolución
              </button>
            </div>
          ))}
          {activos.length === 0 && (
            <p className="col-span-full text-center py-6 text-slate-500 font-mono text-xs">
              No hay préstamos activos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
