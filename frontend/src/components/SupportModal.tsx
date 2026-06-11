import { useEffect } from 'react'
import { Coffee, MessageCircle, X } from 'lucide-react'
import { Button } from './ui/button'

const YAPE_QR = 'https://unimauro.github.io/salariosperu/yape.png'
const YAPE_NUMERO = '940 584 307'

export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-lg font-bold text-foreground">Apoya el proyecto 🙌</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Es open source y gratuito. Tu aporte mantiene el hosting y el ETL. Escanea el QR con Yape o usa el número.
        </p>

        <div className="mt-4 flex justify-center">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <img
              src={YAPE_QR}
              alt={`Yape QR — ${YAPE_NUMERO}`}
              className="h-56 w-56 rounded-lg object-contain"
            />
          </div>
        </div>

        <div className="mt-4 text-sm font-semibold text-foreground">Yape · {YAPE_NUMERO}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">Carlos Cárdenas Fernández</div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a href="https://buymeacoffee.com/unimauro" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><Coffee className="h-4 w-4" /> Buy me a coffee</Button>
          </a>
          <a href="https://wa.me/51940584307" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
          </a>
        </div>
      </div>
    </div>
  )
}
