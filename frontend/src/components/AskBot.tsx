import { useEffect, useRef, useState } from 'react'
import { Bot, X, Send, KeyRound, Loader2, Sparkles } from 'lucide-react'
import { useData } from '@/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Dataset } from '@/types'

/**
 * Asistente conversacional del Observatorio de Empresas Públicas del Perú.
 *
 * Cliente ligero (sin backend): inyecta un RESUMEN compacto del dataset del tablero
 * como contexto y consulta a Gemini Flash directamente desde el navegador.
 * La API key se pide al usuario y se guarda SOLO en localStorage (capa gratuita).
 */
const MODEL = 'gemini-2.0-flash'
const KEY_STORAGE = 'gemini_api_key'

type Msg = { role: 'user' | 'model'; text: string }

const SYSTEM = `Eres el asistente analítico del "Observatorio de Empresas Públicas del Perú" (holding FONAFE, EPS de saneamiento y empresas de las FFAA).
Respondes ÚNICAMENTE con base en el JSON-resumen del tablero que se te entrega y en conocimiento público verificable.
Procedencia de cada empresa (campo "fuente"):
- "real-fonafe": último ejercicio con datos REALES del Observatorio Digital de FONAFE (utilidad/ingresos/EBITDA + indicadores con meta y % de cumplimiento). Años previos = modelo.
- "real-sunass": indicadores REALES de SUNASS (Benchmarking: IGPSS y sub-índices). Cifras financieras = modelo.
- "ffaa-conciliado": SIMA/FAME/SEMAN, fuente de verdad = Observatorio de Defensa (cada año marcado real o estimado; vacío = sin datos).
- "simulado": cifras financieras de modelo ilustrativo (no oficiales). Ej.: Petroperú (su fuente real es SMV), empresas de servicios pequeñas, BANMAT.
Las CONTRATACIONES son siempre REALES (estándar OCDS del OECE/SEACE).
Reglas (anti-overclaiming): si un dato es simulado/estimado, acláralo; nunca lo presentes como oficial. Si no está en los datos, dilo; NUNCA inventes cifras. Cita la fuente cuando exista. Sé conciso y en español del Perú; montos en S/ MM.`

function buildContext(d: Dataset | null): string {
  if (!d) return '{}'
  const num = (v: number | null | undefined) => (v == null ? null : Math.round(v * 10) / 10)
  const companies = d.companies.map((c) => {
    const f = c.financials[c.financials.length - 1]
    const ri = c.realIndicators
      ? Object.fromEntries(Object.entries(c.realIndicators).map(([k, v]) => [k, { v: v.value, meta: v.meta, alc: v.alcance, u: v.unit }]))
      : undefined
    return {
      sigla: c.acronym, nombre: c.name, sector: c.sector, region: c.region,
      holding: c.holding, fuente: c.provenance, empleados: c.employees,
      ultimo: f ? { anio: f.year, ingresos: num(f.revenue), ingresosReal: f.revenueReal, utilidad: num(f.netIncome), utilidadReal: f.netIncomeReal, ebitda: num(f.ebitda) } : null,
      margenNeto: c.metrics.netMargin, transparencia: c.metrics.transparencyScore,
      indicadoresReales: ri,
      anomalias: c.anomalies.length, recomendaciones: c.recommendations.map((r) => r.category),
    }
  })
  const ct = d.contracts
  const ctx = {
    meta: { version: d.meta.version, generado: d.meta.generated_at, anios: d.meta.years, nota: d.meta.note, fuentes: d.meta.sources },
    kpis: d.kpis,
    indicadoresConsolidados: d.indicators?.realSummary,
    sectoresIndicadores: d.indicators?.sectorList,
    contrataciones: {
      esReal: ct.isReal, montoMM: ct.summary.totalAmount, total: ct.summary.totalContracts,
      entidades: ct.summary.entitiesCovered, topProveedor_pct: ct.summary.topProviderShare,
      topProveedores: ct.topProviders?.slice(0, 8),
      porEntidad: ct.byEntity?.slice(0, 12), porAnio: ct.byYear, porMetodo: ct.byMethod?.slice(0, 6),
    },
    transparenciaPromedio: d.transparency.avgScore,
    rankings: { rentabilidad: d.rankings.profitability.slice(0, 8), eficiencia: d.rankings.efficiency.slice(0, 8), transparencia: d.rankings.transparency.slice(0, 8) },
    anomalias: d.anomalies, recomendaciones: d.recommendations,
    empresas: companies,
  }
  return JSON.stringify(ctx).slice(0, 120_000)
}

export function AskBot() {
  const { data } = useData()
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setApiKey(localStorage.getItem(KEY_STORAGE) || '') }, [])
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [msgs, busy])

  function saveKey(v: string) { setApiKey(v); localStorage.setItem(KEY_STORAGE, v.trim()) }

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    if (!apiKey.trim()) { setErr('Pega tu API key de Gemini (gratuita) para conversar.'); return }
    setErr(null)
    const next: Msg[] = [...msgs, { role: 'user', text: q }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      const context = buildContext(data)
      const contents = [
        { role: 'user', parts: [{ text: `${SYSTEM}\n\n=== RESUMEN DEL TABLERO (JSON) ===\n${context}` }] },
        { role: 'model', parts: [{ text: 'Entendido. Responderé solo con base en estos datos, distinguiendo lo real de lo simulado/estimado.' }] },
        ...next.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      ]
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } }) },
      )
      if (!res.ok) {
        const t = await res.text()
        throw new Error(res.status === 400 ? 'API key inválida o solicitud rechazada.' : `Error ${res.status}: ${t.slice(0, 160)}`)
      }
      const json = await res.json()
      const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') || 'Sin respuesta.'
      setMsgs((m) => [...m, { role: 'model', text }])
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const suggestions = [
    '¿Cuál fue la empresa más rentable y cuál tuvo más pérdidas?',
    '¿Qué proveedores concentran más contrataciones?',
    '¿Qué EPS tienen mejor IGPSS (SUNASS)?',
    '¿Qué datos son reales y cuáles simulados?',
  ]

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Asistente IA"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(70vh,560px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <div className="text-sm font-semibold">Asistente del Observatorio</div>
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Gemini Flash</span>
          </div>

          {!apiKey.trim() && (
            <div className="border-b border-border bg-amber-500/10 px-4 py-3 text-xs">
              <label className="mb-1 flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                <KeyRound className="h-3.5 w-3.5" /> API key de Gemini (gratuita)
              </label>
              <input type="password" placeholder="Pega tu key de aistudio.google.com"
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                onChange={(e) => saveKey(e.target.value)} />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-primary underline">
                Obtener key gratis →
              </a>
              <p className="mt-1 text-[10px] text-muted-foreground">Se guarda solo en tu navegador.</p>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pregúntame sobre las empresas, finanzas, contrataciones o la procedencia de los datos:</p>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="block w-full rounded-md border border-border px-2.5 py-1.5 text-left text-xs hover:bg-muted">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] leading-relaxed', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  {m.text}
                </div>
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…</div>}
            {err && <div className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-xs text-red-500">{err}</div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="flex items-center gap-2 border-t border-border px-3 py-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Enviar"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
    </>
  )
}
