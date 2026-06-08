import { useMemo, useState } from 'react'
import { Download, FileJson } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Kpi } from '@/components/Kpi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { soles, num, pct } from '@/lib/format'
import { downloadCSV, downloadJSON } from '@/lib/export'

export function Contracts() {
  const { data, loading, error } = useData()
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    if (!data) return []
    return data.contracts.items.filter(
      (i) => !q || (i.provider + i.company + i.object).toLowerCase().includes(q.toLowerCase()),
    )
  }, [data, q])

  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const s = data.contracts.summary
  const top = data.contracts.topProviders

  const providerOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => `S/ ${v} MM` },
    grid: { left: 160, right: 24, top: 10, bottom: 24 },
    xAxis: { type: 'value', name: 'S/ MM' },
    yAxis: { type: 'category', data: top.map((p) => p.provider).reverse() },
    series: [{ type: 'bar', data: top.map((p) => p.total).reverse(), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
  }

  return (
    <div>
      <PageTitle
        title="Contrataciones públicas"
        subtitle={data.contracts.isReal
          ? 'Datos REALES del OCDS/OECE (SEACE) — entidades del portafolio, contrataciones recientes'
          : 'Proveedores, montos y concentración · base lista para datos reales OCDS/OECE'}
      />

      <div className="mb-2">
        {data.contracts.isReal
          ? <Badge variant="success">✓ datos reales · OCDS/OECE · {s.entitiesCovered} entidades</Badge>
          : <Badge variant="warning">ilustrativo</Badge>}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Monto contratado" value={soles(s.totalAmount)} />
        <Kpi label="N° de contratos" value={num(s.totalContracts)} />
        <Kpi label="Entidades cubiertas" value={num(s.entitiesCovered || 0)} tone="accent" />
        <Kpi label="Concentración top proveedor" value={pct(s.topProviderShare)} tone={s.topProviderShare > 30 ? 'bad' : 'default'} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Ranking de proveedores por monto</CardTitle></CardHeader>
        <CardContent><Chart option={providerOption} height={360} /></CardContent>
      </Card>

      {data.contracts.isReal && data.contracts.byYear && data.contracts.byEntity && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Contrataciones por año</CardTitle></CardHeader>
            <CardContent>
              <Chart height={300} option={{
                tooltip: { trigger: 'axis' },
                legend: { data: ['N° contratos', 'Monto S/ MM'], top: 0 },
                grid: { left: 44, right: 50, top: 36, bottom: 24 },
                xAxis: { type: 'category', data: data.contracts.byYear.map((y) => y.year) },
                yAxis: [{ type: 'value', name: 'N°' }, { type: 'value', name: 'S/ MM' }],
                series: [
                  { name: 'N° contratos', type: 'bar', data: data.contracts.byYear.map((y) => y.count), itemStyle: { borderRadius: [4, 4, 0, 0] } },
                  { name: 'Monto S/ MM', type: 'line', yAxisIndex: 1, smooth: true, data: data.contracts.byYear.map((y) => y.amount) },
                ],
              }} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Entidades con más contrataciones</CardTitle></CardHeader>
            <CardContent>
              <Chart height={300} option={{
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                grid: { left: 110, right: 20, top: 10, bottom: 24 },
                xAxis: { type: 'value', name: 'N° contratos' },
                yAxis: { type: 'category', data: data.contracts.byEntity.slice(0, 10).map((e) => e.name).reverse() },
                series: [{ type: 'bar', data: data.contracts.byEntity.slice(0, 10).map((e) => e.count).reverse(), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
              }} />
            </CardContent>
          </Card>
        </div>
      )}

      {data.contracts.isReal && data.contracts.byMethod && data.contracts.byStage && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Por método de contratación</CardTitle></CardHeader>
            <CardContent>
              <Chart height={300} option={{
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                grid: { left: 200, right: 20, top: 10, bottom: 24 },
                xAxis: { type: 'value', name: 'N°' },
                yAxis: { type: 'category', data: data.contracts.byMethod.slice(0, 8).map((m) => m.method).reverse() },
                series: [{ type: 'bar', data: data.contracts.byMethod.slice(0, 8).map((m) => m.count).reverse(), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
              }} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Por etapa</CardTitle></CardHeader>
            <CardContent>
              <Chart height={300} option={{
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { bottom: 0 },
                series: [{
                  type: 'pie', radius: ['45%', '70%'], center: ['50%', '44%'],
                  itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: 'transparent' },
                  label: { show: false },
                  data: data.contracts.byStage.map((s) => ({
                    name: { adjudicado: 'Adjudicado', convocatoria: 'Convocatoria', presupuesto: 'Presupuesto', sin_monto: 'Sin monto' }[s.stage] || s.stage,
                    value: s.count,
                  })),
                }],
              }} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Contratos ({items.length})</CardTitle>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar…"
              className="h-8 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <Button size="sm" variant="outline" onClick={() => downloadCSV('contratos.csv', items)}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => downloadJSON('contratos.json', items)}>
              <FileJson className="h-3.5 w-3.5" /> JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Empresa</th><th>Proveedor / objeto</th><th>Etapa</th><th>Año</th><th className="text-right">Monto</th></tr></thead>
            <tbody>
              {items.slice(0, 200).map((c) => (
                <tr key={c.id} className="border-b border-border/60 align-top">
                  <td className="py-2 font-medium">{c.company}</td>
                  <td>
                    <div>{c.provider}</div>
                    <div className="max-w-[340px] truncate text-xs text-muted-foreground" title={c.object}>{c.object}</div>
                  </td>
                  <td className="text-xs text-muted-foreground">{c.amountType || c.method || '—'}</td>
                  <td>{c.year ?? '—'}</td>
                  <td className="text-right font-medium">{c.amount > 0 ? soles(c.amount) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 200 && <p className="pt-3 text-center text-xs text-muted-foreground">Mostrando 200 de {items.length}. Exporta para ver todo.</p>}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        {data.contracts.isReal
          ? 'Datos reales del estándar OCDS publicado por el OECE (SEACE). Los montos en "—" corresponden a procesos en convocatoria sin adjudicación registrada. La cobertura crece en cada corrida semanal del ETL.'
          : 'Datos de ejemplo. La Fase 1 los reemplaza con la API OCDS del OECE.'}
      </p>
    </div>
  )
}
