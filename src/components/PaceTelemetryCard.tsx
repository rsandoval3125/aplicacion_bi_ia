import {Gauge} from 'lucide-react';
import {PaceMetrics, WorkoutType} from '../types/workout';

interface PaceTelemetryCardProps {
  pace: PaceMetrics;
  tipo: WorkoutType;
  distanciaKm: number;
  duracionMin: number;
  fecha: string;
}

export function PaceTelemetryCard({
  pace,
  tipo,
  distanciaKm,
  duracionMin,
  fecha,
}: PaceTelemetryCardProps) {
  // Calculate ring fill ratio (faster pace fills more ring; 3:00/km -> 100%, 15:00/km -> 15%)
  const ratio =
    pace.secondsPerKm !== null
      ? Math.max(0.15, Math.min(1, 1 - (pace.secondsPerKm - 180) / 720))
      : 0;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <section
      aria-label="Ritmo calculado en tiempo real"
      className="bg-[#0F1115] text-white rounded-3xl p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 tracking-wide">
            Ritmo medio en tiempo real
          </p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums text-[#D2FA05]">
              {pace.mmss}
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-slate-300">
              min/km
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-white">{pace.zoneLabel}</span>
            {pace.speedKmh !== null && (
              <>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="font-mono tabular-nums text-slate-300">
                  {pace.speedKmh} km/h
                </span>
              </>
            )}
          </p>
        </div>

        {/* Pace Ring Telemetry */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#D2FA05"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <Gauge className="w-6 h-6 text-[#D2FA05] absolute" aria-hidden="true" />
        </div>
      </div>

      {/* Live Unboxed Session Summary Strip */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-white">{tipo}</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="font-mono tabular-nums">
            {distanciaKm > 0 ? `${distanciaKm.toFixed(2)} km` : '0.00 km'}
          </span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="font-mono tabular-nums">
            {duracionMin > 0 ? `${duracionMin} min` : '0 min'}
          </span>
        </div>
        <span className="font-mono tabular-nums text-slate-400">{fecha}</span>
      </div>
    </section>
  );
}
