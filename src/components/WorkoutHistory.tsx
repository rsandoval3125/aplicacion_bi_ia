import {CloudUpload, Footprints, Mountain, Route, Trash2} from 'lucide-react';
import {useState} from 'react';
import {WorkoutFilter, WorkoutRecord, WorkoutType} from '../types/workout';
import {calculatePace, formatDateSpanish, WORKOUT_TYPES} from '../utils/pace';

interface WorkoutHistoryProps {
  workouts: WorkoutRecord[];
  filter: WorkoutFilter;
  onFilterChange: (filter: WorkoutFilter) => void;
  onDelete: (id: string) => void;
  onSyncLocalRecord: (workout: WorkoutRecord) => Promise<void>;
  onLoadDemoSamples: () => void;
  demoMode: boolean;
}

const FILTER_OPTIONS: WorkoutFilter[] = ['Todos', ...WORKOUT_TYPES];

function getTypeIcon(tipo: WorkoutType) {
  switch (tipo) {
    case 'Correr':
      return Route;
    case 'Caminata':
      return Footprints;
    case 'Trail':
      return Mountain;
  }
}

export function WorkoutHistory({
  workouts,
  filter,
  onFilterChange,
  onDelete,
  onSyncLocalRecord,
  onLoadDemoSamples,
  demoMode,
}: WorkoutHistoryProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const filteredWorkouts =
    filter === 'Todos' ? workouts : workouts.filter((w) => w.tipo === filter);

  const totalDistance = filteredWorkouts.reduce((acc, item) => acc + item.distancia_km, 0);
  const totalMinutes = filteredWorkouts.reduce((acc, item) => acc + item.duracion_min, 0);
  const avgPace = calculatePace(totalDistance, totalMinutes);

  const handleSync = async (workout: WorkoutRecord) => {
    setSyncingId(workout.id);
    try {
      await onSyncLocalRecord(workout);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <section
      aria-label="Historial de entrenamientos"
      className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header + Summary Metrics */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F1115]">
            Historial de sesiones
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Guardado en este navegador · filtrado por modalidad
          </p>
        </div>
        {workouts.length === 0 && (
          <button
            type="button"
            onClick={onLoadDemoSamples}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F4F5F7] hover:bg-slate-200 text-xs font-semibold text-[#0F1115] transition-colors whitespace-nowrap shrink-0"
          >
            Cargar ejemplos demo
          </button>
        )}
      </div>

      {/* 3-Column Tabular Summary */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="rounded-2xl bg-[#F4F5F7] p-3 sm:p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Sesiones</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[#0F1115]">
            {filteredWorkouts.length}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F4F5F7] p-3 sm:p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Distancia</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[#0F1115]">
            {totalDistance.toFixed(1)}
            <span className="text-sm font-semibold text-slate-500 ml-1">km</span>
          </p>
        </div>
        <div className="rounded-2xl bg-[#F4F5F7] p-3 sm:p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Ritmo medio</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[#0F1115]">
            {avgPace.mmss}
          </p>
        </div>
      </div>

      {/* Interactive Filter Segmented Bar */}
      <div
        role="tablist"
        aria-label="Filtrar por tipo de entrenamiento"
        className="grid grid-cols-4 gap-1 p-1 bg-[#F4F5F7] rounded-2xl"
      >
        {FILTER_OPTIONS.map((option) => {
          const active = filter === option;
          return (
            <button
              key={option}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onFilterChange(option)}
              className={`min-h-[40px] px-2 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-[#0F1115] shadow-xs'
                  : 'text-slate-600 hover:text-[#0F1115]'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* List Rows */}
      {filteredWorkouts.length === 0 ? (
        <div className="py-10 text-center space-y-2 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            No hay entrenamientos registrados {filter !== 'Todos' ? `en ${filter}` : ''}.
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Completa el formulario rápido o carga sesiones de ejemplo para probar el historial y los filtros.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filteredWorkouts.map((workout) => {
            const Icon = getTypeIcon(workout.tipo);
            const isConfirming = confirmDeleteId === workout.id;

            return (
              <li key={workout.id} className="py-4 first:pt-1 last:pb-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0F1115] text-[#D2FA05] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-sm text-[#0F1115]">
                          {workout.tipo}
                        </span>
                        <span className="font-display text-lg font-bold tabular-nums text-[#0F1115]">
                          {workout.distancia_km.toFixed(2)} km
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                        <span>{formatDateSpanish(workout.fecha)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{workout.duracion_min} min</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            workout.syncStatus === 'sent_to_sheets'
                              ? 'text-emerald-700 font-medium'
                              : 'text-slate-600 font-medium'
                          }
                        >
                          {workout.syncStatus === 'sent_to_sheets'
                            ? 'Enviado a Sheets'
                            : 'Local (Demo)'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-semibold tabular-nums text-[#0F1115]">
                      {workout.ritmo}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      {workout.syncStatus === 'local_demo' && !demoMode && (
                        <button
                          type="button"
                          onClick={() => handleSync(workout)}
                          disabled={syncingId === workout.id}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#F4F5F7] hover:bg-[#D2FA05] text-[#0F1115] text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                          title="Enviar este registro pendiente a Google Sheets"
                        >
                          <CloudUpload className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{syncingId === workout.id ? 'Enviando...' : 'Enviar'}</span>
                        </button>
                      )}

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(workout.id);
                              setConfirmDeleteId(null);
                            }}
                            className="min-h-[36px] px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                          >
                            Borrar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[36px] px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap shrink-0"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(workout.id)}
                          aria-label={`Eliminar entrenamiento del ${workout.fecha}`}
                          className="min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {workout.notas && (
                  <p className="text-xs text-slate-600 pl-13 leading-relaxed">
                    {workout.notas}
                  </p>
                )}

                {workout.aiAnalysis && (
                  <p className="text-xs text-slate-700 bg-[#F8FAFC] rounded-xl p-2.5 ml-13 border border-slate-200/70 leading-relaxed">
                    <span className="font-semibold text-[#0F1115]">IA: </span>
                    {workout.aiAnalysis}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
