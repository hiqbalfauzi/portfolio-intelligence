import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react'

interface PortfolioDetailPageProps {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { id } = params

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      positions: {
        where: { isActive: true },
        include: {
          security: true,
          thesis: true,
        },
      },
    },
  })

  if (!portfolio) {
    notFound()
  }

  const totalValue = portfolio.positions.reduce((sum, pos) => sum + pos.currentValue, 0)
  const totalCost = portfolio.positions.reduce((sum, pos) => sum + pos.totalCost, 0)
  const unrealizedPL = totalValue - totalCost
  const totalReturn = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0

  const fmt = (v: number) => {
    if (Math.abs(v) >= 1e9) return `Rp ${(v / 1e9).toFixed(2)}B`
    if (Math.abs(v) >= 1e6) return `Rp ${(v / 1e6).toFixed(2)}M`
    if (Math.abs(v) >= 1e3) return `Rp ${(v / 1e3).toFixed(1)}K`
    return `Rp ${v.toFixed(0)}`
  }

  const thesisColor = (s?: string) => {
    switch (s) {
      case 'UTUH': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'DIPANTAU': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'MELEMAH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'PATAH': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  // Sector allocation
  const sectorMap = portfolio.positions.reduce((acc, pos) => {
    const sector = pos.security.sector
    if (!acc[sector]) {
      acc[sector] = 0
    }
    acc[sector] += pos.currentValue
    return acc
  }, {} as Record<string, number>)

  const sectorAllocation = Object.entries(sectorMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Portfolio
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{portfolio.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {portfolio.broker || 'Tidak ada broker'} • {portfolio.positions.length} posisi aktif
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Nilai Portofolio"
          value={fmt(totalValue)}
          change={totalReturn}
          changeLabel="total return"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Modal"
          value={fmt(totalCost)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Unrealized P/L"
          value={fmt(unrealizedPL)}
          change={totalReturn}
          icon={unrealizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Realized P/L"
          value={fmt(portfolio.realizedPL)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Sector Allocation */}
      <Card>
        <CardHeader title="Alokasi per Sektor" description="Distribusi investasi berdasarkan sektor" />
        <CardContent>
          <div className="space-y-3">
            {sectorAllocation.map((sector) => (
              <div key={sector.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sector.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{sector.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                        style={{ width: `${sector.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-4 w-32 text-right">
                  {fmt(sector.value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positions */}
      <Card>
        <CardHeader title="Posisi Saham" description="Daftar semua saham dalam portofolio ini" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TICKER</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">SEKTOR</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">LOT</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">HARGA</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">NILAI</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">P/L</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">ALOKASI</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">STATUS TESIS</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((pos) => {
                  const allocation = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0
                  return (
                    <tr key={pos.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3">
                        <Link href={`/stocks/${pos.security.ticker}`} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          {pos.security.ticker}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{pos.security.name}</p>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{pos.security.sector}</td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{pos.quantity}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                        Rp {(pos.currentPrice || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{fmt(pos.currentValue)}</td>
                      <td className={`py-3 font-medium ${pos.unrealizedPLPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {pos.unrealizedPLPercent >= 0 ? '+' : ''}{pos.unrealizedPLPercent.toFixed(2)}%
                      </td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{allocation.toFixed(1)}%</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${thesisColor(pos.thesis?.status)}`}>
                          {pos.thesis?.status || 'BELUM ADA'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
