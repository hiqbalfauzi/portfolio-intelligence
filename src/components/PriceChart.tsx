'use client'

import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi, type Time } from 'lightweight-charts'
import { useTheme } from '@/components/ThemeProvider'

export interface ChartBar {
  date: string // yyyy-mm-dd
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MaPoint { date: string; value: number }

interface Props {
  bars: ChartBar[]
  ma20: MaPoint[]
  ma50: MaPoint[]
  ma200: MaPoint[]
}

export function PriceChart({ bars, ma20, ma50, ma200 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!ref.current || bars.length === 0) return
    const dark = theme === 'dark'
    const chart: IChartApi = createChart(ref.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: dark ? '#9ca3af' : '#6b7280',
      },
      grid: {
        vertLines: { color: dark ? '#1f2937' : '#f3f4f6' },
        horzLines: { color: dark ? '#1f2937' : '#f3f4f6' },
      },
      height: 420,
      timeScale: { borderColor: dark ? '#374151' : '#e5e7eb' },
      rightPriceScale: { borderColor: dark ? '#374151' : '#e5e7eb' },
    })

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    })
    candles.setData(bars.map(b => ({ time: b.date as Time, open: b.open, high: b.high, low: b.low, close: b.close })))

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    })
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    volume.setData(bars.map(b => ({
      time: b.date as Time, value: b.volume,
      color: b.close >= b.open ? (dark ? '#22c55e40' : '#22c55e60') : (dark ? '#ef444440' : '#ef444460'),
    })))

    const addMa = (pts: MaPoint[], color: string, title: string) => {
      if (pts.length === 0) return
      const s = chart.addSeries(LineSeries, { color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title })
      s.setData(pts.map(p => ({ time: p.date as Time, value: p.value })))
    }
    addMa(ma20, '#3b82f6', 'MA20')
    addMa(ma50, '#f59e0b', 'MA50')
    addMa(ma200, '#a855f7', 'MA200')

    chart.timeScale().fitContent()

    const onResize = () => chart.applyOptions({ width: ref.current?.clientWidth })
    window.addEventListener('resize', onResize)
    onResize()

    return () => {
      window.removeEventListener('resize', onResize)
      chart.remove()
    }
  }, [bars, ma20, ma50, ma200, theme])

  return <div ref={ref} />
}
