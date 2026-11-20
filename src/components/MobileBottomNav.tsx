import {Activity, History, Settings2} from 'lucide-react';
import {MobileTab} from '../types/workout';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  workoutCount: number;
}

export function MobileBottomNav({
  activeTab,
  onChangeTab,
  workoutCount,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
    >
      <div className="grid grid-cols-3 items-center h-13">
        <button
          type="button"
          onClick={() => onChangeTab('registrar')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === 'registrar' ? 'text-[#0F1115]' : 'text-slate-500'
          }`}
        >
          <Activity
            className={`w-5 h-5 ${activeTab === 'registrar' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
            aria-hidden="true"
          />
          <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
            Registrar
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('historial')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === 'historial' ? 'text-[#0F1115]' : 'text-slate-500'
          }`}
        >
          <History
            className={`w-5 h-5 ${activeTab === 'historial' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
            aria-hidden="true"
          />
          <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
            Historial ({workoutCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('conexion')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === 'conexion' ? 'text-[#0F1115]' : 'text-slate-500'
          }`}
        >
          <Settings2
            className={`w-5 h-5 ${activeTab === 'conexion' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
            aria-hidden="true"
          />
          <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
            Conexión
          </span>
        </button>
      </div>
    </nav>
  );
}
