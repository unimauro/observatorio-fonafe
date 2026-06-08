import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Wallet, Activity, HardHat, PiggyBank, Users, TrendingUp, TrendingDown, ShieldCheck,
} from 'lucide-react'
import { useData } from '@/data'
import { Kpi } from '@/components/Kpi'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { soles, solesCompact, num } from '@/lib/format'

type Gran = 'year' | 'quarterly' | 'monthly'

export function Dashboard() {
  const { data, loading, error } = useData()
  const [gran, setGran] = useState<Gran>('year')

  const consolidated = useMemo(() => {
    if (!data) return []
    if (gran === 'year') {
      return data.meta.years.map((y, i) => {
        let rev = 0, net = 0, ebi = 0
        data.companies.forEach((c) => {
          const f = c.financials[i]
          if (f) { rev += f.revenue; net += f.netIncome; ebi += f.ebitda }
        })
        return { period: String(y), rev: +rev.toFixed(1), net: +net.toFixed(1), ebi: +ebi.toFixed(1) }
      })
    }
    const ref = data.companies[0].periodic[gran]
    return ref.map((p, idx) => {
      let rev = 0, net = 0, ebi = 0
      data.companies.forEach((c) => {
        const x = c.periodic[gran][idx]
        if (x) { rev += x.revenue; net += x.netIncome; ebi += x.ebitda }
      })
      return { period: p.period, rev: +rev.toFixed(1), net: +net.toFixed(1), ebi: +ebi.toFixed(1) }
    })
  }, [data, gran])

  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const k = data.kpis

  const evoOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos', 'Utilidad neta', 'EBITDA'], top: 0 },
    grid: { left: 50, right: 16, top: 36, bottom: 28 },
    xAxis: { type: 'category', data: consolidated.map((d) => d.period) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [
      { name: 'Ingresos', type: 'line', smooth: true, areaStyle: { opacity: 0.12 }, data: consolidated.map((d) => d.rev) },
      { name: 'Utilidad neta', type: 'line', smooth: true, data: consolidated.map((d) => d.net) },
      { name: 'EBITDA', type: 'line', smooth: true, data: consolidated.map((d) => d.ebi) },
    ],
  }

  const byCompany = [...data.companies].sort(
    (a, b) => b.financials[b.financials.length - 1].revenue - a.financials[a.financials.length - 1].revenue,
  )
  const revByCompanyOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 90, right: 20, top: 10, bottom: 24 },
    xAxis: { type: 'value', name: 'S/ MM' },
    yAxis: { type: 'category', data: byCompany.map((c) => c.acronym).reverse() },
    series: [{
      type: 'bar', data: byCompany.map((c) => c.financials[c.financials.length - 1].revenue).reverse(),
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    }],
  }

  const sectorMap: Record<string, number> = {}
  data.companies.forEach((c) => {
    const inv = c.financials[c.financials.length - 1].investment
    sectorMap[c.sector] = (sectorMap[c.sector] || 0) + inv
  })
  const investmentOption = {
    tooltip: { trigger: 'item', formatter: '{b}: S/ {c} MM ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      type: 'pie', radius: ['42%', '70%'], center: ['50%', '44%'], avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: 'transparent' },
      label: { show: false }, emphasis: { label: { show: true, fontWeight: 'bold' } },
      data: Object.entries(sectorMap).map(([name, value]) => ({ name, value: +value.toFixed(1) })),
    }],
  }

  const profit = data.rankings.profitability.slice(0, 8)
  const profitOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => v + ' %' },
    grid: { left: 80, right: 24, top: 10, bottom: 24 },
    xAxis: { type: 'value', name: '% margen' },
    yAxis: { type: 'category', data: profit.map((r) => r.acronym).reverse() },
    series: [{
      type: 'bar', data: profit.map((r) => ({
        value: r.value,
        itemStyle: { color: r.value < 0 ? '#ef4444' : '#10b981', borderRadius: [0, 4, 4, 0] },
      })).reverse(),
    }],
  }

  return (
    <div>
      <PageTitle
        title="Panel del portafolio estatal"
        subtitle={`Empresas FONAFE y otras · ${k.companies} empresas · ejercicio ${k.year}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <Kpi label="Empresas estatales" value={num(k.companies)} icon={Building2} />
        <Kpi label="Ingresos totales" value={solesCompact(k.totalRevenue)} icon={Wallet} sub={`ejercicio ${k.year}`} />
        <Kpi label="Utilidad neta total" value={solesCompact(k.totalNetIncome)} icon={k.totalNetIncome >= 0 ? TrendingUp : TrendingDown} tone={k.totalNetIncome >= 0 ? 'good' : 'bad'} />
        <Kpi label="EBITDA consolidado" value={solesCompact(k.totalEbitda)} icon={Activity} />
        <Kpi label="Inversión ejecutada" value={solesCompact(k.totalInvestment)} icon={HardHat} />
        <Kpi label="Presupuesto" value={solesCompact(k.totalBudget)} icon={PiggyBank} sub={`ejecutado ${soles(k.totalBudgetExecuted)}`} />
        <Kpi label="Trabajadores" value={num(k.employees)} icon={Users} />
        <Kpi label="Empresas con pérdidas" value={num(k.withLosses)} icon={TrendingDown} tone="bad" />
        <Kpi label="Empresas con ganancias" value={num(k.withProfits)} icon={TrendingUp} tone="good" />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Evolución consolidada (ingresos · utilidad · EBITDA)</CardTitle>
          <Tabs
            active={gran}
            onChange={(v) => setGran(v as Gran)}
            tabs={[{ id: 'year', label: 'Año' }, { id: 'quarterly', label: 'Trimestre' }, { id: 'monthly', label: 'Mes' }]}
          />
        </CardHeader>
        <CardContent>
          <Chart option={evoOption} height={340} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ingresos por empresa ({k.year})</CardTitle></CardHeader>
          <CardContent><Chart option={revByCompanyOption} height={420} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inversión por sector ({k.year})</CardTitle></CardHeader>
          <CardContent><Chart option={investmentOption} height={420} /></CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ranking de rentabilidad (margen neto)</CardTitle></CardHeader>
          <CardContent><Chart option={profitOption} height={360} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Salud del portafolio</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>Empresas con pérdidas</span>
              <Badge variant="danger">{k.withLosses} de {k.companies}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>Anomalías detectadas</span>
              <Badge variant="warning">{data.anomalies.length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>Recomendaciones de gestión</span>
              <Badge variant="primary">{data.recommendations.length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>Transparencia promedio</span>
              <Badge variant="accent">{data.transparency.avgScore}/100</Badge>
            </div>
            <Link to="/decisiones" className="block rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Ver diagnóstico y qué hacer →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
