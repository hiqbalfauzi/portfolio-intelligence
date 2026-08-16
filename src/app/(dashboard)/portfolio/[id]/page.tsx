import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      positions: {
        where: { isActive: true },
        include: { security: true, thesis: true },
      },
      transactions: {
        orderBy: { date: 'desc' },
        take: 20,
        include: { security: true },
      },
    },
  })

  if (!portfolio) return notFound()

  const totalValue = portfolio.positions.reduce((s, p) => s + p.currentValue, 0)
  const totalCost = portfolio.positions.reduce((s, p) => s + p.totalCost, 0)
  const totalPL = totalValue - totalCost
  const totalReturn = totalCost > 0 ? (totalPL / totalCost) * 100 : 0

  const fmt = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(1)}K`
    return `Rp ${v.toFixed(0)}`
  }

  const fmtFull = (v: number) => `Rp ${v.toLocaleString('id-ID')}`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/portfolio" className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{portfolio.name}</h1>
          <p className="text-sm text-gray-500">{portfolio.broker} · {portfolio.positions.length} posisi aktif</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Nilai Pasar" value={fmt(totalValue)}
          change={totalReturn} changeLabel="return"
          icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Total Modal" value={fmt(totalCost)} />
        <MetricCard title="Unrealized P/L" value={fmt(totalPL)}
          icon={totalPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />} />
        <MetricCard title="Realized P/L" value={fmt(portfolio.realizedPL)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Posisi Saham" />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TICKER</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">LOT</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">AVG</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">LAST</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">NILAI</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">P/L</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">%</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">ALOKASI</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.positions.map((pos) => {
                    const alloc = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0
                    return (
                      <tr key={pos.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="py-3">
                          <Link href={`/stocks/${pos.security.ticker}`}
                            className="font-semibold text-blue-600 hover:text-blue-700">
                            {pos.security.ticker}
                          </Link>
                          <p className="text-xs text-gray-500">{pos.security.name}</p>
                        </td>
                        <td className="py-3 text-gray-700 dark:text-gray-300">{pos.quantity}</td>
                        <td className="py-3 text-gray-700 dark:text-gray-300">{fmtFull(pos.averageCost)}</td>
                        <td className="py-3 text-gray-900 dark:text-gray-100 font-medium">{fmtFull(pos.currentPrice || 0)}</td>
                        <td className="py-3 text-gray-900 dark:text-gray-100">{fmt(pos.currentValue)}</td>
                        <td className={`py-3 font-medium ${pos.unrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {fmt(pos.unrealizedPL)}
                        </td>
                        <td className={`py-3 font-medium ${pos.unrealizedPLPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pos.unrealizedPLPercent >= 0 ? '+' : ''}{pos.unrealizedPLPercent.toFixed(2)}%
                        </td>
                        <td className="py-3 text-gray-700 dark:text-gray-300">{alloc.toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Transaksi Terakhir" />
          <CardContent>
            <div className="space-y-3">
              {portfolio.transactions.length === 0 && (
                <p className="text-sm text-gray-500">Belum ada transaksi</p>
              )}
              {portfolio.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100">{tx.security.ticker}</p>
                    <p className="text-xs text-gray-500">
                      {tx.date.toLocaleDateString('id-ID')} · {tx.type} · {tx.quantity} lot
                    </p>
                  </div>
                  <p className={`font-medium ${tx.type === 'BUY' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {tx.type === 'BUY' ? '-' : '+'}{fmt(tx.netAmount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
