const nf = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 })

/** Millones de soles → "S/ 3,850 MM" */
export function soles(mm: number): string {
  return `S/ ${nf1.format(mm)} MM`
}

/** Soles "planos" con separador de miles */
export function solesRaw(v: number): string {
  return `S/ ${nf.format(v)}`
}

export function num(v: number): string {
  return nf.format(v)
}

export function pct(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`
}

/** Compacta millones: 15220 -> "15.2 mil MM" (miles de millones) */
export function solesCompact(mm: number): string {
  if (Math.abs(mm) >= 1000) return `S/ ${nf1.format(mm / 1000)} mil MM`
  return `S/ ${nf1.format(mm)} MM`
}
