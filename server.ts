import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import {GoogleGenAI, ThinkingLevel} from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AnalyzeWorkoutBody {
  fecha?: string;
  tipo?: string;
  distancia_km?: number;
  duracion_min?: number;
  ritmo?: string;
  notas?: string;
}

async function createServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ok: true});
  });

  app.post('/api/analyze-workout', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            'No se encontró la clave GEMINI_API_KEY en el servidor. Configúrala en Settings > Secrets para usar el análisis con IA.',
        });
      }

      const body = (req.body ?? {}) as AnalyzeWorkoutBody;
      const tipo = typeof body.tipo === 'string' && body.tipo.trim() ? body.tipo.trim() : 'Correr';
      const distancia = Number(body.distancia_km);
      const duracion = Number(body.duracion_min);
      const ritmo = typeof body.ritmo === 'string' && body.ritmo.trim() ? body.ritmo.trim() : '--:-- min/km';
      const fecha = typeof body.fecha === 'string' && body.fecha.trim() ? body.fecha.trim() : '';
      const notas = typeof body.notas === 'string' ? body.notas.trim() : '';

      if (!Number.isFinite(distancia) || distancia <= 0 || !Number.isFinite(duracion) || duracion <= 0) {
        return res.status(400).json({
          error: 'Ingresa una distancia y una duración mayores a 0 antes de analizar la sesión.',
        });
      }

      const prompt = [
        `Analiza este entrenamiento registrado el ${fecha || 'hoy'}:`,
        `- Modalidad: ${tipo}`,
        `- Distancia: ${distancia} km`,
        `- Duración: ${duracion} min`,
        `- Ritmo medio calculado: ${ritmo}`,
        notas ? `- Notas del atleta: "${notas}"` : '- Notas del atleta: Sin notas adicionales.',
        '',
        'Entrega un comentario breve, concreto y práctico en español (máximo 75 palabras) que evalúe el esfuerzo/ritmo según la modalidad y dé 1 recomendación accionable para la recuperación o la próxima sesión.',
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres un entrenador deportivo experto en running, caminata de resistencia y trail running. Respondes en español neutro, con tono directo, claro, motivador y práctico. Evita introducciones largas, listas extensas o relleno. No inventes datos de frecuencia cardíaca ni métricas no proporcionadas.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const analysis = response.text?.trim();
      if (!analysis) {
        return res.status(502).json({
          error: 'El modelo no devolvió un análisis legible. Intenta de nuevo en unos segundos.',
        });
      }

      return res.json({analysis});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al consultar Gemini.';
      console.error('Error en /api/analyze-workout:', message);

      if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        return res.status(403).json({
          error:
            'La clave de Gemini no es válida o no tiene permisos. Verifica la configuración en Settings > Secrets.',
        });
      }

      if (message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error:
            'Se alcanzó el límite de solicitudes de la API de Gemini. Espera un momento o revisa tu cuota en Settings > Secrets.',
        });
      }

      return res.status(500).json({
        error: `No se pudo completar el análisis con IA: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RunTracker Sheets server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
