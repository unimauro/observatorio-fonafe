import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import { useData } from '@/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { downloadCSV, downloadJSON } from '@/lib/export'

const ENDPOINTS = [
  { path: 'data/latest/dataset.json', desc: 'Dataset consolidado (vivo en GitHub Pages)' },
  { path: 'data/manifest.json', desc: 'Versión actual y snapshots disponibles' },
  { path: 'data/snapshots/<fecha>/dataset.json', desc: 'Snapshot histórico versionado' },
]
const API_FUTURE = ['/api/companies', '/api/financials', '/api/contracts', '/api/rankings', '/api/transparency']

export function OpenData() {
  const { data, loading, error } = useData()
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const base = import.meta.env.BASE_URL

  const companiesFlat = data.companies.map((c) => {
    const f = c.financials.at(-1)!
    return {
      slug: c.slug, empresa: c.name, sigla: c.acronym, sector: c.sector, ruc: c.ruc,
      empleados: c.employees, ingresos_mm: f.revenue, utilidad_mm: f.netIncome, ebitda_mm: f.ebitda,
      inversion_mm: f.investment, margen_neto_pct: c.metrics.netMargin, transparencia: c.metrics.transparencyScore,
    }
  })

  return (
    <div>
      <PageTitle title="Datos abiertos" subtitle="Reusa, audita y descarga. Todo el dataset es público y versionado." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Descargar</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => downloadJSON('observatorio-dataset.json', data)}>
              <FileJson className="h-4 w-4" /> Dataset completo (JSON)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => downloadCSV('empresas.csv', companiesFlat)}>
              <FileSpreadsheet className="h-4 w-4" /> Empresas (CSV / Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => downloadCSV('contratos.csv', data.contracts.items)}>
              <Download className="h-4 w-4" /> Contrataciones (CSV)
            </Button>
            <p className="pt-1 text-xs text-muted-foreground">PDF: exportación desde el backend FastAPI (local) en la Fase 3.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Versión del dataset</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Versión</span><span className="font-medium">{data.meta.version}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Generado</span><span className="font-medium">{data.meta.generated_at}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Año más reciente</span><span className="font-medium">{data.meta.latest_year}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Naturaleza</span>
              {data.meta.is_illustrative ? <Badge variant="warning">ilustrativo</Badge> : <Badge variant="success">oficial</Badge>}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>API estática (JSON sobre GitHub Pages)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="flex flex-col gap-1 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <code className="text-xs text-primary">{base}{e.path}</code>
              <span className="text-xs text-muted-foreground">{e.desc}</span>
            </div>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">
            API REST (FastAPI) para entornos con servidor — definida en <code>/backend</code> (Docker): {API_FUTURE.join(' · ')}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Fuentes de datos</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.meta.sources.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener"
               className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-muted">
              <span>{s.name}</span>
              <Badge variant={s.status === 'activo' ? 'success' : 'outline'}>{s.status}</Badge>
            </a>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">{data.meta.note}</p>
        </CardContent>
      </Card>
    </div>
  )
}
