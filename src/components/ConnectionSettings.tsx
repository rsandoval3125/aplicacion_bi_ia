import {Check, ChevronDown, ChevronUp, Code2, Copy, Link2, RotateCcw} from 'lucide-react';
import {useState} from 'react';
import {DEFAULT_APPS_SCRIPT_URL} from '../utils/pace';

interface ConnectionSettingsProps {
  appsScriptUrl: string;
  onChangeUrl: (url: string) => void;
  demoMode: boolean;
  onToggleDemoMode: (next: boolean) => void;
}

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.fecha,
    data.tipo,
    data.distancia_km,
    data.duracion_min,
    data.notas || ""
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export function ConnectionSettings({
  appsScriptUrl,
  onChangeUrl,
  demoMode,
  onToggleDemoMode,
}: ConnectionSettingsProps) {
  const [draftUrl, setDraftUrl] = useState(appsScriptUrl);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [showScriptHelp, setShowScriptHelp] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveUrl = () => {
    const trimmed = draftUrl.trim();
    onChangeUrl(trimmed || DEFAULT_APPS_SCRIPT_URL);
    if (!trimmed) {
      setDraftUrl(DEFAULT_APPS_SCRIPT_URL);
    }
    setSavedNotice('URL guardada en localStorage');
    window.setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleResetDefault = () => {
    setDraftUrl(DEFAULT_APPS_SCRIPT_URL);
    onChangeUrl(DEFAULT_APPS_SCRIPT_URL);
    setSavedNotice('URL predeterminada restaurada');
    window.setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  };

  return (
    <section
      aria-label="Configuración y conexión con Google Sheets"
      className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F1115]">
          Conexión Google Sheets
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Envío directo vía Google Apps Script sin OAuth ni inicio de sesión
        </p>
      </div>

      {/* Offline / Demo Mode Switch */}
      <div className="rounded-2xl bg-[#F4F5F7] p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0F1115]">
            Modo demo / local (sin conexión)
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {demoMode
              ? 'Activo: guarda sesiones solo en localStorage para pruebas sin enviar a Sheets.'
              : 'Desactivado: cada registro dispara POST hacia tu Google Apps Script.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={demoMode}
          aria-label="Alternar modo demo local sin conexión"
          onClick={() => onToggleDemoMode(!demoMode)}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115] ${
            demoMode ? 'bg-[#0F1115]' : 'bg-slate-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              demoMode ? 'translate-x-6 bg-[#D2FA05]' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Apps Script URL Input */}
      <div className="space-y-2.5">
        <label
          htmlFor="apps_script_url"
          className="block text-xs font-semibold text-slate-700"
        >
          URL de Google Apps Script (/exec)
        </label>
        <div className="relative">
          <Link2
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none"
            aria-hidden="true"
          />
          <textarea
            id="apps_script_url"
            rows={3}
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] pl-10 pr-4 py-3 text-xs font-mono text-[#0F1115] placeholder:text-slate-400 focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors break-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveUrl}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F1115] text-white hover:bg-slate-800 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Guardar URL
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F4F5F7] text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Restaurar predeterminada</span>
          </button>
          {savedNotice && (
            <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{savedNotice}</span>
            </span>
          )}
        </div>
      </div>

      {/* Collapsible Technical Reference for Apps Script */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowScriptHelp((prev) => !prev)}
          className="w-full min-h-[44px] flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-[#0F1115] transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Code2 className="w-4 h-4" aria-hidden="true" />
            <span>Ver estructura JSON y código Apps Script</span>
          </span>
          {showScriptHelp ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {showScriptHelp && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada envío utiliza <span className="font-mono text-[#0F1115]">mode: &apos;no-cors&apos;</span> y{' '}
              <span className="font-mono text-[#0F1115]">Content-Type: text/plain;charset=utf-8</span> con el JSON:{' '}
              <span className="font-mono text-[#0F1115]">
                {`{ fecha, tipo, distancia_km, duracion_min, notas }`}
              </span>.
            </p>
            <div className="relative">
              <pre className="rounded-2xl bg-[#0F1115] text-slate-200 p-4 text-[11px] font-mono overflow-x-auto leading-relaxed">
                {APPS_SCRIPT_SNIPPET}
              </pre>
              <button
                type="button"
                onClick={handleCopySnippet}
                className="absolute top-2.5 right-2.5 min-h-[34px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3" aria-hidden="true" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
