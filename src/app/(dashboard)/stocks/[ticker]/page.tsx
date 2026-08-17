import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Target, Calendar, FileText, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface StockPageProps {
  params: Promise<{ ticker: string }>
}

export default async function StockDetailPage({ params }: StockPageProps) {
  const { ticker } = await params
  const tickerUpper = ticker.toUpperCase()

  const position = await prisma.position.findFirst({
    where: {
      isActive: true,
      security: { ticker: tickerUpper }
    },
    include: {
      security: true,
      thesis: {
        include: {
          evidence: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          }
        }
      },
      portfolio: true,
    },
  })

  if (!position) {
    notFound()
  }

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

  const thesisStatusLabel = (s?: string) => {
    switch (s) {
      case 'UTUH': return 'Tesis Utuh'
      case 'DIPANTAU': return 'Perlu Dipantau'
      case 'MELEMAH': return 'Tesis Melemah'
      case 'PATAH': return 'Tesis Patah'
      default: return 'Belum Ada Tesis'
    }
  }

  const supportingEvidence = position.thesis?.evidence.filter(e => e.type === 'SUPPORTING') || []
  const contradictingEvidence = position.thesis?.evidence.filter(e => e.type === 'CONTRADICTING') || []

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/stocks" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Stocks
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{position.security.ticker}</h1>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${thesisColor(position.thesis?.status)}`}>
              {thesisStatusLabel(position.thesis?.status)}
            </span>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{position.security.name}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{position.security.sector}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rp {(position.currentPrice || 0).toLocaleString('id-ID')}
          </p>
          <p className={`text-sm font-medium ${position.unrealizedPLPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {position.unrealizedPLPercent >= 0 ? '+' : ''}{position.unrealizedPLPercent.toFixed(2)}%
          </p>
          <Link
            href={`/stocks/${tickerUpper}/fundamental`}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Lihat Fundamental →
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Nilai Posisi"
          value={fmt(position.currentValue)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Modal"
          value={fmt(position.totalCost)}
          icon={<Target className="h-5 w-5" />}
        />
        <MetricCard
          title="Unrealized P/L"
          value={fmt(position.unrealizedPL)}
          change={position.unrealizedPLPercent}
          icon={position.unrealizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Jumlah Lot"
          value={position.quantity}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      {/* Position Details */}
      <Card>
        <CardHeader title="Detail Posisi" description="Informasi posisi saham Anda" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Cost</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Rp {(position.averageCost || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Harga Saat Ini</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Rp {(position.currentPrice || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {position.quantity} lot ({position.quantity * 100} lembar)
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Portofolio</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {position.portfolio.name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Broker</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {position.portfolio.broker || '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thesis Section */}
      <Card>
        <CardHeader
          title="Investment Thesis"
          description="Alasan investasi dan bukti pendukung"
          action={
            <Link
              href={`/stocks/${tickerUpper}/thesis`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Edit Tesis →
            </Link>
          }
        />
        <CardContent>
          {position.thesis ? (
            <div className="space-y-6">
              {/* Thesis Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ringkasan Tesis</h4>
                <p className="text-gray-900 dark:text-gray-100">{position.thesis.summary}</p>
              </div>

              {/* Thesis Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alasan Investasi</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{position.thesis.reason}</p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horizon</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{position.thesis.horizon}</p>
                </div>
              </div>

              {position.thesis.catalyst && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Katalis</h5>
                  <p className="text-sm text-blue-800 dark:text-blue-400">{position.thesis.catalyst}</p>
                </div>
              )}

              {position.thesis.risks && (
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
                  <h5 className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-2">Risiko</h5>
                  <p className="text-sm text-orange-800 dark:text-orange-400">{position.thesis.risks}</p>
                </div>
              )}

              {position.thesis.invalidation && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                  <h5 className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">Kondisi Invalidasi</h5>
                  <p className="text-sm text-red-800 dark:text-red-400">{position.thesis.invalidation}</p>
                </div>
              )}

              {/* Evidence */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Supporting Evidence */}
                <div>
                  <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Bukti Pendukung ({supportingEvidence.length})
                  </h5>
                  {supportingEvidence.length > 0 ? (
                    <div className="space-y-2">
                      {supportingEvidence.map((ev) => (
                        <div key={ev.id} className="rounded-lg border border-green-200 dark:border-green-800 p-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ev.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ev.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{ev.source}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              ev.impact === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              ev.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {ev.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada bukti pendukung</p>
                  )}
                </div>

                {/* Contradicting Evidence */}
                <div>
                  <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Bukti Penentang ({contradictingEvidence.length})
                  </h5>
                  {contradictingEvidence.length > 0 ? (
                    <div className="space-y-2">
                      {contradictingEvidence.map((ev) => (
                        <div key={ev.id} className="rounded-lg border border-red-200 dark:border-red-800 p-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ev.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ev.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{ev.source}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              ev.impact === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              ev.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {ev.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada bukti penentang</p>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Dibuat: {position.thesis.createdAt.toLocaleDateString('id-ID')}
                </span>
                <span>Confidence: {position.thesis.confidence}</span>
                <span>Version: {position.thesis.version}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada tesis untuk saham ini</p>
              <Link
                href={`/stocks/${tickerUpper}/thesis`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Buat Tesis Sekarang
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
