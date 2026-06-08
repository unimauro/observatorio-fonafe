import { Loader2, AlertTriangle } from 'lucide-react'

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando datos…
    </div>
  )
}

export function ErrorState({ error }: { error: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <AlertTriangle className="mx-auto h-6 w-6 text-red-500" />
      <p className="mt-2 font-semibold">No se pudo cargar el dataset</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
    </div>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
