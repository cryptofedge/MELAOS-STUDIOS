'use client';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flag, Loader2, X } from 'lucide-react';
import { useAudioStore } from '@/lib/store';
import {
  REPORT_REASONS, REPORT_DETAILS_MAX,
  type ReportKind, type ReportReason, type ReportContext,
} from '@/lib/reports';

// "Report" action for AI-generated content. Google Play requires apps that
// generate content with AI to let people flag offensive output in-app; the
// report goes to /api/report, which logs it and forwards it to the team.

const TEXT = {
  es: {
    button: 'Reportar',
    title: 'Reportar contenido',
    intro: (what: string) => `¿Qué tiene de malo ${what}? Tu reporte llega al equipo de MELAOS para revisarlo.`,
    what: { song: 'esta canción generada por IA', lyrics: 'esta letra generada por IA', 'cover-art': 'esta portada generada por IA', chat: 'esta respuesta de Melao' },
    reasons: {
      offensive: 'Ofensivo, de odio o discriminatorio',
      sexual: 'Contenido sexual',
      violence: 'Violencia o actividades peligrosas',
      harassment: 'Acoso o ataques a una persona real',
      copyright: 'Copia de una obra o de un artista real',
      other: 'Otro',
    },
    details: 'Detalles (opcional)',
    detailsPlaceholder: 'Cuéntanos qué viste o escuchaste…',
    cancel: 'Cancelar',
    send: 'Enviar reporte',
    sending: 'Enviando…',
    thanks: 'Gracias. Recibimos tu reporte y lo vamos a revisar.',
    close: 'Cerrar',
    failed: 'No se pudo enviar el reporte. Inténtalo de nuevo.',
    pick: 'Elige un motivo.',
  },
  en: {
    button: 'Report',
    title: 'Report content',
    intro: (what: string) => `What is wrong with ${what}? Your report goes to the MELAOS team for review.`,
    what: { song: 'this AI-generated song', lyrics: 'these AI-generated lyrics', 'cover-art': 'this AI-generated cover art', chat: 'this reply from Melao' },
    reasons: {
      offensive: 'Offensive, hateful or discriminatory',
      sexual: 'Sexual content',
      violence: 'Violence or dangerous activities',
      harassment: 'Harassment or attacks on a real person',
      copyright: 'Copies a real work or artist',
      other: 'Something else',
    },
    details: 'Details (optional)',
    detailsPlaceholder: 'Tell us what you saw or heard…',
    cancel: 'Cancel',
    send: 'Send report',
    sending: 'Sending…',
    thanks: 'Thanks. We got your report and will review it.',
    close: 'Close',
    failed: 'The report could not be sent. Please try again.',
    pick: 'Choose a reason.',
  },
} as const;

type Props = {
  kind: ReportKind;
  /** Called when the dialog opens: what is being reported, as text. */
  getContext: () => ReportContext;
  className?: string;
  /** Icon-only trigger, for tight spots like chat bubbles. */
  iconOnly?: boolean;
};

export default function ReportButton({ kind, getContext, className, iconOnly }: Props) {
  const lang = useAudioStore(s => s.uiLang);
  const tx = TEXT[lang] ?? TEXT.es;
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<ReportContext>({});
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const openDialog = () => {
    // Snapshot now, so a regeneration while the dialog is open does not
    // change what gets reported.
    setContext(getContext());
    setReason(null);
    setDetails('');
    setStatus('idle');
    setError(null);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = async () => {
    if (!reason) { setError(tx.pick); return; }
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, reason, details, context, lang, page: window.location.pathname }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || tx.failed);
      }
      setStatus('sent');
    } catch (e: any) {
      setStatus('error');
      setError(e?.message || tx.failed);
    }
  };

  const dialog = open && (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4"
      // React events bubble out of portals to the parent tree; stop them so a
      // click here never reaches the panel or modal the button sits in.
      onClick={e => { e.stopPropagation(); setOpen(false); }}
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-ink-2 border border-line-strong rounded-t-[26px] sm:rounded-[26px] p-5 sm:p-6 text-left max-h-[90dvh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 id={titleId} className="display text-lg text-white flex items-center gap-2.5">
            <Flag className="w-4 h-4 text-melaos-hot" strokeWidth={1.75} /> {tx.title}
          </h2>
          <button onClick={() => setOpen(false)} aria-label={tx.close}
            className="touch-target -mr-2 text-fog hoverable:hover:text-white">
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {status === 'sent' ? (
          <>
            <p className="text-sm text-[#ECECF1] my-4 leading-relaxed">{tx.thanks}</p>
            <button onClick={() => setOpen(false)}
              className="btn btn-primary w-full">
              {tx.close}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-fog mb-4 leading-relaxed">{tx.intro(tx.what[kind])}</p>
            <fieldset className="flex flex-col gap-1.5 mb-5">
              {REPORT_REASONS.map((r, i) => (
                <label key={r}
                  className={`flex items-center gap-3 px-3.5 min-h-[44px] rounded-xl cursor-pointer text-sm transition-colors ${
                    reason === r ? 'bg-melaos-hot/15 text-white ring-1 ring-melaos-hot' : 'bg-ink-3 text-fog hoverable:hover:bg-ink-4 hoverable:hover:text-white'
                  }`}>
                  <input type="radio" name={`${titleId}-reason`} value={r} checked={reason === r}
                    onChange={() => { setReason(r); setError(null); }}
                    autoFocus={i === 0} className="w-3.5 h-3.5 border border-line-strong rounded-full checked:bg-melaos-hot checked:border-melaos-hot shrink-0" />
                  {tx.reasons[r]}
                </label>
              ))}
            </fieldset>
            <label className="block label mb-2">{tx.details}</label>
            <textarea value={details} onChange={e => setDetails(e.target.value.slice(0, REPORT_DETAILS_MAX))}
              rows={3} placeholder={tx.detailsPlaceholder}
              className="field text-sm resize-none mb-3" />
            {error && <p className="text-xs text-melaos-hot mb-3" role="alert">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)}
                className="btn btn-ghost flex-1">
                {tx.cancel}
              </button>
              <button onClick={submit} disabled={status === 'sending'}
                className="btn flex-1 bg-melaos-hot text-white rounded-xs disabled:opacity-60">
                {status === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" /> {tx.sending}</> : tx.send}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={openDialog}
        aria-label={iconOnly ? tx.button : undefined} title={tx.button}
        className={className ?? 'inline-flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-fog-dim hoverable:hover:text-melaos-hot transition-colors'}>
        <Flag className="w-3 h-3" strokeWidth={1.75} />
        {!iconOnly && <span>{tx.button}</span>}
      </button>
      {dialog && typeof document !== 'undefined' && createPortal(dialog, document.body)}
    </>
  );
}
