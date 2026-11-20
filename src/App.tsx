import {FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import {ConnectionSettings} from './components/ConnectionSettings';
import {MobileBottomNav} from './components/MobileBottomNav';
import {PaceTelemetryCard} from './components/PaceTelemetryCard';
import {TopBar} from './components/TopBar';
import {WorkoutForm} from './components/WorkoutForm';
import {WorkoutHistory} from './components/WorkoutHistory';
import {analyzeWorkoutWithAI, sendWorkoutToGoogleSheets} from './services/sheetsService';
import {MobileTab, WorkoutFilter, WorkoutRecord, WorkoutType} from './types/workout';
import {
  calculatePace,
  DEFAULT_APPS_SCRIPT_URL,
  getTodayLocalYYYYMMDD,
  STORAGE_KEYS,
} from './utils/pace';

function loadStoredWorkouts(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkoutRecord[]) : [];
  } catch {
    return [];
  }
}

function loadStoredUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL);
    return saved && saved.trim() ? saved.trim() : DEFAULT_APPS_SCRIPT_URL;
  } catch {
    return DEFAULT_APPS_SCRIPT_URL;
  }
}

function loadDemoMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MobileTab>('registrar');

  // Form state
  const [fecha, setFecha] = useState<string>(() => getTodayLocalYYYYMMDD());
  const [tipo, setTipo] = useState<WorkoutType>('Correr');
  const [distanciaStr, setDistanciaStr] = useState<string>('5');
  const [duracionStr, setDuracionStr] = useState<string>('26');
  const [notas, setNotas] = useState<string>('');

  // Persisted app state
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(loadStoredWorkouts);
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(loadStoredUrl);
  const [demoMode, setDemoMode] = useState<boolean>(loadDemoMode);
  const [filter, setFilter] = useState<WorkoutFilter>('Todos');

  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'sheets' | 'demo' | 'error';
    message: string;
    detail?: string;
  } | null>(null);

  const distanceInputRef = useRef<HTMLInputElement | null>(null);
  const registrarRef = useRef<HTMLDivElement | null>(null);
  const historialRef = useRef<HTMLDivElement | null>(null);
  const conexionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch {
      // Ignore storage quota errors
    }
  }, [workouts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_URL, appsScriptUrl);
    } catch {
      // Ignore storage errors
    }
  }, [appsScriptUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(demoMode));
    } catch {
      // Ignore storage errors
    }
  }, [demoMode]);

  const distanciaNum = Number(distanciaStr);
  const duracionNum = Number(duracionStr);

  const pace = useMemo(
    () => calculatePace(distanciaNum, duracionNum, tipo),
    [distanciaNum, duracionNum, tipo],
  );

  const handleNavigate = (tab: MobileTab) => {
    setActiveTab(tab);
    const refMap: Record<MobileTab, HTMLDivElement | null> = {
      registrar: registrarRef.current,
      historial: historialRef.current,
      conexion: conexionRef.current,
    };
    const target = refMap[tab];
    if (target && window.innerWidth >= 1024) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  const handleNewSession = () => {
    setActiveTab('registrar');
    setFecha(getTodayLocalYYYYMMDD());
    setDistanciaStr('');
    setDuracionStr('');
    setNotas('');
    setAiAnalysis(null);
    setAiError(null);
    setSubmitFeedback(null);
    window.setTimeout(() => {
      distanceInputRef.current?.focus();
    }, 60);
  };

  const handleAnalyzeAI = async () => {
    setAiError(null);
    if (
      !Number.isFinite(distanciaNum) ||
      distanciaNum <= 0 ||
      !Number.isFinite(duracionNum) ||
      duracionNum <= 0
    ) {
      setAiError('Ingresa una distancia y duración válidas mayores a 0 para analizar la sesión.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const comment = await analyzeWorkoutWithAI({
        fecha,
        tipo,
        distancia_km: distanciaNum,
        duracion_min: duracionNum,
        ritmo: pace.formatted,
        notas: notas.trim(),
      });
      setAiAnalysis(comment);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'No se pudo obtener el análisis de entrenamiento.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAppendAIToNotes = () => {
    if (!aiAnalysis) return;
    setNotas((prev) => (prev.trim() ? `${prev.trim()} | IA: ${aiAnalysis}` : `IA: ${aiAnalysis}`));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitFeedback(null);

    if (!fecha) {
      setSubmitFeedback({
        type: 'error',
        message: 'Selecciona la fecha del entrenamiento.',
      });
      return;
    }

    if (!Number.isFinite(distanciaNum) || distanciaNum <= 0) {
      setSubmitFeedback({
        type: 'error',
        message: 'Ingresa una distancia válida en kilómetros (mayor a 0).',
      });
      return;
    }

    if (!Number.isFinite(duracionNum) || duracionNum <= 0) {
      setSubmitFeedback({
        type: 'error',
        message: 'Ingresa una duración válida en minutos (mayor a 0).',
      });
      return;
    }

    const cleanNotes = notas.trim();
    const recordId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setIsSubmitting(true);

    try {
      if (demoMode) {
        const localRecord: WorkoutRecord = {
          id: recordId,
          fecha,
          tipo,
          distancia_km: Number(distanciaNum.toFixed(2)),
          duracion_min: Number(duracionNum.toFixed(1)),
          ritmo: pace.formatted,
          notas: cleanNotes,
          aiAnalysis: aiAnalysis ?? undefined,
          syncStatus: 'local_demo',
          createdAt: new Date().toISOString(),
        };
        setWorkouts((prev) => [localRecord, ...prev]);
        setSubmitFeedback({
          type: 'demo',
          message: 'Guardado en modo demo (localStorage)',
          detail: `${localRecord.tipo} · ${localRecord.distancia_km} km en ${localRecord.duracion_min} min (${localRecord.ritmo}). No se disparó envío a Google Sheets.`,
        });
        setDistanciaStr('');
        setDuracionStr('');
        setNotas('');
        setAiAnalysis(null);
        return;
      }

      await sendWorkoutToGoogleSheets(appsScriptUrl, {
        fecha,
        tipo,
        distancia_km: Number(distanciaNum.toFixed(2)),
        duracion_min: Number(duracionNum.toFixed(1)),
        notas: cleanNotes,
      });

      const syncedRecord: WorkoutRecord = {
        id: recordId,
        fecha,
        tipo,
        distancia_km: Number(distanciaNum.toFixed(2)),
        duracion_min: Number(duracionNum.toFixed(1)),
        ritmo: pace.formatted,
        notas: cleanNotes,
        aiAnalysis: aiAnalysis ?? undefined,
        syncStatus: 'sent_to_sheets',
        createdAt: new Date().toISOString(),
      };

      setWorkouts((prev) => [syncedRecord, ...prev]);
      setSubmitFeedback({
        type: 'sheets',
        message: 'Envío disparado hacia Google Sheets',
        detail: `Se guardó en tu historial local y se envió el JSON { fecha, tipo, distancia_km, duracion_min, notas } a la URL /exec configurada (${syncedRecord.distancia_km} km · ${syncedRecord.ritmo}).`,
      });
      setDistanciaStr('');
      setDuracionStr('');
      setNotas('');
      setAiAnalysis(null);
    } catch (err) {
      const fallbackRecord: WorkoutRecord = {
        id: recordId,
        fecha,
        tipo,
        distancia_km: Number(distanciaNum.toFixed(2)),
        duracion_min: Number(duracionNum.toFixed(1)),
        ritmo: pace.formatted,
        notas: cleanNotes,
        aiAnalysis: aiAnalysis ?? undefined,
        syncStatus: 'local_demo',
        createdAt: new Date().toISOString(),
      };
      setWorkouts((prev) => [fallbackRecord, ...prev]);
      setSubmitFeedback({
        type: 'error',
        message: 'Guardado localmente, pero falló el envío a Google Sheets',
        detail:
          err instanceof Error
            ? `${err.message} El registro quedó guardado en tu historial local para reintentarlo.`
            : 'Revisa tu conexión o la URL /exec en Configuración.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncLocalRecord = async (workout: WorkoutRecord) => {
    try {
      await sendWorkoutToGoogleSheets(appsScriptUrl, {
        fecha: workout.fecha,
        tipo: workout.tipo,
        distancia_km: workout.distancia_km,
        duracion_min: workout.duracion_min,
        notas: workout.notas,
      });
      setWorkouts((prev) =>
        prev.map((item) =>
          item.id === workout.id ? {...item, syncStatus: 'sent_to_sheets'} : item,
        ),
      );
      setSubmitFeedback({
        type: 'sheets',
        message: 'Envío disparado hacia Google Sheets',
        detail: `La sesión pendiente del ${workout.fecha} (${workout.distancia_km} km) fue enviada al endpoint /exec.`,
      });
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        message: 'No se pudo reenviar la sesión a Google Sheets',
        detail: err instanceof Error ? err.message : 'Verifica tu URL de Apps Script.',
      });
    }
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadDemoSamples = () => {
    const today = getTodayLocalYYYYMMDD();
    const samples: WorkoutRecord[] = [
      {
        id: `demo-1-${Date.now()}`,
        fecha: today,
        tipo: 'Correr',
        distancia_km: 6.5,
        duracion_min: 32,
        ritmo: calculatePace(6.5, 32, 'Correr').formatted,
        notas: 'Rodaje progresivo en asfalto, últimos 2 km a ritmo vivo.',
        syncStatus: 'local_demo',
        createdAt: new Date().toISOString(),
      },
      {
        id: `demo-2-${Date.now() + 1}`,
        fecha: today,
        tipo: 'Trail',
        distancia_km: 8.2,
        duracion_min: 54,
        ritmo: calculatePace(8.2, 54, 'Trail').formatted,
        notas: 'Sendero con subida técnica y buen control en bajada.',
        syncStatus: 'local_demo',
        createdAt: new Date().toISOString(),
      },
      {
        id: `demo-3-${Date.now() + 2}`,
        fecha: today,
        tipo: 'Caminata',
        distancia_km: 4.0,
        duracion_min: 38,
        ritmo: calculatePace(4.0, 38, 'Caminata').formatted,
        notas: 'Caminata activa de recuperación.',
        syncStatus: 'local_demo',
        createdAt: new Date().toISOString(),
      },
    ];
    setWorkouts((prev) => [...samples, ...prev]);
  };

  const handleExportCsv = () => {
    if (workouts.length === 0) return;
    const headers = ['fecha', 'tipo', 'distancia_km', 'duracion_min', 'ritmo', 'notas', 'estado'];
    const escapeCsv = (val: string | number) => {
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = workouts.map((w) =>
      [
        escapeCsv(w.fecha),
        escapeCsv(w.tipo),
        w.distancia_km,
        w.duracion_min,
        escapeCsv(w.ritmo),
        escapeCsv(w.notas),
        escapeCsv(w.syncStatus === 'sent_to_sheets' ? 'Enviado a Sheets' : 'Local Demo'),
      ].join(','),
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `runtracker-sheets-${getTodayLocalYYYYMMDD()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F4F5F7]">
      <TopBar
        activeSection={activeTab}
        onNavigate={handleNavigate}
        onNewSession={handleNewSession}
        onExportCsv={handleExportCsv}
        hasWorkouts={workouts.length > 0}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Telemetry + Quick Form */}
          <div
            ref={registrarRef}
            className={`lg:col-span-6 space-y-5 scroll-mt-20 ${
              activeTab === 'registrar' ? 'block' : 'hidden lg:block'
            }`}
          >
            <PaceTelemetryCard
              pace={pace}
              tipo={tipo}
              distanciaKm={Number.isFinite(distanciaNum) ? distanciaNum : 0}
              duracionMin={Number.isFinite(duracionNum) ? duracionNum : 0}
              fecha={fecha}
            />

            <WorkoutForm
              fecha={fecha}
              onFechaChange={setFecha}
              tipo={tipo}
              onTipoChange={setTipo}
              distanciaStr={distanciaStr}
              onDistanciaChange={setDistanciaStr}
              duracionStr={duracionStr}
              onDuracionChange={setDuracionStr}
              notas={notas}
              onNotasChange={setNotas}
              pace={pace}
              demoMode={demoMode}
              isSubmitting={isSubmitting}
              isAnalyzing={isAnalyzing}
              aiAnalysis={aiAnalysis}
              aiError={aiError}
              submitFeedback={submitFeedback}
              onAnalyzeAI={handleAnalyzeAI}
              onAppendAIToNotes={handleAppendAIToNotes}
              onSubmit={handleSubmit}
              distanceInputRef={distanceInputRef}
            />
          </div>

          {/* Right Column: History + Google Apps Script Connection */}
          <div className="lg:col-span-6 space-y-6">
            <div
              ref={historialRef}
              className={`scroll-mt-20 ${
                activeTab === 'historial' ? 'block' : 'hidden lg:block'
              }`}
            >
              <WorkoutHistory
                workouts={workouts}
                filter={filter}
                onFilterChange={setFilter}
                onDelete={handleDeleteWorkout}
                onSyncLocalRecord={handleSyncLocalRecord}
                onLoadDemoSamples={handleLoadDemoSamples}
                demoMode={demoMode}
              />
            </div>

            <div
              ref={conexionRef}
              className={`scroll-mt-20 ${
                activeTab === 'conexion' ? 'block' : 'hidden lg:block'
              }`}
            >
              <ConnectionSettings
                appsScriptUrl={appsScriptUrl}
                onChangeUrl={setAppsScriptUrl}
                demoMode={demoMode}
                onToggleDemoMode={setDemoMode}
              />
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        workoutCount={workouts.length}
      />
    </div>
  );
}
