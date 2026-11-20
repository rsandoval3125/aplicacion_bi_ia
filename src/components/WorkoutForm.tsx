import {AlertCircle, Bot, CheckCircle2, CloudUpload, Footprints, HardDrive, Loader2, Mountain, Route} from 'lucide-react';
import {FormEvent, RefObject} from 'react';
import {PaceMetrics, WorkoutType} from '../types/workout';
import {WORKOUT_TYPES} from '../utils/pace';

interface WorkoutFormProps {
  fecha: string;
  onFechaChange: (val: string) => void;
  tipo: WorkoutType;
  onTipoChange: (val: WorkoutType) => void;
  distanciaStr: string;
  onDistanciaChange: (val: string) => void;
  duracionStr: string;
  onDuracionChange: (val: string) => void;
  notas: string;
  onNotasChange: (val: string) => void;
  pace: PaceMetrics;
  demoMode: boolean;
  isSubmitting: boolean;
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  aiError: string | null;
  submitFeedback: {
    type: 'sheets' | 'demo' | 'error';
    message: string;
    detail?: string;
  } | null;
  onAnalyzeAI: () => void;
  onAppendAIToNotes: () => void;
  onSubmit: (e: FormEvent) => void;
  distanceInputRef: RefObject<HTMLInputElement | null>;
}

function getWorkoutIcon(tipo: WorkoutType) {
  switch (tipo) {
    case 'Correr':
      return Route;
    case 'Caminata':
      return Footprints;
    case 'Trail':
      return Mountain;
  }
}

export function WorkoutForm({
  fecha,
  onFechaChange,
  tipo,
  onTipoChange,
  distanciaStr,
  onDistanciaChange,
  duracionStr,
  onDuracionChange,
  notas,
  onNotasChange,
  pace,
  demoMode,
  isSubmitting,
  isAnalyzing,
  aiAnalysis,
  aiError,
  submitFeedback,
  onAnalyzeAI,
  onAppendAIToNotes,
  onSubmit,
  distanceInputRef,
}: WorkoutFormProps) {
  const distanciaNum = Number(distanciaStr);
  const duracionNum = Number(duracionStr);
  const hasValidMetrics =
    Number.isFinite(distanciaNum) &&
    distanciaNum > 0 &&
    Number.isFinite(duracionNum) &&
    duracionNum > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5"
      noValidate
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1115]">
            Registrar entrenamiento
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {demoMode
              ? 'Modo demo activo · se guardará localmente en este dispositivo'
              : 'Sincronización directa con Google Sheets y respaldo local'}
          </p>
        </div>
      </div>

      {/* Modalidad (Tipo) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Tipo de actividad
        </label>
        <div className="grid grid-cols-3 gap-2">
          {WORKOUT_TYPES.map((item) => {
            const Icon = getWorkoutIcon(item);
            const active = tipo === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onTipoChange(item)}
                className={`min-h-[48px] px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115] ${
                  active
                    ? 'bg-[#0F1115] text-[#D2FA05] shadow-xs'
                    : 'bg-[#F4F5F7] text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distancia y Duración */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="distancia_km"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Distancia (km)
          </label>
          <div className="relative">
            <input
              ref={distanceInputRef}
              id="distancia_km"
              name="distancia_km"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="5.00"
              value={distanciaStr}
              onChange={(e) => onDistanciaChange(e.target.value)}
              required
              className="w-full min-h-[52px] rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 pr-11 text-xl font-display font-bold tabular-nums text-[#0F1115] placeholder:text-slate-400 focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
              km
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="duracion_min"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Duración (min)
          </label>
          <div className="relative">
            <input
              id="duracion_min"
              name="duracion_min"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="28"
              value={duracionStr}
              onChange={(e) => onDuracionChange(e.target.value)}
              required
              className="w-full min-h-[52px] rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 pr-12 text-xl font-display font-bold tabular-nums text-[#0F1115] placeholder:text-slate-400 focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
              min
            </span>
          </div>
        </div>
      </div>

      {/* Fecha y Ritmo inline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="fecha"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Fecha
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            required
            className="w-full min-h-[48px] rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 text-sm font-mono tabular-nums text-[#0F1115] focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ritmo calculado
          </span>
          <div className="min-h-[48px] rounded-2xl border border-slate-200 bg-[#F4F5F7] px-4 flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold tabular-nums text-[#0F1115]">
              {pace.formatted}
            </span>
            <span className="text-xs text-slate-500 truncate">{pace.zoneLabel}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label
          htmlFor="notas"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Notas de la sesión
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={2}
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Sensaciones, desnivel, intervalos o clima..."
          className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F1115] placeholder:text-slate-400 focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors resize-y"
        />
      </div>

      {/* Gemini AI Coach Block */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onAnalyzeAI}
          disabled={isAnalyzing || !hasValidMetrics}
          className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-[#0F1115] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all text-sm font-semibold flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analizando sesión con Gemini...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" aria-hidden="true" />
              <span>Analizar con IA</span>
            </>
          )}
        </button>

        {aiError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-800 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span>{aiError}</span>
          </div>
        )}

        {aiAnalysis && (
          <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#0F1115] inline-flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Análisis del entrenador IA</span>
              </span>
              <button
                type="button"
                onClick={onAppendAIToNotes}
                className="text-xs font-semibold text-slate-700 hover:text-[#0F1115] underline underline-offset-2 whitespace-nowrap shrink-0"
              >
                Agregar a notas
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{aiAnalysis}</p>
          </div>
        )}
      </div>

      {/* Primary Submit CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-[#D2FA05] text-[#0F1115] hover:bg-[#c3ea04] disabled:opacity-60 active:scale-[0.99] transition-all text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Procesando registro...</span>
          </>
        ) : demoMode ? (
          <>
            <HardDrive className="w-4 h-4" aria-hidden="true" />
            <span>Guardar en modo demo (local)</span>
          </>
        ) : (
          <>
            <CloudUpload className="w-4 h-4" aria-hidden="true" />
            <span>Guardar y enviar a Google Sheets</span>
          </>
        )}
      </button>

      {/* Submission Status Message */}
      {submitFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border p-4 text-sm flex items-start gap-3 ${
            submitFeedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : submitFeedback.type === 'demo'
                ? 'border-slate-300 bg-slate-100 text-[#0F1115]'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
          }`}
        >
          {submitFeedback.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
          ) : (
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                submitFeedback.type === 'demo' ? 'text-slate-700' : 'text-emerald-700'
              }`}
              aria-hidden="true"
            />
          )}
          <div className="space-y-1 min-w-0">
            <p className="font-semibold">{submitFeedback.message}</p>
            {submitFeedback.detail && (
              <p className="text-xs opacity-85 leading-relaxed">{submitFeedback.detail}</p>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
