import { Card, CardHeader, CardContent } from '@/components/Card'
import { Settings as SettingsIcon, User, Bell, Database, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pengaturan dashboard dan preferensi Anda</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Profil Investasi" description="Pengaturan preferensi investasi Anda" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horizon Investasi</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Jangka Panjang (&gt; 1 tahun)</option>
                    <option>Jangka Menengah (3-12 bulan)</option>
                    <option>Jangka Pendek (&lt; 3 bulan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Toleransi Risiko</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Konservatif</option>
                    <option>Moderat</option>
                    <option>Agresif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Benchmark</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>IHSG</option>
                    <option>LQ45</option>
                    <option>Jakarta Islamic Index</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gaya Analisis</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Fundamental</option>
                    <option>Teknikal</option>
                    <option>Seimbang</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Preferensi Umum" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mata Uang</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>IDR - Rupiah Indonesia</option>
                    <option>USD - Dolar Amerika</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zona Waktu</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>WIB (UTC+7)</option>
                    <option>WITA (UTC+8)</option>
                    <option>WIT (UTC+9)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bahasa</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Notifikasi" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifikasi Email</p>
                    <p className="text-xs text-gray-500">Kirim ringkasan harian dan alert kritis via email</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifikasi Telegram</p>
                    <p className="text-xs text-gray-500">Kirim alert via Telegram bot</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform"></span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frekuensi Ringkasan</label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Harian</option>
                    <option>Mingguan</option>
                    <option>Tidak pernah</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Akun" />
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">user@example.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bergabung Sejak</p>
                  <p className="text-sm text-gray-600">1 Januari 2026</p>
                </div>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Ubah Password
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Data & Privasi" />
            <CardContent>
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Ekspor Data
                </button>
                <button className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                  Hapus Akun
                </button>
                <p className="text-xs text-gray-500">
                  Menghapus akun akan menghapus semua data portofolio, tesis, dan jurnal Anda secara permanen.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Sumber Data" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">IDX</p>
                    <p className="text-xs text-gray-500">Keterbukaan informasi</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">RTI</p>
                    <p className="text-xs text-gray-500">Data harga & volume</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Media Berita</p>
                    <p className="text-xs text-gray-500">5 sumber aktif</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Aktif
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
