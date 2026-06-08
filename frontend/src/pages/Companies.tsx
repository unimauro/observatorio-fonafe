import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertTriangle } from 'lucide-react'
import { useData } from '@/data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { soles, pct } from '@/lib/format'

export function Companies() {
  const { data, loading, error } = useData()
  const [q, setQ] = useState('')
  const [sector, setSector] = useState('Todos')
  const [region, setRegion] = useState('Todas')

  const sectors = useMemo(
    () => (data ? ['Todos', ...Array.from(new Set(data.companies.map((c) => c.sector)))] : ['Todos']),
    [data],
  )
  const regions = useMemo(
    () => (data ? ['Todas', ...Array.from(new Set(data.companies.map((c) => c.region))).sort()] : ['Todas']),
    [data],
  )
  const list = useMemo(() => {
    if (!data) return []
    return data.companies.filter((c) => {
      const okSector = sector === 'Todos' || c.sector === sector
      const okRegion = region === 'Todas' || c.region === region
      const okQ = !q || (c.name + c.acronym + c.sector + c.region).toLowerCase().includes(q.toLowerCase())
      return okSector && okRegion && okQ
    })
  }, [data, q, sector, region])

  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />

  return (
    <div>
      <PageTitle title="Empresas estatales" subtitle={`${data.companies.length} empresas del portafolio · filtra y explora cada ficha`} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar empresa…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {sectors.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {regions.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const last = c.financials[c.financials.length - 1]
          return (
            <Link key={c.slug} to={`/empresa/${c.slug}`}>
              <Card className="h-full p-4 transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-bold">{c.acronym}</div>
                    <div className="text-xs text-muted-foreground">{c.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{c.sector}</Badge>
                    {c.region !== 'Nacional' && <Badge variant="default">{c.region}</Badge>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted/50 p-2">
                    <div className="text-muted-foreground">Ingresos</div>
                    <div className="font-semibold">{soles(last.revenue)}</div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <div className="text-muted-foreground">Margen neto</div>
                    <div className={`font-semibold ${c.metrics.netMargin < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {pct(c.metrics.netMargin)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="accent">Transp. {c.metrics.transparencyScore}/100</Badge>
                  {c.anomalies.length > 0 && (
                    <Badge variant="warning"><AlertTriangle className="h-3 w-3" />{c.anomalies.length}</Badge>
                  )}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
      {list.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Sin resultados.</p>}
    </div>
  )
}
