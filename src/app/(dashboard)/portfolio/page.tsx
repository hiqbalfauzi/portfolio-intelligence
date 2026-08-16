import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { Briefcase, Plus, Upload, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const portfolios = await prisma.portfolio.findMany({
    include: {
      positions: {
        where: { isActive: true },
        include: { security: true },
      },
      _count: { select: { positions: { where: { isActive: true } } } },
    },
  })

  const totalValue = portfolios.reduce((sum, p) =>
    sum + p.positions.reduce((s, pos) => s + pos.currentValue, 0), 0)
  const totalCost = portfolios.reduce((sum, p) =>
    sum + p.positions.reduce((s, pos) => s + pos.totalCost, 0), 0)
  const totalPL = totalValue - totalCost
  const totalReturn = totalCost > 0 ? (totalPL / totalCost) * 100 : 0

  const fmt = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(1)}K`
    return `Rp ${v.toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola semua portofolio investasi Anda</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Tambah Portofolio
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="h-4 w-4" /> Impor CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Total Nilai" value={fmt(totalValue)}
          change={totalReturn} changeLabel="return" icon={<Briefcase className="h-5 w-5" />} />
        <MetricCard title="Total P/L" value={fmt(totalPL)}
          icon={totalPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />} />
        <MetricCard title="Jumlah Portofolio" value={portfolios.length}
          icon={<Briefcase className="h-5 w-5" />} />
      </div>

      {portfolios.map((portfolio) => {
        const pValue = portfolio.positions.reduce((s, p) => s + p.currentValue, 0)
        const pCost = portfolio.positions.reduce((s, p) => s + p.totalCost, 0)
        const pPL = pValue - pCost
        const pReturn = pCost > 0 ? (pPL / pCost) * 100 : 0

        return (
          <Card key={portfolio.id}>
            <CardHeader
              title={portfolio.name}
              description={portfolio.broker || ''}
              action={
                <Link href={`/portfolio/${portfolio.id}`}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
                  Detail →
                </Link>
              }
            />
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nilai</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{fmt(pValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">P/L</p>
                  <p className={`font-semibold ${pPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {fmt(pPL)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Return</p>
                  <p className={`font-semibold ${pReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {pReturn.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posisi</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{portfolio._count.positions} saham</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {portfolio.positions.slice(0, 6).map((pos) => (
                  <span key={pos.id}
                    className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {pos.security.ticker}
                    <span className={`ml-1 ${pos.unrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {pos.unrealizedPLPercent >= 0 ? '+' : ''}{pos.unrealizedPLPercent.toFixed(1)}%
                    </span>
                  </span>
                ))}
                {portfolio.positions.length > 6 && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-700 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{portfolio.positions.length - 6} lainnya
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
