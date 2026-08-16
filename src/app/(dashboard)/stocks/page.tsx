import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StocksPage() {
  const positions = await prisma.position.findMany({
    where: { isActive: true },
    include: {
      security: true,
      thesis: true,
      portfolio: true,
    },
    orderBy: { currentValue: 'desc' },
  })

  const fmt = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(1)}K`
    return `Rp ${v.toFixed(0)}`
  }

  const thesisColor = (s?: string) => {
    switch (s) {
      case 'UTUH': return 'bg-green-100 text-green-800'
      case 'DIPANTAU': return 'bg-yellow-100 text-yellow-800'
      case 'MELEMAH': return 'bg-orange-100 text-orange-800'
      case 'PATAH': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stocks</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pantau semua saham dalam portofolio Anda</p>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">TICKER</th>
                  <th className="pb-3 font-medium text-gray-500">SEKTOR</th>
                  <th className="pb-3 font-medium text-gray-500">HARGA</th>
                  <th className="pb-3 font-medium text-gray-500">LOT</th>
                  <th className="pb-3 font-medium text-gray-500">NILAI</th>
                  <th className="pb-3 font-medium text-gray-500">P/L</th>
                  <th className="pb-3 font-medium text-gray-500">STATUS TESIS</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <Link href={`/stocks/${pos.security.ticker}`}
                        className="font-semibold text-blue-600 hover:text-blue-700">
                        {pos.security.ticker}
                      </Link>
                      <p className="text-xs text-gray-500">{pos.security.name}</p>
                    </td>
                    <td className="py-3 text-gray-600">{pos.security.sector}</td>
                    <td className="py-3 font-medium text-gray-900">
                      Rp {(pos.currentPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-gray-700">{pos.quantity}</td>
                    <td className="py-3 text-gray-900">{fmt(pos.currentValue)}</td>
                    <td className={`py-3 font-medium ${pos.unrealizedPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pos.unrealizedPLPercent >= 0 ? '+' : ''}{pos.unrealizedPLPercent.toFixed(2)}%
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${thesisColor(pos.thesis?.status)}`}>
                        {pos.thesis?.status || 'BELUM ADA'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
