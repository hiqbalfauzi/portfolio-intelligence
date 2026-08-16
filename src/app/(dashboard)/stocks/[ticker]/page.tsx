import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { ArrowLeft, TrendingUp, TrendingDown, FileText, BarChart3, Newspaper, Target, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params

  const position = await prisma.position.findFirst({
    where: {
      isActive: true,
      security: { ticker },
    },
    include: {
      security: true,
      thesis: {
        include: {
          evidence: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  })

  if (!position) return notFound()

  const fmt = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(1)}K`
    return `Rp ${v.toFixed(0)}`
  }

  const fmtFull = (v: number) => `Rp ${v.toLocaleString('id-ID')}`

  const thesisStatusColor = (status?: string) => {
    switch (status) {
      case 'UTUH': return 'bg-green-100 text-green-800 border-green-200'
      case 'DIPANTAU': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'MELEMAH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'PATAH': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/stocks" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{position.security.ticker}</h1>
            {position.thesis && (
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${thesisStatusColor(position.thesis.status)}`}>
                {position.thesis.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{position.security.name} · {position.security.sector}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Harga Terakhir" value={fmtFull(position.currentPrice || 0)}
          icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Nilai Posisi" value={fmt(position.currentValue)}
          change={position.unrealizedPLPercent} changeLabel="unrealized" />
        <MetricCard title="Average Cost" value={fmtFull(position.averageCost)} />
        <MetricCard title="Unrealized P/L" value={fmt(position.unrealizedPL)}
          icon={position.unrealizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Ringkasan Posisi" />
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Jumlah Lot</p>
                  <p className="text-lg font-semibold text-gray-900">{position.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Modal</p>
                  <p className="text-lg font-semibold text-gray-900">{fmt(position.totalCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Return</p>
                  <p className={`text-lg font-semibold ${position.unrealizedPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.unrealizedPLPercent >= 0 ? '+' : ''}{position.unrealizedPLPercent.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-gray-900">Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {position.thesis && (
            <Card>
              <CardHeader title="Investment Thesis" action={
                <Link href={`/stocks/${ticker}/thesis`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Edit →
                </Link>
              } />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{position.thesis.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{position.thesis.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Alasan</p>
                      <p className="text-gray-700">{position.thesis.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Horizon</p>
                      <p className="text-gray-700">{position.thesis.horizon}</p>
                    </div>
                  </div>
                  {position.thesis.evidence.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Bukti Terbaru</p>
                      <div className="space-y-2">
                        {position.thesis.evidence.map((ev) => (
                          <div key={ev.id} className="flex items-start gap-2 rounded-lg border p-2">
                            <div className={`mt-0.5 h-2 w-2 rounded-full ${
                              ev.type === 'SUPPORTING' ? 'bg-green-500' :
                              ev.type === 'CONTRADICTING' ? 'bg-red-500' : 'bg-gray-400'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                              <p className="text-xs text-gray-600">{ev.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Aksi Cepat" />
            <CardContent>
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Tambah Transaksi
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Edit Thesis
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Tambah Jurnal
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Buat Alert
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Informasi" />
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sektor</span>
                  <span className="font-medium text-gray-900">{position.security.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Portofolio</span>
                  <span className="font-medium text-gray-900">{position.portfolioId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dibuka</span>
                  <span className="font-medium text-gray-900">
                    {position.openedAt.toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
