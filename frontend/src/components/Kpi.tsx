import { cn } from '@/lib/utils'
import { Card } from './ui/card'
import type { LucideIcon } from 'lucide-react'

export function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  icon?: LucideIcon
  tone?: 'default' | 'good' | 'bad' | 'accent'
}) {
  const toneCls = {
    default: 'text-foreground',
    good: 'text-emerald-500',
    bad: 'text-red-500',
    accent: 'text-accent',
  }[tone]
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className={cn('mt-2 text-2xl font-bold tracking-tight', toneCls)}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  )
}
