import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'
import { useIsDark, PALETTE } from './theme'

function makeTheme(dark: boolean) {
  const axis = {
    axisLine: { lineStyle: { color: dark ? '#475569' : '#cbd5e1' } },
    axisLabel: { color: dark ? '#94a3b8' : '#475569' },
    splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } },
  }
  return {
    color: PALETTE,
    backgroundColor: 'transparent',
    textStyle: { color: dark ? '#cbd5e1' : '#334155', fontFamily: 'Inter, sans-serif' },
    title: { textStyle: { color: dark ? '#e2e8f0' : '#1e293b' } },
    legend: { textStyle: { color: dark ? '#cbd5e1' : '#475569' } },
    categoryAxis: axis,
    valueAxis: axis,
    logAxis: axis,
    timeAxis: axis,
    tooltip: {
      backgroundColor: dark ? '#0f172a' : '#ffffff',
      borderColor: dark ? '#334155' : '#e2e8f0',
      textStyle: { color: dark ? '#e2e8f0' : '#1e293b' },
    },
  }
}

echarts.registerTheme('obs-dark', makeTheme(true))
echarts.registerTheme('obs-light', makeTheme(false))

export function Chart({
  option,
  height = 320,
  className,
}: {
  option: echarts.EChartsCoreOption
  height?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inst = useRef<echarts.ECharts | null>(null)
  const dark = useIsDark()

  useEffect(() => {
    if (!ref.current) return
    inst.current?.dispose()
    inst.current = echarts.init(ref.current, dark ? 'obs-dark' : 'obs-light', { renderer: 'canvas' })
    inst.current.setOption(option)
    const onResize = () => inst.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      inst.current?.dispose()
      inst.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark])

  useEffect(() => {
    inst.current?.setOption(option, true)
  }, [option])

  return <div ref={ref} style={{ height }} className={className} />
}
