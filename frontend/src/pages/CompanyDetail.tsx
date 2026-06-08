import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, AlertTriangle, Lightbulb } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { Kpi } from '@/components/Kpi'
import { Loading, ErrorState } from '@/components/State'
import { soles, pct, num, solesRaw } from '@/lib/format'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'financieros', label: 'Financieros' },
  { id: 'presupuesto', label: 'Presupuesto' },
  { id: 'inversiones', label: 'Inversiones' },
  { id: 'contrataciones', label: 'Contrataciones' },
  { id: 'directorio', label: 'Directorio' },
  { id: 'indicadores', label: 'Indicadores' },
  { id: 'simulador', label: 'Simulador' },
  { id: 'noticias', label: 'Noticias' },
]
type Gran = 'year' | 'quarterly' | 'monthly'

export function CompanyDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useData()
  const [tab, setTab] = useState('general')
  const [gran, setGran] = useState<Gran>('year')

  const [simCut, setSimCut] = useState(8)
  const [simGrowth, setSimGrowth] = useState(4)
  const [simYears, setSimYears] = useState(4)

  const company = useMemo(() => data?.companies.find((c) => c.slug === slug), [data, slug])
  const contracts = useMemo(
    () => (data && company ? data.contracts.items.filter((i) => i.companySlug === company.slug) : []),
    [data, company],
  )
  const sim = useMemo(() => {
    if (!company) return null
    const f = company.financials[company.financials.length - 1]
    const R0 = f.revenue, N0 = f.netIncome, cost0 = R0 - N0
    const labels = ['Hoy'], statusNet = [N0], scenNet = [N0]
    let rs = R0, cs = cost0, r = R0, c = cost0 * (1 - simCut / 100), be = -1
    for (let i = 1; i <= simYears; i++) {
      labels.push(`+${i}`)
      rs *= 1.01; cs *= 1.015; statusNet.push(+(rs - cs).toFixed(1))
      r *= 1 + simGrowth / 100; c *= 1 + (simGrowth / 100) * 0.5
      const n = +(r - c).toFixed(1); scenNet.push(n)
      if (be < 0 && N0 < 0 && n >= 0) be = i
    }
    const fiscalImpact = scenNet.slice(1).reduce((a, v, i) => a + (v - statusNet[i + 1]), 0)
    return { labels, statusNet, scenNet, be, fiscalImpact, N0 }
  }, [company, simCut, simGrowth, simYears])

  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  if (!company) return <ErrorState error="Empresa no encontrada" />

  const fin = company.financials
  const series = gran === 'year'
    ? fin.map((f) => ({ period: String(f.year), revenue: f.revenue, netIncome: f.netIncome, ebitda: f.ebitda }))
    : company.periodic[gran]

  const finOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos', 'Utilidad neta', 'EBITDA'], top: 0 },
    grid: { left: 50, right: 16, top: 36, bottom: 28 },
    xAxis: { type: 'category', data: series.map((s) => s.period) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [
      { name: 'Ingresos', type: 'bar', data: series.map((s) => s.revenue) },
      { name: 'Utilidad neta', type: 'line', smooth: true, data: series.map((s) => s.netIncome) },
      { name: 'EBITDA', type: 'line', smooth: true, data: series.map((s) => s.ebitda) },
    ],
  }
  const budgetOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0 },
    grid: { left: 50, right: 16, top: 36, bottom: 28 },
    xAxis: { type: 'category', data: fin.map((f) => f.year) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [
      { name: 'Presupuesto', type: 'bar', data: fin.map((f) => f.budget) },
      { name: 'Ejecutado', type: 'bar', data: fin.map((f) => f.budgetExecuted) },
    ],
  }
  const invOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: fin.map((f) => f.year) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [{ name: 'Inversión', type: 'bar', data: fin.map((f) => f.investment), itemStyle: { borderRadius: [4, 4, 0, 0] } }],
  }

  return (
    <div>
      <Link to="/empresas" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Empresas
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold sm:text-2xl">{company.acronym}</h1>
            <Badge variant="outline">{company.sector}</Badge>
            <Badge variant="primary">{company.holding}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{company.name}</p>
        </div>
        <a href={company.website} target="_blank" rel="noopener"
           className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Sitio oficial <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-5" />

      {tab === 'general' && (
        <div className="space-y-6">
          <Card><CardContent className="pt-5 text-sm leading-relaxed text-muted-foreground">{company.description}</CardContent></Card>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="RUC" value={company.ruc} />
            <Kpi label="Trabajadores" value={num(company.employees)} />
            <Kpi label="Margen neto" value={pct(company.metrics.netMargin)} tone={company.metrics.netMargin < 0 ? 'bad' : 'good'} />
            <Kpi label="Transparencia" value={`${company.metrics.transparencyScore}/100`} tone="accent" />
          </div>
          {(company.anomalies.length > 0 || company.recommendations.length > 0) && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Diagnóstico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {company.anomalies.length === 0 && <p className="text-sm text-muted-foreground">Sin anomalías relevantes.</p>}
                  {company.anomalies.map((a, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 text-sm">
                      <Badge variant={a.severity === 'alta' ? 'danger' : 'warning'}>{a.severity}</Badge>
                      <span className="ml-2">{a.description}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Qué hacer</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {company.recommendations.length === 0 && <p className="text-sm text-muted-foreground">Sin recomendaciones pendientes.</p>}
                  {company.recommendations.map((r, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{r.category}</Badge>
                        <Badge variant={r.priority === 'alta' ? 'danger' : 'warning'}>prioridad {r.priority}</Badge>
                      </div>
                      <p className="mt-1">{r.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">📑 {r.norma}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === 'financieros' && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Estados financieros</CardTitle>
            <Tabs active={gran} onChange={(v) => setGran(v as Gran)}
              tabs={[{ id: 'year', label: 'Año' }, { id: 'quarterly', label: 'Trim.' }, { id: 'monthly', label: 'Mes' }]} />
          </CardHeader>
          <CardContent>
            <Chart option={finOption} height={340} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2">Año</th><th>Ingresos</th><th>Utilidad</th><th>EBITDA</th><th>Inversión</th></tr></thead>
                <tbody>
                  {fin.map((f) => (
                    <tr key={f.year} className="border-b border-border/60">
                      <td className="py-2 font-medium">{f.year}</td>
                      <td>{soles(f.revenue)}</td>
                      <td className={f.netIncome < 0 ? 'text-red-500' : ''}>{soles(f.netIncome)}</td>
                      <td>{soles(f.ebitda)}</td>
                      <td>{soles(f.investment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'presupuesto' && (
        <Card>
          <CardHeader><CardTitle>Presupuesto vs ejecución · {company.metrics.budgetExecution}% ejecución</CardTitle></CardHeader>
          <CardContent><Chart option={budgetOption} height={360} /></CardContent>
        </Card>
      )}

      {tab === 'inversiones' && (
        <Card>
          <CardHeader><CardTitle>Inversión ejecutada por año</CardTitle></CardHeader>
          <CardContent><Chart option={invOption} height={360} /></CardContent>
        </Card>
      )}

      {tab === 'contrataciones' && (
        <Card>
          <CardHeader><CardTitle>Contrataciones ({contracts.length})</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">ID</th><th>Proveedor</th><th>Objeto</th><th>Año</th><th className="text-right">Monto</th></tr></thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs">{c.id}</td>
                    <td>{c.provider}</td>
                    <td className="text-muted-foreground">{c.object}</td>
                    <td>{c.year}</td>
                    <td className="text-right font-medium">{soles(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contracts.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sin contratos registrados.</p>}
          </CardContent>
        </Card>
      )}

      {tab === 'directorio' && (
        <Card>
          <CardHeader><CardTitle>Directorio</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {company.directors.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="text-muted-foreground">{d.role}</span><span className="font-medium">{d.name}</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">Nombres pendientes de carga desde el Portal de Transparencia (Fase 1).</p>
          </CardContent>
        </Card>
      )}

      {tab === 'indicadores' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Margen neto" value={pct(company.metrics.netMargin)} tone={company.metrics.netMargin < 0 ? 'bad' : 'good'} />
          <Kpi label="Ingreso por trabajador" value={solesRaw(company.metrics.revenuePerEmployee)} />
          <Kpi label="Transparencia" value={`${company.metrics.transparencyScore}/100`} tone="accent" />
          <Kpi label="Ejecución presup." value={pct(company.metrics.budgetExecution, 0)} />
        </div>
      )}

      {tab === 'simulador' && sim && (
        <Card>
          <CardHeader><CardTitle>Simulador de reflotamiento · {company.acronym}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <div className="space-y-4">
                {[
                  { l: 'Reducción de costos', v: simCut, set: setSimCut, min: 0, max: 30, s: '%' },
                  { l: 'Crecimiento ingresos/año', v: simGrowth, set: setSimGrowth, min: -5, max: 15, s: '%' },
                  { l: 'Horizonte', v: simYears, set: setSimYears, min: 1, max: 6, s: ' años' },
                ].map((sl) => (
                  <div key={sl.l}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{sl.l}</span><span className="font-semibold">{sl.v}{sl.s}</span>
                    </div>
                    <input type="range" min={sl.min} max={sl.max} step={1} value={sl.v}
                      onChange={(e) => sl.set(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
                  </div>
                ))}
                <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                  Utilidad actual: <span className={sim.N0 < 0 ? 'text-red-500' : 'text-emerald-500'}>{soles(sim.N0)}</span>
                </div>
              </div>
              <div>
                <div className="mb-3 grid grid-cols-3 gap-3">
                  <Kpi label={`Utilidad año +${simYears}`} value={soles(sim.scenNet[sim.scenNet.length - 1])} tone={sim.scenNet[sim.scenNet.length - 1] >= 0 ? 'good' : 'bad'} />
                  <Kpi label="Equilibrio" value={sim.be > 0 ? `Año +${sim.be}` : sim.N0 >= 0 ? 'Ya rentable' : 'No alcanza'} tone={sim.be > 0 || sim.N0 >= 0 ? 'good' : 'bad'} />
                  <Kpi label="Impacto fiscal" value={soles(+sim.fiscalImpact.toFixed(1))} tone={sim.fiscalImpact >= 0 ? 'good' : 'bad'} />
                </div>
                <Chart height={280} option={{
                  tooltip: { trigger: 'axis' },
                  legend: { data: ['Sin cambios', 'Escenario'], top: 0 },
                  grid: { left: 50, right: 16, top: 36, bottom: 28 },
                  xAxis: { type: 'category', data: sim.labels },
                  yAxis: { type: 'value', name: 'Utilidad S/ MM' },
                  series: [
                    { name: 'Sin cambios', type: 'line', smooth: true, lineStyle: { type: 'dashed' }, data: sim.statusNet },
                    { name: 'Escenario', type: 'line', smooth: true, areaStyle: { opacity: 0.12 }, data: sim.scenNet,
                      markLine: { silent: true, symbol: 'none', data: [{ yAxis: 0 }], lineStyle: { color: '#ef4444' } } },
                  ],
                }} />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Modelo simplificado e ilustrativo, educativo. No es proyección oficial.</p>
          </CardContent>
        </Card>
      )}

      {tab === 'noticias' && (
        <Card>
          <CardHeader><CardTitle>Noticias relacionadas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {company.news.map((n, i) => (
              <a key={i} href={n.url} target="_blank" rel="noopener"
                 className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-muted">
                <span>{n.title}</span><span className="text-xs text-muted-foreground">{n.date}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
