export interface Source { name: string; url: string; status: string }
export interface Meta {
  version: string
  generated_at: string
  is_illustrative: boolean
  latest_year: number
  years: number[]
  sources: Source[]
  note: string
}
export interface Kpis {
  companies: number
  totalRevenue: number
  totalNetIncome: number
  totalEbitda: number
  totalInvestment: number
  totalBudget: number
  totalBudgetExecuted: number
  employees: number
  withLosses: number
  withProfits: number
  year: number
}
export interface Financial {
  year: number
  revenue: number
  netIncome: number
  ebitda: number
  investment: number
  budget: number
  budgetExecuted: number
}
export interface Period { period: string; revenue: number; netIncome: number; ebitda: number }
export interface Periodic { quarterly: Period[]; monthly: Period[] }
export interface Director { role: string; name: string }
export interface News { date: string; title: string; url: string }
export interface Metrics {
  netMargin: number
  revenuePerEmployee: number
  transparencyScore: number
  budgetExecution: number
}
export interface Transparency {
  score: number
  financials: boolean
  memoria: boolean
  directory: boolean
  budget: boolean
}
export interface Anomaly {
  type: string
  severity: string
  description: string
  company?: string
  companySlug?: string
}
export interface Recommendation {
  category: string
  priority: string
  action: string
  norma: string
  company?: string
  companySlug?: string
}
export interface Company {
  slug: string
  name: string
  acronym: string
  sector: string
  holding: string
  region: string
  ruc: string
  website: string
  employees: number
  description: string
  directors: Director[]
  financials: Financial[]
  periodic: Periodic
  news: News[]
  metrics: Metrics
  transparency: Transparency
  anomalies: Anomaly[]
  recommendations: Recommendation[]
}
export interface RankRow { slug: string; name: string; acronym: string; value: number; unit: string }
export interface Rankings { profitability: RankRow[]; efficiency: RankRow[]; transparency: RankRow[] }
export interface Contract {
  id: string; company: string; companySlug: string; provider: string
  amount: number; year: number | null; object: string; method: string
  amountType?: string; source?: string
}
export interface Provider { provider: string; total: number; count: number }
export interface Contracts {
  summary: { totalAmount: number; totalContracts: number; topProviderShare: number; entitiesCovered?: number }
  topProviders: Provider[]
  items: Contract[]
  isReal?: boolean
  coverage?: string[]
  byYear?: { year: number; count: number; amount: number }[]
  byEntity?: { slug: string; name: string; count: number; amount: number }[]
  byMethod?: { method: string; count: number }[]
  byStage?: { stage: string; count: number }[]
}
export interface TransparencyItem {
  company: string; slug: string; score: number
  financials: boolean; memoria: boolean; directory: boolean; budget: boolean
}
export interface TransparencyBlock { items: TransparencyItem[]; avgScore: number }
export interface Dataset {
  meta: Meta
  kpis: Kpis
  companies: Company[]
  rankings: Rankings
  contracts: Contracts
  transparency: TransparencyBlock
  anomalies: Anomaly[]
  recommendations: Recommendation[]
}
