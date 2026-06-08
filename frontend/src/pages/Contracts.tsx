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
      <PageTitle title="Contrataciones públicas" subtitle="Proveedores, montos y concentración · base lista para datos reales OCDS/OECE (Fase 1)" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Monto contratado" value={soles(s.totalAmount)} />
        <Kpi label="N° de contratos" value={num(s.totalContracts)} />
        <Kpi label="Concentración top proveedor" value={pct(s.topProviderShare)} tone={s.topProviderShare > 30 ? 'bad' : 'default'} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Ranking de proveedores por monto</CardTitle></CardHeader>
        <CardContent><Chart option={providerOption} height={360} /></CardContent>
      </Card>

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
              <th className="py-2">ID</th><th>Empresa</th><th>Proveedor</th><th>Objeto</th><th>Año</th><th className="text-right">Monto</th></tr></thead>
            <tbody>
              {items.slice(0, 200).map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2 font-mono text-xs">{c.id}</td>
                  <td>{c.company}</td>
                  <td>{c.provider}</td>
                  <td className="text-muted-foreground">{c.object}</td>
                  <td>{c.year}</td>
                  <td className="text-right font-medium">{soles(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 200 && <p className="pt-3 text-center text-xs text-muted-foreground">Mostrando 200 de {items.length}. Exporta para ver todo.</p>}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        <Badge variant="warning" className="mr-2">ilustrativo</Badge>
        Datos de ejemplo. La Fase 1 los reemplaza con la API OCDS del OECE por RUC de cada empresa.
      </p>
    </div>
  )
}
