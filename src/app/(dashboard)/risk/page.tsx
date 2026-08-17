import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { AlertTriangle, TrendingDown, PieChart, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RiskPage() {
  const positions = await prisma.position.findMany({
    where: { isActive: true },
    include: {
      security: true,
    },
    orderBy: { currentValue: 'desc' },
  })

  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0)

  // Calculate concentration per stock
  const stockConcentration = positions.map(pos => ({
    ticker: pos.security.ticker,
    name: pos.security.name,
    value: pos.currentValue,
    percentage: totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0,
    unrealizedPL: pos.unrealizedPL,
    unrealizedPLPercent: pos.unrealizedPLPercent,
  }))

  // Calculate concentration per sector
  const sectorMap = positions.reduce((acc, pos) => {
    const sector = pos.security.sector
    if (!acc[sector]) {
      acc[sector] = { value: 0, count: 0 }
    }
    acc[sector].value += pos.currentValue
    acc[sector].count += 1
    return acc
  }, {} as Record<string, { value: number; count: number }>)

  const sectorConcentration = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.percentage - a.percentage)

  // Risk metrics
  const topStock = stockConcentration[0]
  const topSector = sectorConcentration[0]
  const losingPositions = positions.filter(p => p.unrealizedPL < 0)
  const totalLoss = losingPositions.reduce((sum, p) => sum + Math.abs(p.unrealizedPL), 0)

  // Stress test scenarios
  const stressTest = (declinePercent: number) => {
    const loss = totalValue * (declinePercent / 100)
    return {
      decline: declinePercent,
      loss,
      newValue: totalValue - loss,
    }
  }

  const scenarios = [
    stressTest(10),
    stressTest(20),
    stressTest(30),
  ]

  const fmt = (v: number) => {
    if (Math.abs(v) >= 1e9) return `Rp ${(v / 1e9).toFixed(2)}B`
    if (Math.abs(v) >= 1e6) return `Rp ${(v / 1e6).toFixed(2)}M`
    if (Math.abs(v) >= 1e3) return `Rp ${(v / 1e3).toFixed(1)}K`
    return `Rp ${v.toFixed(0)}`
  }

  const getConcentrationRisk = (percentage: number) => {
    if (percentage >= 30) return { level: 'HIGH', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' }
    if (percentage >= 20) return { level: 'MEDIUM', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }
    return { level: 'LOW', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' }
  }

  const topStockRisk = topStock ? getConcentrationRisk(topStock.percentage) : null
  const topSectorRisk = topSector ? getConcentrationRisk(topSector.percentage) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Risk Center</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analisis risiko dan konsentrasi portofolio</p>
      </div>

      {/* Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Nilai"
          value={fmt(totalValue)}
          icon={<PieChart className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Loss"
          value={fmt(totalLoss)}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Posisi Rugi"
          value={losingPositions.length}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <MetricCard
          title="Jumlah Saham"
          value={positions.length}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      {/* Concentration Risk Summary */}
      <Card>
        <CardHeader title="Risiko Konsentrasi" description="Distribusi aset per saham dan sektor" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Stock Concentration */}
            {topStock && topStockRisk && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Saham Terbesar</h4>
                  <span className={`text-xs px-2 py-1 rounded ${topStockRisk.bg} ${topStockRisk.color}`}>
                    Risiko {topStockRisk.level}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{topStock.ticker}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {topStock.percentage.toFixed(1)}% dari portofolio
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Nilai: {fmt(topStock.value)}
                </p>
              </div>
            )}

            {/* Top Sector Concentration */}
            {topSector && topSectorRisk && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sektor Terbesar</h4>
                  <span className={`text-xs px-2 py-1 rounded ${topSectorRisk.bg} ${topSectorRisk.color}`}>
                    Risiko {topSectorRisk.level}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{topSector.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {topSector.percentage.toFixed(1)}% dari portofolio
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {topSector.count} saham • Nilai: {fmt(topSector.value)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Concentration Table */}
      <Card>
        <CardHeader title="Konsentrasi per Saham" description="Alokasi dan risiko per posisi" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TICKER</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">NILAI</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">ALOKASI</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">P/L</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">RISIKO</th>
                </tr>
              </thead>
              <tbody>
                {stockConcentration.map((stock) => {
                  const risk = getConcentrationRisk(stock.percentage)
                  return (
                    <tr key={stock.ticker} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{stock.ticker}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</p>
                      </td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{fmt(stock.value)}</td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{stock.percentage.toFixed(1)}%</td>
                      <td className={`py-3 font-medium ${stock.unrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {fmt(stock.unrealizedPL)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${risk.bg} ${risk.color}`}>
                          {risk.level}
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

      {/* Sector Concentration */}
      <Card>
        <CardHeader title="Konsentrasi per Sektor" description="Distribusi aset per sektor" />
        <CardContent>
          <div className="space-y-3">
            {sectorConcentration.map((sector) => {
              const risk = getConcentrationRisk(sector.percentage)
              return (
                <div key={sector.name} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sector.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sector.count} saham</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sector.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{fmt(sector.value)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        risk.level === 'HIGH' ? 'bg-red-500' :
                        risk.level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(sector.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stress Test */}
      <Card>
        <CardHeader title="Stress Test" description="Simulasi penurunan nilai portofolio" />
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <div key={scenario.decline} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Penurunan {scenario.decline}%
                  </h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kerugian</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">-{fmt(scenario.loss)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nilai Baru</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fmt(scenario.newValue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Catatan:</strong> Stress test ini adalah simulasi sederhana dan tidak memperhitungkan korelasi antar saham, likuiditas, atau faktor makroekonomi. Gunakan sebagai panduan kasar, bukan prediksi akurat.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
