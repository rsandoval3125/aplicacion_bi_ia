import {AppsScriptPayload, WorkoutType} from '../types/workout';

export async function sendWorkoutToGoogleSheets(
  appsScriptUrl: string,
  payload: AppsScriptPayload,
): Promise<void> {
  const cleanUrl = appsScriptUrl.trim();
  if (!cleanUrl) {
    throw new Error('Configura una URL de Google Apps Script (/exec) válida.');
  }

  let parsed: URL;
  try {
    parsed = new URL(cleanUrl);
  } catch {
    throw new Error('La URL de Google Apps Script no tiene un formato válido.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('La URL debe comenzar con https:// o http://.');
  }

  const exactPayload: AppsScriptPayload = {
    fecha: payload.fecha,
    tipo: payload.tipo,
    distancia_km: payload.distancia_km,
    duracion_min: payload.duracion_min,
    notas: payload.notas,
  };

  await fetch(cleanUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(exactPayload),
  });
}

export async function analyzeWorkoutWithAI(input: {
  fecha: string;
  tipo: WorkoutType;
  distancia_km: number;
  duracion_min: number;
  ritmo: string;
  notas: string;
}): Promise<string> {
  const response = await fetch('/api/analyze-workout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => ({}))) as {
    analysis?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo obtener el análisis de entrenamiento con Gemini.');
  }

  if (!data.analysis) {
    throw new Error('La respuesta del entrenador IA llegó vacía.');
  }

  return data.analysis;
}
