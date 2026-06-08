import { Check, X, Download } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Kpi } from '@/components/Kpi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { downloadCSV } from '@/lib/export'

function Flag({ ok }: { ok: boolean }) {
  return ok
    ? <Check className="h-4 w-4 text-emerald-500" />
    : <X className="h-4 w-4 text-red-500" />
}

export function Transparency() {
  const { data, loading, error } = useData()
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />

  const items = [...data.transparency.items].sort((a, b) => b.score - a.score)
  const scoreOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => `${v}/100` },
    grid: { left: 90, right: 24, top: 10, bottom: 24 },
    xAxis: { type: 'value', max: 100, name: '/100' },
    yAxis: { type: 'category', data: items.map((i) => i.company).reverse() },
    series: [{
      type: 'bar',
      data: items.map((i) => ({
        value: i.score,
        itemStyle: { color: i.score >= 70 ? '#10b981' : i.score >= 50 ? '#f59e0b' : '#ef4444', borderRadius: [0, 4, 4, 0] },
      })).reverse(),
    }],
  }

  return (
    <div>
      <PageTitle title="Transparencia" subtitle="Cumplimiento de publicación de información pública (Ley 27806)" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Score promedio" value={`${data.transparency.avgScore}/100`} tone="accent" />
        <Kpi label="Publican EE.FF." value={`${items.filter((i) => i.financials).length}/${items.length}`} />
        <Kpi label="Publican memoria" value={`${items.filter((i) => i.memoria).length}/${items.length}`} />
        <Kpi label="Publican directorio" value={`${items.filter((i) => i.directory).length}/${items.length}`} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Índice de transparencia por empresa</CardTitle></CardHeader>
        <CardContent><Chart option={scoreOption} height={420} /></CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Detalle de cumplimiento</CardTitle>
          <Button size="sm" variant="outline" onClick={() => downloadCSV('transparencia.csv', items)}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Empresa</th><th className="text-center">EE.FF.</th><th className="text-center">Memoria</th>
              <th className="text-center">Directorio</th><th className="text-center">Presupuesto</th><th className="text-right">Score</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.slug} className="border-b border-border/60">
                  <td className="py-2">{i.company}</td>
                  <td><div className="flex justify-center"><Flag ok={i.financials} /></div></td>
                  <td><div className="flex justify-center"><Flag ok={i.memoria} /></div></td>
                  <td><div className="flex justify-center"><Flag ok={i.directory} /></div></td>
                  <td><div className="flex justify-center"><Flag ok={i.budget} /></div></td>
                  <td className="text-right font-semibold">{i.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
