export type WorkoutType = 'Correr' | 'Caminata' | 'Trail';

export type WorkoutFilter = 'Todos' | WorkoutType;

export type SyncStatus = 'sent_to_sheets' | 'local_demo';

export type MobileTab = 'registrar' | 'historial' | 'conexion';

export interface WorkoutRecord {
  id: string;
  fecha: string;
  tipo: WorkoutType;
  distancia_km: number;
  duracion_min: number;
  ritmo: string;
  notas: string;
  aiAnalysis?: string;
  syncStatus: SyncStatus;
  createdAt: string;
}

export interface AppsScriptPayload {
  fecha: string;
  tipo: WorkoutType;
  distancia_km: number;
  duracion_min: number;
  notas: string;
}

export interface PaceMetrics {
  formatted: string;
  mmss: string;
  secondsPerKm: number | null;
  speedKmh: number | null;
  zoneLabel: string;
}
