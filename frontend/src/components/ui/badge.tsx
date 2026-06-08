import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'accent'

const styles: Record<Variant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
  danger: 'bg-red-500/15 text-red-500',
  outline: 'border border-border text-muted-foreground',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold', styles[variant], className)}
      {...props}
    />
  )
}
