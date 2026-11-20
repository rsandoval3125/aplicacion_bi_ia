import {PaceMetrics, WorkoutType} from '../types/workout';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwn4izaObjjdrJS8SKTrFBer6ScQAOKN0zhZKLFp0AvW4tBdra1MmsNpGU7Vu3Wanc73w/exec';

export const STORAGE_KEYS = {
  APPS_SCRIPT_URL: 'runtracker_apps_script_url',
  WORKOUTS: 'runtracker_workouts_v1',
  DEMO_MODE: 'runtracker_demo_mode',
} as const;

export const WORKOUT_TYPES: WorkoutType[] = ['Correr', 'Caminata', 'Trail'];

export function getTodayLocalYYYYMMDD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculatePace(
  distanciaKm: number,
  duracionMin: number,
  tipo: WorkoutType = 'Correr',
): PaceMetrics {
  if (
    !Number.isFinite(distanciaKm) ||
    !Number.isFinite(duracionMin) ||
    distanciaKm <= 0 ||
    duracionMin <= 0
  ) {
    return {
      formatted: '--:-- min/km',
      mmss: '--:--',
      secondsPerKm: null,
      speedKmh: null,
      zoneLabel: 'Ingresa distancia y tiempo',
    };
  }

  const rawSecondsPerKm = (duracionMin * 60) / distanciaKm;
  if (!Number.isFinite(rawSecondsPerKm) || rawSecondsPerKm <= 0 || rawSecondsPerKm > 5999) {
    return {
      formatted: '--:-- min/km',
      mmss: '--:--',
      secondsPerKm: null,
      speedKmh: null,
      zoneLabel: 'Valores fuera de rango',
    };
  }

  const totalSeconds = Math.round(rawSecondsPerKm);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const mmss = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const speedKmh = Number(((distanciaKm / duracionMin) * 60).toFixed(1));

  let zoneLabel = 'Ritmo aeróbico';
  if (tipo === 'Caminata') {
    if (mins < 9) zoneLabel = 'Marcha rápida';
    else if (mins <= 12) zoneLabel = 'Paso activo';
    else zoneLabel = 'Caminata suave';
  } else if (tipo === 'Trail') {
    if (mins < 5) zoneLabel = 'Trail rápido';
    else if (mins <= 7) zoneLabel = 'Trail constante';
    else zoneLabel = 'Trail técnico / desnivel';
  } else {
    if (mins < 4) zoneLabel = 'Velocidad / series';
    else if (mins < 5) zoneLabel = 'Ritmo umbral';
    else if (mins <= 6) zoneLabel = 'Aeróbico sostenido';
    else zoneLabel = 'Rodaje suave';
  }

  return {
    formatted: `${mmss} min/km`,
    mmss,
    secondsPerKm: totalSeconds,
    speedKmh,
    zoneLabel,
  };
}

export function formatDateSpanish(yyyyMmDd: string): string {
  const parts = yyyyMmDd.split('-');
  if (parts.length !== 3) return yyyyMmDd;
  const [y, m, d] = parts.map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return yyyyMmDd;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
