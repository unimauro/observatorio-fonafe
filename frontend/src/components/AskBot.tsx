import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, X, Send, KeyRound, Loader2, Sparkles, Trash2, Copy, Check, Square } from 'lucide-react'
import { useData } from '@/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Dataset } from '@/types'

/**
 * Asistente conversacional del Observatorio de Empresas Públicas del Perú.
 * Cliente ligero (sin backend): inyecta un RESUMEN compacto del dataset como contexto y
 * consulta a Gemini Flash desde el navegador. La API key se guarda SOLO en localStorage.
 */
const MODEL = 'gemini-2.0-flash'
const KEY_STORAGE = 'gemini_api_key'
const MSG_STORAGE = 'askbot_msgs_v1'
const BASE = import.meta.env.BASE_URL

type Msg = { role: 'user' | 'model'; text: string }

const SYSTEM = `Eres el asistente analítico del "Observatorio de Empresas Públicas del Perú" (holding FONAFE, EPS de saneamiento y empresas de las FFAA).
Respondes ÚNICAMENTE con base en el JSON-resumen del tablero que se te entrega y en conocimiento público verificable.
Procedencia de cada empresa (campo "fuente"):
- "real-fonafe": último ejercicio con datos REALES del Observatorio Digital de FONAFE (utilidad/ingresos/EBITDA + indicadores con meta y % de cumplimiento). Años previos = modelo.
- "real-sunass": indicadores REALES de SUNASS (Benchmarking: IGPSS y sub-índices). Cifras financieras = modelo.
- "ffaa-conciliado": SIMA/FAME/SEMAN, fuente de verdad = Observatorio de Defensa (cada año marcado real o estimado; vacío = sin datos).
- "simulado": cifras financieras de modelo ilustrativo (no oficiales). Ej.: Petroperú (su fuente real es SMV), empresas de servicios pequeñas, BANMAT.
Las CONTRATACIONES son siempre REALES (estándar OCDS del OECE/SEACE).
Reglas (anti-overclaiming): si un dato es simulado/estimado, acláralo; nunca lo presentes como oficial. Si no está en los datos, dilo; NUNCA inventes cifras. Cita la fuente cuando exista.
Formato: responde en español del Perú, conciso. Usa **negritas** para nombres y cifras clave y viñetas con "- " cuando enumeres. Menciona las empresas por su nombre o sigla exactos para que el tablero las enlace. Montos en S/ MM.`

function buildContext(d: Dataset | null): string {
  if (!d) return '{}'
  const num = (v: number | null | undefined) => (v == null ? null : Math.round(v * 10) / 10)
  const companies = d.companies.map((c) => {
    const f = c.financials[c.financials.length - 1]
    const ri = c.realIndicators
      ? Object.fromEntries(Object.entries(c.realIndicators).map(([k, v]) => [k, { v: v.value, meta: v.meta, alc: v.alcance, u: v.unit }]))
      : undefined
    return {
      sigla: c.acronym, nombre: c.name, sector: c.sector, region: c.region, holding: c.holding,
      fuente: c.provenance, empleados: c.employees,
      ultimo: f ? { anio: f.year, ingresos: num(f.revenue), ingresosReal: f.revenueReal, utilidad: num(f.netIncome), utilidadReal: f.netIncomeReal, ebitda: num(f.ebitda) } : null,
      margenNeto: c.metrics.netMargin, transparencia: c.metrics.transparencyScore,
      indicadoresReales: ri,
      anomalias: c.anomalies.length, recomendaciones: c.recommendations.map((r) => r.category),
    }
  })
  const ct = d.contracts
  const ctx = {
    meta: { version: d.meta.version, generado: d.meta.generated_at, anios: d.meta.years, fuentes: d.meta.sources },
    kpis: d.kpis, indicadoresConsolidados: d.indicators?.realSummary, sectoresIndicadores: d.indicators?.sectorList,
    contrataciones: {
      esReal: ct.isReal, montoMM: ct.summary.totalAmount, total: ct.summary.totalContracts,
      entidades: ct.summary.entitiesCovered, topProveedor_pct: ct.summary.topProviderShare,
      topProveedores: ct.topProviders?.slice(0, 8), porEntidad: ct.byEntity?.slice(0, 12),
      porAnio: ct.byYear, porMetodo: ct.byMethod?.slice(0, 6),
    },
    transparenciaPromedio: d.transparency.avgScore,
    rankings: { rentabilidad: d.rankings.profitability.slice(0, 8), eficiencia: d.rankings.efficiency.slice(0, 8), transparencia: d.rankings.transparency.slice(0, 8) },
    anomalias: d.anomalies, recomendaciones: d.recommendations, empresas: companies,
  }
  return JSON.stringify(ctx).slice(0, 130_000)
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Renderiza texto del modelo: negritas, viñetas y auto-enlaces a las fichas de empresa. */
function RichText({ text, terms }: { text: string; terms: { term: string; slug: string }[] }) {
  const re = useMemo(() => (terms.length ? new RegExp(`(${terms.map((t) => esc(t.term)).join('|')})`, 'g') : null), [terms])
  const slugOf = useMemo(() => {
    const m: Record<string, string> = {}
    terms.forEach((t) => { m[t.term.toLowerCase()] = t.slug })
    return m
  }, [terms])

  function inline(s: string, key: string) {
    // primero **negritas**, luego auto-enlaces dentro de cada trozo
    const parts = s.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={`${key}-b${i}`}>{linkify(p.slice(2, -2), `${key}-b${i}`)}</strong>
      return <span key={`${key}-s${i}`}>{linkify(p, `${key}-s${i}`)}</span>
    })
  }
  function linkify(s: string, key: string) {
    if (!re) return s
    const out: React.ReactNode[] = []
    let last = 0, m: RegExpExecArray | null, idx = 0
    re.lastIndex = 0
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) out.push(s.slice(last, m.index))
      const slug = slugOf[m[0].toLowerCase()]
      out.push(<a key={`${key}-l${idx++}`} href={`${BASE}#/empresa/${slug}`} className="font-medium text-accent underline underline-offset-2 hover:opacity-80">{m[0]}</a>)
      last = m.index + m[0].length
      if (m.index === re.lastIndex) re.lastIndex++
    }
    if (last < s.length) out.push(s.slice(last))
    return out
  }

  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let bullets: string[] = []
  const flush = (k: string) => {
    if (!bullets.length) return
    blocks.push(<ul key={`u${k}`} className="my-1 list-disc space-y-0.5 pl-4">{bullets.map((b, i) => <li key={i}>{inline(b, `${k}-${i}`)}</li>)}</ul>)
    bullets = []
  }
  lines.forEach((ln, i) => {
    const t = ln.trim()
    const mb = t.match(/^[-*•]\s+(.*)/) || t.match(/^\d+\.\s+(.*)/)
    if (mb) { bullets.push(mb[1]); return }
    flush(`${i}`)
    if (t) blocks.push(<p key={`p${i}`} className="my-0.5">{inline(t, `p${i}`)}</p>)
  })
  flush('end')
  return <>{blocks}</>
}

export function AskBot() {
  const { data } = useData()
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const terms = useMemo(() => {
    if (!data) return []
    const list: { term: string; slug: string }[] = []
    data.companies.forEach((c) => {
      if (c.acronym && c.acronym.length >= 3) list.push({ term: c.acronym, slug: c.slug })
      if (c.name && c.name.length >= 4) list.push({ term: c.name, slug: c.slug })
    })
    return list.sort((a, b) => b.term.length - a.term.length)
  }, [data])

  useEffect(() => {
    setApiKey(localStorage.getItem(KEY_STORAGE) || '')
    try { const s = localStorage.getItem(MSG_STORAGE); if (s) setMsgs(JSON.parse(s)) } catch { /* ignore */ }
  }, [])
  useEffect(() => { try { localStorage.setItem(MSG_STORAGE, JSON.stringify(msgs.slice(-30))) } catch { /* ignore */ } }, [msgs])
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [msgs, busy])

  function saveKey(v: string) { setApiKey(v); localStorage.setItem(KEY_STORAGE, v.trim()) }
  function clearChat() { setMsgs([]); setErr(null); try { localStorage.removeItem(MSG_STORAGE) } catch { /* ignore */ } }
  function stop() { abortRef.current?.abort(); setBusy(false) }
  async function copy(text: string, i: number) {
    try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 1500) } catch { /* ignore */ }
  }

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    if (!apiKey.trim()) { setErr('Pega tu API key de Gemini (gratuita) para conversar.'); return }
    setErr(null)
    const next: Msg[] = [...msgs, { role: 'user', text: q }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const context = buildContext(data)
      const contents = [
        { role: 'user', parts: [{ text: `${SYSTEM}\n\n=== RESUMEN DEL TABLERO (JSON) ===\n${context}` }] },
        { role: 'model', parts: [{ text: 'Entendido. Responderé solo con base en estos datos, distinguiendo lo real de lo simulado/estimado.' }] },
        ...next.slice(-8).map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      ]
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } }), signal: ctrl.signal },
      )
      if (!res.ok) {
        const t = await res.text()
        throw new Error(res.status === 400 ? 'API key inválida o solicitud rechazada.' : `Error ${res.status}: ${t.slice(0, 160)}`)
      }
      const json = await res.json()
      const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') || 'Sin respuesta.'
      setMsgs((m) => [...m, { role: 'model', text }])
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
      abortRef.current = null
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
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(72vh,580px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <div className="text-sm font-semibold">Asistente del Observatorio</div>
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Gemini Flash</span>
            {msgs.length > 0 && (
              <button onClick={clearChat} aria-label="Limpiar conversación" title="Limpiar" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
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
              <div key={i} className={cn('group flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn('max-w-[88%] rounded-lg px-3 py-2 text-[13px] leading-relaxed', m.role === 'user' ? 'whitespace-pre-wrap bg-primary text-primary-foreground' : 'bg-muted')}>
                  {m.role === 'model' ? <RichText text={m.text} terms={terms} /> : m.text}
                </div>
                {m.role === 'model' && (
                  <button onClick={() => copy(m.text, i)} className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100">
                    {copied === i ? <><Check className="h-3 w-3" /> copiado</> : <><Copy className="h-3 w-3" /> copiar</>}
                  </button>
                )}
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…</div>}
            {err && <div className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-xs text-red-500">{err}</div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="flex items-center gap-2 border-t border-border px-3 py-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            {busy
              ? <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Detener"><Square className="h-4 w-4" /></Button>
              : <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Enviar"><Send className="h-4 w-4" /></Button>}
          </form>
          <p className="px-3 pb-2 text-[10px] text-muted-foreground">Puede equivocarse. Verifica con las fuentes citadas. Los nombres de empresa enlazan a su ficha.</p>
        </div>
      )}
    </>
  )
}
