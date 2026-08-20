import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { AccountDangerZone } from '@/components/AccountDangerZone'
import { PreferencesForm } from '@/components/PreferencesForm'
import { User } from 'lucide-react'

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

      {/* Investment Profile — ACC-02/03: editable */}
      <Card>
        <CardHeader title="Profil Investasi" description="Preferensi dan gaya investasi Anda" />
        <CardContent>
          <PreferencesForm
            initial={preferences ? {
              horizon: preferences.horizon,
              riskTolerance: preferences.riskTolerance,
              benchmark: preferences.benchmark,
              analysisStyle: preferences.analysisStyle,
              currency: preferences.currency,
              emailNotifications: preferences.emailNotifications,
              quietHoursStart: preferences.quietHoursStart,
              quietHoursEnd: preferences.quietHoursEnd,
            } : null}
          />
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

      {/* ACC-04: Data Management */}
      <Card>
        <CardHeader title="Data & Akun" description="Ekspor atau hapus data Anda" />
        <CardContent>
          <AccountDangerZone />
        </CardContent>
      </Card>
    </div>
  )
}
