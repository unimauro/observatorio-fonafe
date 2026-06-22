import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard, Building2, FileText, ShieldCheck, BrainCircuit, Database, SlidersHorizontal, Target,
  Sun, Moon, Github, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useData } from '@/data'
import { useIsDark, toggleTheme } from './theme'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { SupportModal } from './SupportModal'
import { AskBot } from './AskBot'
import { Coffee } from 'lucide-react'

const YAPE_QR = 'https://unimauro.github.io/salariosperu/yape.png'

function SupportBlock({ onYape }: { onYape: () => void }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onYape}
          aria-label="Mostrar QR de Yape"
          className="shrink-0 rounded-lg bg-white p-1.5 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <img src={YAPE_QR} alt="Yape QR" className="h-16 w-16 rounded object-contain" loading="lazy" />
        </button>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Open source y gratuito. Tu aporte mantiene el hosting y el ETL.
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <Button variant="default" size="sm" onClick={onYape}>📲 Yape · 940 584 307</Button>
        <a href="https://buymeacoffee.com/unimauro" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" className="w-full"><Coffee className="h-4 w-4" /> Buy me a coffee</Button>
        </a>
      </div>
    </div>
  )
}

const NAV = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/empresas', label: 'Empresas', icon: Building2 },
  { to: '/contrataciones', label: 'Contrataciones', icon: FileText },
  { to: '/transparencia', label: 'Transparencia', icon: ShieldCheck },
  { to: '/desempeno', label: 'Metas & Desempeño', icon: Target },
  { to: '/decisiones', label: 'Decisiones · IA', icon: BrainCircuit },
  { to: '/simuladores', label: 'Simuladores', icon: SlidersHorizontal },
  { to: '/datos', label: 'Datos abiertos', icon: Database },
]

function NavItems({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <n.icon className="h-4 w-4" />
          {n.label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold">O</div>
      <div className="leading-tight">
        <div className="text-sm font-bold">Observatorio</div>
        <div className="text-[11px] text-muted-foreground">Empresas Públicas · Perú</div>
      </div>
    </Link>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const [support, setSupport] = useState(false)
  const dark = useIsDark()
  const { data } = useData()
  const meta = data?.meta

  return (
    <div className="min-h-screen">
      <SupportModal open={support} onClose={() => setSupport(false)} />
      <AskBot />
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card/60 p-4 lg:flex">
        <Brand />
        <div className="mt-6 flex-1 overflow-y-auto"><NavItems /></div>
        <div className="mt-4 space-y-2 text-[11px] text-muted-foreground">
          <SupportBlock onYape={() => setSupport(true)} />
          {meta && (
            <div className="rounded-lg border border-border p-2">
              <div>Versión {meta.version}</div>
              <div>Datos al {meta.generated_at}</div>
              {meta.is_illustrative && <Badge variant="warning" className="mt-1">contratos + indicadores FONAFE reales · series por empresa modeladas</Badge>}
            </div>
          )}
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:pl-72">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menú">
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden"><Brand /></div>
        <div className="ml-auto flex items-center gap-2">
          {(data?.contracts?.isReal || data?.indicators?.isReal) && <Badge variant="success" className="hidden md:inline-flex">reales: contratos + FONAFE</Badge>}
          {meta?.is_illustrative && <Badge variant="warning" className="hidden sm:inline-flex">series x empresa: modeladas</Badge>}
          <button onClick={() => setSupport(true)} aria-label="Apoyar el proyecto"
                  className="rounded-md p-2 text-primary hover:bg-muted">
            <Coffee className="h-4 w-4" />
          </button>
          <button onClick={toggleTheme} aria-label="Tema" className="rounded-md p-2 hover:bg-muted">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href="https://github.com/unimauro/observatorio-fonafe" target="_blank" rel="noopener"
             className="rounded-md p-2 hover:bg-muted" aria-label="GitHub">
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6"><NavItems onClick={() => setOpen(false)} /></div>
            <div className="mt-6"><SupportBlock onYape={() => { setOpen(false); setSupport(true) }} /></div>
          </div>
        </div>
      )}

      <main className="px-4 py-6 lg:pl-72">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
