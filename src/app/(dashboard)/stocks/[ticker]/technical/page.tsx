import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { PriceChart, type ChartBar, type MaPoint } from '@/components/PriceChart'
import { sma, rsi, macd, annualizedVolatility, maxDrawdown, srZones, type Bar } from '@/lib/indicators'
import Link from 'next/link'
import { ArrowLeft, Activity, Gauge, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ ticker: string }>
}

export default async function TechnicalPage({ params }: Props) {
  const { ticker } = await params
  const tickerUpper = ticker.toUpperCase()

  const security = await prisma.security.findFirst({ where: { ticker: tickerUpper } })
  if (!security) notFound()

  const rows = await prisma.priceBar.findMany({
    where: { securityId: security.id, timeframe: '1D' },
    orderBy: { date: 'asc' },
    take: 500,
  })
  if (rows.length < 20) notFound()

  const bars: Bar[] = rows.map(r => ({ date: r.date, open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume }))
  const closes = bars.map(b => b.close)
  const last = bars[bars.length - 1]
  const prev = bars[bars.length - 2]
  const dayChg = ((last.close - prev.close) / prev.close) * 100

  // Indicators
  const ma20All = sma(closes, 20)
  const ma50All = sma(closes, 50)
  const ma200All = sma(closes, 200)
  const rsiAll = rsi(closes, 14)
  const macdAll = macd(closes)
  const vol = annualizedVolatility(closes.slice(-252))
  const dd = maxDrawdown(closes.slice(-252))
  const sr = srZones(bars, 20)

  // TECH-03: relative strength vs IHSG (return saham - return IHSG, periode sama)
  let rs: { period: string; stock: number; ihsg: number; diff: number }[] = []
  if (tickerUpper !== 'IHSG') {
    const ihsgSec = await prisma.security.findUnique({ where: { ticker: 'IHSG' } })
    if (ihsgSec) {
      const ihsgRows = await prisma.priceBar.findMany({
        where: { securityId: ihsgSec.id, timeframe: '1D' },
        orderBy: { date: 'asc' },
        take: 500,
      })
      if (ihsgRows.length >= 20) {
        const ihsgByDate = new Map(ihsgRows.map(r => [r.date.toISOString().slice(0, 10), r.close]))
        const retOver = (days: number): { stock: number; ihsg: number } | null => {
          if (bars.length < days + 1) return null
          const startBar = bars[bars.length - 1 - days]
          const startKey = startBar.date.toISOString().slice(0, 10)
          const ihsgStart = ihsgByDate.get(startKey)
          const ihsgLast = ihsgRows[ihsgRows.length - 1].close
          if (ihsgStart == null || ihsgStart === 0) return null
          return {
            stock: ((last.close - startBar.close) / startBar.close) * 100,
            ihsg: ((ihsgLast - ihsgStart) / ihsgStart) * 100,
          }
        }
        rs = ([
          { period: '1 Bulan (21 hari)', days: 21 },
          { period: '3 Bulan (63 hari)', days: 63 },
          { period: '1 Tahun (252 hari)', days: 252 },
        ] as const).flatMap(({ period, days }) => {
          const r = retOver(days)
          return r ? [{ period, stock: r.stock, ihsg: r.ihsg, diff: r.stock - r.ihsg }] : []
        })
      }
    }
  }

  const ma20 = ma20All[ma20All.length - 1]
  const ma50 = ma50All[ma50All.length - 1]
  const ma200 = ma200All[ma200All.length - 1]
  const rsiNow = rsiAll[rsiAll.length - 1]
  const macdHist = macdAll.histogram[macdAll.histogram.length - 1]

  // Signals — aturan eksplisit (TECH-04)
  const signals: { label: string; type: 'bull' | 'bear' | 'info'; rule: string }[] = []
  const lookback20High = Math.max(...bars.slice(-21, -1).map(b => b.high))
  const lookback20Low = Math.min(...bars.slice(-21, -1).map(b => b.low))
  const avgVol20 = bars.slice(-21, -1).reduce((s, b) => s + b.volume, 0) / 20

  if (last.close > lookback20High) signals.push({ label: 'Breakout 20 hari', type: 'bull', rule: `Close ${last.close} > high tertinggi 20 hari sebelumnya (${lookback20High})` })
  if (last.close < lookback20Low) signals.push({ label: 'Breakdown 20 hari', type: 'bear', rule: `Close ${last.close} < low terendah 20 hari sebelumnya (${lookback20Low})` })
  if (last.volume > avgVol20 * 2) signals.push({ label: 'Lonjakan volume', type: 'info', rule: `Volume ${Math.round(last.volume / 1e6)}jt > 2x rata-rata 20 hari (${(avgVol20 / 1e6).toFixed(1)}jt)` })
  if (rsiNow != null && rsiNow >= 70) signals.push({ label: 'RSI overbought', type: 'bear', rule: `RSI(14) ${rsiNow.toFixed(1)} >= 70` })
  if (rsiNow != null && rsiNow <= 30) signals.push({ label: 'RSI oversold', type: 'bull', rule: `RSI(14) ${rsiNow.toFixed(1)} <= 30` })

  const trend = ma20 != null && ma50 != null && ma200 != null
    ? last.close > ma20 && ma20 > ma50 && ma50 > ma200 ? 'Uptrend (close > MA20 > MA50 > MA200)'
    : last.close < ma20 && ma20 < ma50 && ma50 < ma200 ? 'Downtrend (close < MA20 < MA50 < MA200)'
    : 'Sidang / mixed'
    : 'Data kurang untuk tren lengkap'

  const chartBars: ChartBar[] = bars.map(b => ({ date: b.date.toISOString().slice(0, 10), open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume }))
  const toMaPoints = (arr: (number | null)[]): MaPoint[] =>
    arr.map((v, i) => ({ date: bars[i].date.toISOString().slice(0, 10), value: v })).filter((p): p is MaPoint => p.value != null)

  const fmt = (n: number | null, d = 0) => n == null ? '-' : n.toLocaleString('id-ID', { maximumFractionDigits: d })

  return (
    <div className="space-y-6">
      <Link href={`/stocks/${tickerUpper}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke {tickerUpper}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tickerUpper} — Teknikal</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Data per {last.date.toISOString().slice(0, 10)} · {bars.length} bar harian
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rp {fmt(last.close)}</p>
          <p className={`text-sm font-medium ${dayChg >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {dayChg >= 0 ? '+' : ''}{dayChg.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader title="Harga & Volume" description="Candlestick harian + MA20/50/200 + volume" />
        <CardContent>
          <PriceChart bars={chartBars} ma20={toMaPoints(ma20All)} ma50={toMaPoints(ma50All)} ma200={toMaPoints(ma200All)} />
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="RSI (14)" value={rsiNow != null ? rsiNow.toFixed(1) : '-'} icon={<Gauge className="h-5 w-5" />} />
        <MetricCard title="MACD Histogram" value={macdHist != null ? macdHist.toFixed(1) : '-'} icon={<Activity className="h-5 w-5" />} />
        <MetricCard title="Volatilitas Tahunan" value={vol != null ? `${vol.toFixed(1)}%` : '-'} icon={<AlertTriangle className="h-5 w-5" />} />
        <MetricCard title="Max Drawdown (1 thn)" value={dd != null ? `${dd.toFixed(1)}%` : '-'} icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      {/* TECH-03: Relative Strength vs IHSG */}
      {rs.length > 0 && (
        <Card>
          <CardHeader title="Relative Strength vs IHSG" description="Return saham dikurangi return IHSG pada periode yang sama — positif berarti outperform" />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">PERIODE</th>
                    <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">{tickerUpper}</th>
                    <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">IHSG</th>
                    <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">SELISIH</th>
                  </tr>
                </thead>
                <tbody>
                  {rs.map(r => (
                    <tr key={r.period} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-2 text-gray-700 dark:text-gray-300">{r.period}</td>
                      <td className={`py-2 font-medium ${r.stock >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {r.stock >= 0 ? '+' : ''}{r.stock.toFixed(2)}%
                      </td>
                      <td className={`py-2 ${r.ihsg >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {r.ihsg >= 0 ? '+' : ''}{r.ihsg.toFixed(2)}%
                      </td>
                      <td className={`py-2 font-semibold ${r.diff >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {r.diff >= 0 ? '+' : ''}{r.diff.toFixed(2)}% {r.diff >= 0 ? '(outperform)' : '(underperform)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Trend & MA */}
        <Card>
          <CardHeader title="Tren & Moving Average" description="Posisi harga terhadap MA" />
          <CardContent>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">{trend}</p>
            <div className="space-y-2">
              {[
                { label: 'MA20', value: ma20, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'MA50', value: ma50, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'MA200', value: ma200, color: 'text-purple-600 dark:text-purple-400' },
              ].map(m => (
                <div key={m.label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className={`text-sm font-medium ${m.color}`}>{m.label}</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {fmt(m.value)}
                    {m.value != null && (
                      <span className={`ml-2 text-xs ${last.close >= m.value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {last.close >= m.value ? '▲ di atas' : '▼ di bawah'}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support/Resistance */}
        <Card>
          <CardHeader title="Support & Resistance" description="Zona estimasi dari 20 hari terakhir — bukan angka pasti" />
          <CardContent>
            {sr ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Zona Support
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-300 mt-1">
                    Rp {fmt(sr.support[0])} – Rp {fmt(sr.support[1])}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" /> Zona Resistance
                  </p>
                  <p className="text-lg font-bold text-red-900 dark:text-red-300 mt-1">
                    Rp {fmt(sr.resistance[0])} – Rp {fmt(sr.resistance[1])}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dihitung dari low/high 20 bar terakhir dengan toleransi ±2%.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Data kurang.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signals */}
      <Card>
        <CardHeader title="Sinyal Terdeteksi" description="Aturan eksplisit: breakout/breakdown 20 hari, lonjakan volume 2x, RSI ekstrem" />
        <CardContent>
          {signals.length > 0 ? (
            <div className="space-y-2">
              {signals.map((s, i) => (
                <div key={i} className={`rounded-lg border p-3 ${
                  s.type === 'bull' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' :
                  s.type === 'bear' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                  'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <p className={`text-sm font-medium ${
                    s.type === 'bull' ? 'text-green-800 dark:text-green-400' :
                    s.type === 'bear' ? 'text-red-800 dark:text-red-400' :
                    'text-blue-800 dark:text-blue-400'
                  }`}>{s.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Aturan: {s.rule}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Tidak ada sinyal aktif saat ini.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
