import { useMemo, useState } from 'react'
import { SlidersHorizontal, Scale } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Kpi } from '@/components/Kpi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { soles, solesCompact, num } from '@/lib/format'

type Action = 'mantener' | 'reflotar' | 'liquidar'

function Slider({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(var(--primary))]" />
    </div>
  )
}

export function Simulations() {
  const { data, loading, error } = useData()
  const [slug, setSlug] = useState<string>('')
  const [costCut, setCostCut] = useState(8)
  const [growth, setGrowth] = useState(4)
  const [years, setYears] = useState(4)
  const [actions, setActions] = useState<Record<string, Action>>({})

  const lossCompanies = useMemo(
    () => (data ? data.companies.filter((c) => c.financials.at(-1)!.netIncome < 0) : []),
    [data],
  )
  const selected = useMemo(() => {
    if (!data) return undefined
    return data.companies.find((c) => c.slug === slug) || lossCompanies[0] || data.companies[0]
  }, [data, slug, lossCompanies])

  const projection = useMemo(() => {
    if (!selected) return null
    const f = selected.financials.at(-1)!
    const R0 = f.revenue, N0 = f.netIncome
    const cost0 = R0 - N0
    const labels = ['Hoy']
    const statusNet = [N0]
    const scenNet = [N0]
    let rs = R0, cs = cost0
    let r = R0, c = cost0 * (1 - costCut / 100)
    let breakeven = -1
    for (let i = 1; i <= years; i++) {
      labels.push(`+${i}`)
      rs *= 1.01; cs *= 1.015
      statusNet.push(+(rs - cs).toFixed(1))
      r *= 1 + growth / 100; c *= 1 + (growth / 100) * 0.5
      const n = +(r - c).toFixed(1)
      scenNet.push(n)
      if (breakeven === -1 && N0 < 0 && n >= 0) breakeven = i
    }
    const fiscalImpact = scenNet.slice(1).reduce((a, v, i) => a + (v - statusNet[i + 1]), 0)
    return { labels, statusNet, scenNet, breakeven, fiscalImpact, N0 }
  }, [selected, costCut, growth, years])

  const portfolio = useMemo(() => {
    if (!data) return null
    const currentNet = data.kpis.totalNetIncome
    const currentLosses = data.kpis.withLosses
    let simNet = currentNet
    let simLosses = currentLosses
    lossCompanies.forEach((c) => {
      const a = actions[c.slug] || 'mantener'
      const n0 = c.financials.at(-1)!.netIncome
      if (a === 'reflotar' || a === 'liquidar') {
        simNet += -n0 // deja de perder (llega a equilibrio)
        simLosses -= 1
      }
    })
    return { currentNet, currentLosses, simNet: +simNet.toFixed(1), simLosses }
  }, [data, actions, lossCompanies])

  if (loading) return <Loading />
  if (error || !data || !selected || !projection || !portfolio) return <ErrorState error={error || 'sin datos'} />

  const projOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Sin cambios', 'Escenario'], top: 0 },
    grid: { left: 50, right: 16, top: 36, bottom: 28 },
    xAxis: { type: 'category', data: projection.labels },
    yAxis: { type: 'value', name: 'Utilidad S/ MM' },
    series: [
      { name: 'Sin cambios', type: 'line', smooth: true, lineStyle: { type: 'dashed' }, data: projection.statusNet },
      {
        name: 'Escenario', type: 'line', smooth: true, areaStyle: { opacity: 0.12 }, data: projection.scenNet,
        markLine: { silent: true, symbol: 'none', data: [{ yAxis: 0 }], lineStyle: { color: '#ef4444' } },
      },
    ],
  }

  return (
    <div>
      <PageTitle title="Simuladores · Juega a ser director" subtitle="Escenarios de gestión basados en los datos. Mueve las variables y mira el impacto." />

      {/* Simulador 1: reflotamiento de una empresa */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />Reflotamiento de empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Empresa</label>
                <select value={selected.slug} onChange={(e) => setSlug(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <optgroup label="En pérdida">
                    {lossCompanies.map((c) => <option key={c.slug} value={c.slug}>{c.acronym} — {c.name}</option>)}
                  </optgroup>
                  <optgroup label="Todas">
                    {data.companies.map((c) => <option key={c.slug} value={c.slug}>{c.acronym}</option>)}
                  </optgroup>
                </select>
              </div>
              <Slider label="Reducción de costos" value={costCut} min={0} max={30} step={1} suffix="%" onChange={setCostCut} />
              <Slider label="Crecimiento de ingresos / año" value={growth} min={-5} max={15} step={1} suffix="%" onChange={setGrowth} />
              <Slider label="Horizonte" value={years} min={1} max={6} step={1} suffix=" años" onChange={setYears} />
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                Utilidad actual: <span className={projection.N0 < 0 ? 'text-red-500' : 'text-emerald-500'}>{soles(projection.N0)}</span>
              </div>
            </div>
            <div>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Kpi label={`Utilidad año +${years}`} value={soles(projection.scenNet.at(-1)!)} tone={projection.scenNet.at(-1)! >= 0 ? 'good' : 'bad'} />
                <Kpi label="Punto de equilibrio" value={projection.breakeven > 0 ? `Año +${projection.breakeven}` : projection.N0 >= 0 ? 'Ya rentable' : 'No alcanza'} tone={projection.breakeven > 0 || projection.N0 >= 0 ? 'good' : 'bad'} />
                <Kpi label="Impacto fiscal acum." value={solesCompact(projection.fiscalImpact)} tone={projection.fiscalImpact >= 0 ? 'good' : 'bad'} />
              </div>
              <Chart option={projOption} height={300} />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Modelo simplificado e ilustrativo: proyecta ingresos y costos desde el último ejercicio. Educativo, no es proyección oficial.
          </p>
        </CardContent>
      </Card>

      {/* Simulador 2: decisión de portafolio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" />Decisión de portafolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Decide qué hacer con cada empresa en pérdida y observa el efecto en la utilidad consolidada del Estado.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {lossCompanies.map((c) => (
                <div key={c.slug} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                  <div>
                    <div className="font-medium">{c.acronym}</div>
                    <div className="text-xs text-red-500">{soles(c.financials.at(-1)!.netIncome)}</div>
                  </div>
                  <select
                    value={actions[c.slug] || 'mantener'}
                    onChange={(e) => setActions((a) => ({ ...a, [c.slug]: e.target.value as Action }))}
                    className="h-8 rounded-md border border-border bg-card px-2 text-xs outline-none focus:ring-2 focus:ring-ring">
                    <option value="mantener">Mantener</option>
                    <option value="reflotar">Reflotar</option>
                    <option value="liquidar">Liquidar / fusionar</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 self-start">
              <Kpi label="Utilidad consolidada actual" value={solesCompact(portfolio.currentNet)} tone={portfolio.currentNet >= 0 ? 'good' : 'bad'} />
              <Kpi label="Utilidad simulada" value={solesCompact(portfolio.simNet)} tone={portfolio.simNet >= 0 ? 'good' : 'bad'} />
              <Kpi label="Empresas en pérdida (hoy)" value={num(portfolio.currentLosses)} tone="bad" />
              <Kpi label="Empresas en pérdida (sim.)" value={num(portfolio.simLosses)} tone={portfolio.simLosses < portfolio.currentLosses ? 'good' : 'default'} />
              <div className="col-span-2 rounded-lg border border-border p-3 text-sm">
                Mejora simulada: <Badge variant={portfolio.simNet - portfolio.currentNet >= 0 ? 'success' : 'danger'}>
                  {solesCompact(portfolio.simNet - portfolio.currentNet)}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">Reflotar/liquidar elimina la pérdida (llega a equilibrio). Modelo ilustrativo.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
