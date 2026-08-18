import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { PerHistoryChart } from '@/components/PerHistoryChart'
import Link from 'next/link'
import { ArrowLeft, Scale, TrendingUp, TrendingDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ ticker: string }>
}

export default async function ValuationPage({ params }: Props) {
  const { ticker } = await params
  const tickerUpper = ticker.toUpperCase()

  const security = await prisma.security.findFirst({ where: { ticker: tickerUpper } })
  if (!security) notFound()

  const [metrics, statements, bars] = await Promise.all([
    prisma.financialMetric.findMany({ where: { securityId: security.id } }),
    prisma.financialStatement.findMany({
      where: { securityId: security.id, type: 'INCOME_STATEMENT', periodType: 'ANNUAL' },
      orderBy: { periodEnd: 'asc' },
    }),
    prisma.priceBar.findMany({
      where: { securityId: security.id, timeframe: '1D' },
      orderBy: { date: 'asc' },
    }),
  ])

  const m = new Map(metrics.map(x => [x.metricName, x.metricValue]))
  const per = m.get('PER') ?? null
  const fwdPer = m.get('FORWARD_PER') ?? null
  const pbv = m.get('PBV') ?? null
  const divYield = m.get('DIVIDEND_YIELD') ?? null
  const ev = m.get('ENTERPRISE_VALUE') ?? null
  const mcap = m.get('MARKET_CAP') ?? null
  const shares = m.get('SHARES_OUTSTANDING') ?? null

  // EBITDA dari income statement terbaru
  let ebitda: number | null = null
  if (statements.length > 0) {
    const latest = JSON.parse(statements[statements.length - 1].data) as Record<string, number | null>
    ebitda = latest.ebitda ?? null
  }
  const evEbitda = ev != null && ebitda != null && ebitda > 0 ? ev / ebitda : null

  // Historical PER: EPS per tahun (netIncome / shares outstanding saat ini — aproksimasi),
  // harga penutupan akhir tahun dari price bars.
  const yearEndClose = new Map<number, number>()
  for (const b of bars) {
    const y = b.date.getFullYear()
    yearEndClose.set(y, b.close) // bar terakhir tiap tahun menang karena iterasi asc
  }

  const histPer: { year: string; PER: number | null }[] = []
  for (const s of statements) {
    const d = JSON.parse(s.data) as Record<string, number | null>
    const year = s.periodEnd.getFullYear()
    const close = yearEndClose.get(year)
    const eps = d.netIncome != null && shares ? d.netIncome / shares : null
    histPer.push({
      year: String(year),
      PER: eps != null && eps > 0 && close != null ? +(close / eps).toFixed(2) : null,
    })
  }
  const validPers = histPer.filter(x => x.PER != null).map(x => x.PER as number)
  const avgPer = validPers.length > 0 ? validPers.reduce((a, b) => a + b, 0) / validPers.length : null

  // Konteks valuasi: bandingkan PER kini vs rata-rata historis
  const context = per != null && avgPer != null
    ? per < avgPer * 0.8 ? { label: 'Di bawah rata-rata historis', color: 'text-green-600 dark:text-green-400', icon: <TrendingDown className="h-4 w-4" /> }
    : per > avgPer * 1.2 ? { label: 'Di atas rata-rata historis', color: 'text-red-600 dark:text-red-400', icon: <TrendingUp className="h-4 w-4" /> }
    : { label: 'Sekitar rata-rata historis', color: 'text-gray-600 dark:text-gray-400', icon: <Scale className="h-4 w-4" /> }
    : null

  const fmtBig = (v: number | null) => {
    if (v == null) return '-'
    const abs = Math.abs(v)
    if (abs >= 1e12) return `Rp ${(v / 1e12).toFixed(1)} T`
    if (abs >= 1e9) return `Rp ${(v / 1e9).toFixed(1)} M`
    return `Rp ${v.toLocaleString('id-ID')}`
  }
  const fmtNum = (v: number | null, d = 2) => v == null ? '-' : v.toFixed(d)
  const fmtPct = (v: number | null) => v == null ? '-' : `${(v * 100).toFixed(2)}%`

  const ratios = [
    { label: 'PER (TTM)', value: fmtNum(per), note: 'Harga / laba per saham 12 bulan terakhir' },
    { label: 'Forward PER', value: fmtNum(fwdPer), note: 'Berdasarkan estimasi laba ke depan' },
    { label: 'PBV', value: fmtNum(pbv), note: 'Harga / nilai buku per saham' },
    { label: 'EV/EBITDA', value: evEbitda != null ? fmtNum(evEbitda) : 'n/a (EBITDA tidak tersedia)', note: 'Enterprise value / EBITDA — untuk bank sering tidak relevan' },
    { label: 'Dividend Yield', value: fmtPct(divYield), note: 'Dividen per saham / harga' },
    { label: 'Market Cap', value: fmtBig(mcap), note: 'Kapitalisasi pasar' },
  ]

  return (
    <div className="space-y-6">
      <Link href={`/stocks/${tickerUpper}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" /> Kembali ke {tickerUpper}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tickerUpper} — Valuasi</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          Konteks valuasi: murah atau mahal relatif terhadap sejarah dan laba perusahaan
        </p>
      </div>

      {/* Valuation context */}
      {context && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4">
          <span className={context.color}>{context.icon}</span>
          <div>
            <p className={`text-sm font-semibold ${context.color}`}>{context.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PER kini {fmtNum(per)} vs rata-rata {histPer.length} tahun {fmtNum(avgPer)}. PER rendah bisa berarti murah atau value trap — cek kualitas laba.
            </p>
          </div>
        </div>
      )}

      {/* Current ratios */}
      <Card>
        <CardHeader title="Rasio Valuasi Terkini" description="Data dari Yahoo Finance (periode terakhir)" />
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {ratios.map(r => (
              <div key={r.label} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4" title={r.note}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{r.label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{r.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical PER */}
      {validPers.length > 0 && (
        <Card>
          <CardHeader
            title="PER Historis (akhir tahun)"
            description="Aproksimasi: harga penutupan akhir tahun ÷ EPS tahun tersebut (shares outstanding saat ini)"
          />
          <CardContent>
            <PerHistoryChart data={histPer} avgPer={avgPer} />
          </CardContent>
        </Card>
      )}

      {/* Caveat */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Keterbatasan:</strong> PER historis dihitung dengan shares outstanding saat ini (bukan historis), sehingga angka sebelum aksi korporasi bisa meleset.
          EV/EBITDA tidak relevan untuk bank. Dividend yield hanya periode terakhir — histori dividen belum tersedia di database.
        </p>
      </div>
    </div>
  )
}
