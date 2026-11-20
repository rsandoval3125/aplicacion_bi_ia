import {Download, Plus} from 'lucide-react';
import {MobileTab} from '../types/workout';

interface TopBarProps {
  activeSection: MobileTab;
  onNavigate: (tab: MobileTab) => void;
  onNewSession: () => void;
  onExportCsv: () => void;
  hasWorkouts: boolean;
}

export function TopBar({
  activeSection,
  onNavigate,
  onNewSession,
  onExportCsv,
  hasWorkouts,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-12 lg:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('registrar');
          }}
          className="font-display text-2xl font-extrabold tracking-tight text-[#0F1115] whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>RunTracker Sheets</span>
        </a>

        {/* Zone 2: Concise single-line desktop nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigate('registrar')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'registrar'
                ? 'text-[#0F1115] border-[#0F1115] font-semibold'
                : 'border-transparent hover:text-[#0F1115]'
            }`}
          >
            Registrar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('historial')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'historial'
                ? 'text-[#0F1115] border-[#0F1115] font-semibold'
                : 'border-transparent hover:text-[#0F1115]'
            }`}
          >
            Historial
          </button>
          <button
            type="button"
            onClick={() => onNavigate('conexion')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'conexion'
                ? 'text-[#0F1115] border-[#0F1115] font-semibold'
                : 'border-transparent hover:text-[#0F1115]'
            }`}
          >
            Conexión Sheets
          </button>
          {hasWorkouts && (
            <button
              type="button"
              onClick={onExportCsv}
              className="py-1 text-slate-600 hover:text-[#0F1115] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Exportar CSV</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewSession}
            className="min-h-[40px] lg:min-h-[42px] px-4 py-2 rounded-xl bg-[#0F1115] text-[#D2FA05] hover:bg-slate-800 active:scale-[0.98] transition-all text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Nueva sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
