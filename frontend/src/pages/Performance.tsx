import { useMemo, useState } from 'react'
import { Target } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Kpi } from '@/components/Kpi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'

export function Performance() {
  const { data, loading, error } = useData()
  const ind = data?.indicators
  const [indicator, setIndicator] = useState('')
  const [sector, setSector] = useState('')

  const indicators = ind?.indicatorList || []
  const curInd = indicator || indicators[0] || ''
  const sectorsForInd = useMemo(() => {
    if (!ind) return []
    return Array.from(new Set(ind.items.filter((p) => p.indicator === curInd).map((p) => p.sector))).sort()
  }, [ind, curInd])
  const curSec = sector && sectorsForInd.includes(sector) ? sector : sectorsForInd[0] || ''

  const series = useMemo(() => {
    if (!ind) return []
    return ind.items
      .filter((p) => p.indicator === curInd && p.sector === curSec)
      .sort((a, b) => a.idFecha - b.idFecha)
  }, [ind, curInd, curSec])

  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  if (!ind || !ind.isReal || !ind.items.length)
    return (
      <div>
        <PageTitle title="Metas & Desempeño" subtitle="Cumplimiento de metas por indicador" />
        <ErrorState error="Indicadores no disponibles en este dataset." />
      </div>
    )

  const last = series[series.length - 1]
  const unit = last?.unit || ''
  const fmt = (v: number | null | undefined) => (v == null ? '—' : `${(+v).toLocaleString('es-PE', { maximumFractionDigits: 2 })}${unit === '%' ? '%' : ''}`)
  const alc = last?.alcance ?? null
  const alcTone = alc == null ? 'default' : alc >= 90 ? 'good' : alc >= 60 ? 'accent' : 'bad'

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Valor', 'Meta'], top: 0 },
    grid: { left: 50, right: 16, top: 36, bottom: 50 },
    xAxis: { type: 'category', data: series.map((p) => `${p.month.slice(0, 3)} ${String(p.year).slice(2)}`), axisLabel: { rotate: 40 } },
    yAxis: { type: 'value', name: unit },
    series: [
      { name: 'Valor', type: 'bar', data: series.map((p) => p.value), itemStyle: { borderRadius: [4, 4, 0, 0] } },
      { name: 'Meta', type: 'line', smooth: true, data: series.map((p) => p.meta), lineStyle: { type: 'dashed', color: '#f59e0b' }, itemStyle: { color: '#f59e0b' } },
    ],
  }

  // ranking de cumplimiento del último mes disponible por sector (indicador actual)
  const latestByCur = ind.items.filter((p) => p.indicator === curInd && p.alcance != null)
  const maxFecha = Math.max(...latestByCur.map((p) => p.idFecha))
  const cumpl = latestByCur.filter((p) => p.idFecha === maxFecha).sort((a, b) => (b.alcance || 0) - (a.alcance || 0))

  return (
    <div>
      <PageTitle title="Metas & Desempeño" subtitle="Valor real vs meta y % de cumplimiento por indicador y sector" />
      <div className="mb-4"><Badge variant="success">✓ datos reales · FONAFE Observatorio Digital</Badge></div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <select value={curInd} onChange={(e) => { setIndicator(e.target.value); setSector('') }}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {indicators.map((i) => <option key={i}>{i}</option>)}
        </select>
        <select value={curSec} onChange={(e) => setSector(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {sectorsForInd.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label={`${curInd} (último)`} value={fmt(last?.value)} />
        <Kpi label="Meta" value={fmt(last?.meta)} tone="accent" />
        <Kpi label="Cumplimiento" value={alc == null ? '—' : `${alc.toFixed(1)}%`} tone={alcTone} icon={Target} />
        <Kpi label="Periodo" value={last ? `${last.month} ${last.year}` : '—'} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>{curInd} · {curSec} — valor vs meta</CardTitle></CardHeader>
        <CardContent><Chart option={option} height={340} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cumplimiento por sector — {curInd} ({cumpl[0] ? `${cumpl[0].month} ${cumpl[0].year}` : ''})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {cumpl.map((p) => (
            <div key={p.sector} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
              <span className="min-w-0 flex-1 truncate">{p.sector}</span>
              <span className="text-muted-foreground">{fmt(p.value)} / {fmt(p.meta)}</span>
              <Badge variant={p.alcance == null ? 'default' : p.alcance >= 90 ? 'success' : p.alcance >= 60 ? 'accent' : 'danger'}>
                {p.alcance == null ? '—' : `${p.alcance.toFixed(0)}%`}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Fuente: Observatorio Digital de FONAFE (API pública). Tomamos lo que ellos no ofrecen como descarga —
        valor, meta y % de cumplimiento— y lo abrimos. Datos a nivel sector, mensual.
      </p>
    </div>
  )
}
