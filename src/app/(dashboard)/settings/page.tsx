import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { User, Settings as SettingsIcon, TrendingUp, Shield, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await prisma.user.findFirst({
    include: {
      preferences: true,
      portfolios: {
        include: {
          _count: {
            select: { positions: { where: { isActive: true } } }
          }
        }
      },
    },
  })

  const preferences = user?.preferences
  const portfolios = user?.portfolios || []
  const totalPositions = portfolios.reduce((sum, p) => sum + p._count.positions, 0)

  const horizonLabel = (horizon?: string) => {
    switch (horizon) {
      case 'short-term': return 'Jangka Pendek (< 1 tahun)'
      case 'medium-term': return 'Jangka Menengah (1-3 tahun)'
      case 'long-term': return 'Jangka Panjang (> 3 tahun)'
      default: return 'Belum diatur'
    }
  }

  const riskLabel = (risk?: string) => {
    switch (risk) {
      case 'conservative': return 'Konservatif'
      case 'moderate': return 'Moderat'
      case 'aggressive': return 'Agresif'
      default: return 'Belum diatur'
    }
  }

  const riskColor = (risk?: string) => {
    switch (risk) {
      case 'conservative': return 'text-green-600 dark:text-green-400'
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400'
      case 'aggressive': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-500'
    }
  }

  const analysisLabel = (style?: string) => {
    switch (style) {
      case 'fundamental': return 'Fundamental'
      case 'technical': return 'Teknikal'
      case 'balanced': return 'Seimbang'
      default: return 'Belum diatur'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola profil dan preferensi investasi Anda</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader title="Profil Pengguna" description="Informasi akun Anda" />
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {user?.name || 'Belum ada nama'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Profile */}
      <Card>
        <CardHeader title="Profil Investasi" description="Preferensi dan gaya investasi Anda" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizon Investasi</p>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {horizonLabel(preferences?.horizon)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Toleransi Risiko</p>
                </div>
                <p className={`text-lg ${riskColor(preferences?.riskTolerance)}`}>
                  {riskLabel(preferences?.riskTolerance)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Gaya Analisis</p>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {analysisLabel(preferences?.analysisStyle)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SettingsIcon className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Benchmark</p>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {preferences?.benchmark || 'IHSG'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader title="Ringkasan Portofolio" description="Statistik akun investasi Anda" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Jumlah Portofolio</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{portfolios.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Posisi Aktif</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalPositions}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mata Uang</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {preferences?.currency || 'IDR'}
              </p>
            </div>
          </div>

          {portfolios.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Daftar Portofolio</h4>
              <div className="space-y-2">
                {portfolios.map((portfolio) => (
                  <div key={portfolio.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {portfolio.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {portfolio.broker || 'Tidak ada broker'} • {portfolio._count.positions} posisi
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Aktif
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader title="Sumber Data" description="Status integrasi data" />
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Harga Saham</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Data end-of-day dari demo broker</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                Terhubung
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Berita & Sentimen</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Belum dikonfigurasi</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Belum
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Laporan Keuangan</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Belum dikonfigurasi</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Belum
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
