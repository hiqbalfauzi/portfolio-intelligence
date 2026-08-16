import { Card, CardHeader, CardContent } from '@/components/Card'
import { Bell, Check, X, Filter } from 'lucide-react'

const mockAlerts = [
  {
    id: '1',
    type: 'THESIS',
    priority: 'REVIEW',
    title: 'Margin BBRI Menurun',
    message: 'Margin laba bersih Q3 turun dari 35% menjadi 32%. Hal ini berkaitan dengan asumsi tesis "margin stabil di atas 34%".',
    ticker: 'BBRI',
    time: '2 jam lalu',
    isRead: false
  },
  {
    id: '2',
    type: 'PRICE',
    priority: 'CRITICAL',
    title: 'Penurunan Harga Signifikan',
    message: 'TLKM turun 5.2% hari ini dengan volume 2x rata-rata. Berita: Kompetisi intensif di segmen mobile.',
    ticker: 'TLKM',
    time: '5 jam lalu',
    isRead: false
  },
  {
    id: '3',
    type: 'NEWS',
    priority: 'INFO',
    title: 'Berita Positif BBCA',
    message: 'BBCA mengumumkan ekspansi digital banking. Potensi peningkatan fee-based income di 2026.',
    ticker: 'BBCA',
    time: '1 hari lalu',
    isRead: true
  },
  {
    id: '4',
    type: 'FUNDAMENTAL',
    priority: 'REVIEW',
    title: 'Laporan Keuangan Baru',
    message: 'ASII telah merilis laporan keuangan Q3 2025. Laba bersih tumbuh 8% YoY.',
    ticker: 'ASII',
    time: '2 hari lalu',
    isRead: true
  }
]

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi dan peringatan untuk portofolio Anda</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-50 p-2">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">2</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alert Baru</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-50 dark:bg-yellow-900/20 p-2">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">2</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Perlu Ditinjau</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">8</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Alert (7 hari)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Alert Terbaru" description="Notifikasi berdasarkan prioritas" />
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                  alert.isRead ? 'bg-white' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          alert.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : alert.priority === 'REVIEW'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.priority === 'CRITICAL' ? 'Kritis' : alert.priority === 'REVIEW' ? 'Perlu Ditinjau' : 'Info'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{alert.type}</span>
                      {alert.ticker && (
                        <span className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {alert.ticker}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{alert.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{alert.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Pengaturan Alert" description="Kelola preferensi notifikasi" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifikasi Email</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kirim alert kritis dan perlu ditinjau via email</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Quiet Hours</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Jangan kirim notifikasi antara 22:00 - 06:00</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform"></span>
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Jenis Alert yang Dipantau</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Harga ✓
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Fundamental ✓
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Berita ✓
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Tesis ✓
                </span>
                <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-800">
                  Teknikal
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
