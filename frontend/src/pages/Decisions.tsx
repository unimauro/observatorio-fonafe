import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, AlertTriangle, Lightbulb, Send } from 'lucide-react'
import { useData } from '@/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { soles, pct, solesCompact } from '@/lib/format'
import type { Dataset } from '@/types'

function answer(qRaw: string, d: Dataset): string {
  const q = qRaw.toLowerCase()
  const comps = d.companies
  const byNet = [...comps].sort((a, b) => b.financials.at(-1)!.netIncome - a.financials.at(-1)!.netIncome)
  const byMargin = [...comps].sort((a, b) => b.metrics.netMargin - a.metrics.netMargin)
  const named = comps.find((c) => q.includes(c.acronym.toLowerCase()) || q.includes(c.name.toLowerCase()))

  if (/(rentab|más rentable|mejor margen)/.test(q)) {
    const c = byMargin[0]
    return `La más rentable (${d.kpis.year}) es ${c.name} (${c.acronym}) con ${pct(c.metrics.netMargin)} de margen neto.`
  }
  if (/(pérdida|perdida|perdió|perdio|mayores pérdidas|peor)/.test(q)) {
    const c = byNet.at(-1)!
    return `La empresa con mayores pérdidas es ${c.name} (${c.acronym}): utilidad neta ${soles(c.financials.at(-1)!.netIncome)} en ${d.kpis.year}.`
  }
  if (named && /(invir|inversión|inversion)/.test(q)) {
    return `${named.name} ejecutó ${soles(named.financials.at(-1)!.investment)} de inversión en ${d.kpis.year}.`
  }
  if (named && /(ingreso|ventas|factur)/.test(q)) {
    return `${named.name} tuvo ingresos por ${soles(named.financials.at(-1)!.revenue)} en ${d.kpis.year}.`
  }
  if (named) {
    const f = named.financials.at(-1)!
    return `${named.name} (${d.kpis.year}): ingresos ${soles(f.revenue)}, utilidad ${soles(f.netIncome)}, transparencia ${named.metrics.transparencyScore}/100.`
  }
  if (/(proveedor|contrat|concentr)/.test(q)) {
    const p = d.contracts.topProviders[0]
    return `El proveedor con mayor monto es ${p.provider}: ${soles(p.total)} en ${p.count} contratos (${pct(d.contracts.summary.topProviderShare)} del total).`
  }
  if (/(personal|trabajador|despid|redujeron)/.test(q)) {
    return 'La serie histórica de personal por año está pendiente de carga (Fase 1). Hoy se muestra la dotación actual por empresa.'
  }
  if (/(pérdidas|cuántas|cuantas).*(empresa)/.test(q) || /empresas.*(pérdid|perdid)/.test(q)) {
    return `${d.kpis.withLosses} de ${d.kpis.companies} empresas cerraron ${d.kpis.year} con pérdidas.`
  }
  return 'Puedo responder sobre rentabilidad, pérdidas, ingresos/inversión por empresa, proveedores y transparencia. Prueba con una de las sugerencias.'
}

const SUGGESTIONS = [
  '¿Cuál fue la empresa más rentable del año?',
  '¿Qué empresa tuvo mayores pérdidas?',
  '¿Cuánto invirtió Sedapal?',
  '¿Qué proveedores concentran más contratos?',
  '¿Cuántas empresas tuvieron pérdidas?',
]

export function Decisions() {
  const { data, loading, error } = useData()
  const [chat, setChat] = useState<{ q: string; a: string }[]>([])
  const [input, setInput] = useState('')

  const summary = useMemo(() => {
    if (!data) return []
    const byMargin = [...data.companies].sort((a, b) => b.metrics.netMargin - a.metrics.netMargin)
    const byNet = [...data.companies].sort((a, b) => a.financials.at(-1)!.netIncome - b.financials.at(-1)!.netIncome)
    const p = data.contracts.topProviders[0]
    return [
      `El portafolio agrupa ${data.kpis.companies} empresas con ingresos por ${solesCompact(data.kpis.totalRevenue)} y utilidad neta de ${solesCompact(data.kpis.totalNetIncome)} en ${data.kpis.year}.`,
      `Más rentable: ${byMargin[0].name} (${pct(byMargin[0].metrics.netMargin)}). Mayor pérdida: ${byNet[0].name} (${soles(byNet[0].financials.at(-1)!.netIncome)}).`,
      `${data.kpis.withLosses} empresas en pérdidas requieren plan de acción; se detectaron ${data.anomalies.length} anomalías y se proponen ${data.recommendations.length} medidas.`,
      `Concentración de compras: ${p.provider} lidera con ${pct(data.contracts.summary.topProviderShare)} del monto. Transparencia promedio: ${data.transparency.avgScore}/100.`,
    ]
  }, [data])

  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    setChat((c) => [...c, { q: t, a: answer(t, data) }])
    setInput('')
  }

  return (
    <div>
      <PageTitle title="Decisiones basadas en datos" subtitle="Del diagnóstico a la acción: resumen, anomalías, recomendaciones y consultas" />

      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Resumen ejecutivo automático</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {summary.map((s, i) => <li key={i} className="flex gap-2"><span className="text-primary">▸</span><span>{s}</span></li>)}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Anomalías detectadas ({data.anomalies.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.anomalies.map((a, i) => (
              <Link key={i} to={`/empresa/${a.companySlug}`} className="block rounded-lg border border-border p-3 text-sm hover:bg-muted">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.company}</span>
                  <Badge variant={a.severity === 'alta' ? 'danger' : 'warning'}>{a.severity}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{a.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Recomendaciones ({data.recommendations.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.recommendations.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/empresa/${r.companySlug}`} className="font-medium hover:underline">{r.company}</Link>
                  <Badge variant="primary">{r.category}</Badge>
                  <Badge variant={r.priority === 'alta' ? 'danger' : 'warning'}>{r.priority}</Badge>
                </div>
                <p className="mt-1">{r.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">📑 {r.norma}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Consulta los datos</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{s}</button>
            ))}
          </div>
          <div className="space-y-3">
            {chat.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{m.q}</div>
                <div className="w-fit max-w-[85%] rounded-lg border border-border bg-card px-3 py-2 text-sm">{m.a}</div>
              </div>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…"
              className="h-9 flex-1 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <Button type="submit"><Send className="h-4 w-4" /></Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Motor determinista sobre los datos cargados (sin servidor). La Fase 3 conecta un LLM (OpenRouter) para respuestas abiertas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
