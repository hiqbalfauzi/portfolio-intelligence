import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { Shield, AlertTriangle, TrendingDown, PieChart } from 'lucide-react'

export default function RiskCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Risk Center</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analisis risiko dan metrik portofolio Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Konsentrasi Tertinggi"
          value="14.4%"
          changeLabel="TLKM"
          icon={<PieChart className="h-5 w-5" />}
        />
        <MetricCard
          title="Volatilitas Portofolio"
          value="18.5%"
          change={-2.1}
          changeLabel="vs bulan lalu"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Max Drawdown"
          value="-8.2%"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <MetricCard
          title="Risk Score"
          value="Moderat"
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Konsentrasi Portofolio" description="Alokasi per saham dan sektor" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">Top 5 Saham</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">TLKM</span>
                      <span className="text-xs text-gray-500">Telekomunikasi</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">14.4%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '14.4%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">BBRI</span>
                      <span className="text-xs text-gray-500">Keuangan</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">9.3%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '9.3%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">BBCA</span>
                      <span className="text-xs text-gray-500">Keuangan</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">8.2%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '8.2%' }}></div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900">Per Sektor</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Keuangan</span>
                    <span className="text-sm font-medium text-gray-900">45.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Telekomunikasi</span>
                    <span className="text-sm font-medium text-gray-900">14.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Konsumer</span>
                    <span className="text-sm font-medium text-gray-900">12.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Stress Test" description="Simulasi dampak penurunan harga" />
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Skenario: Penurunan 20%</p>
                    <p className="mt-1 text-xs text-red-700">
                      Jika seluruh posisi turun 20%, portofolio Anda akan kehilangan Rp 25.000.000
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-xs text-red-700">Kerugian</p>
                        <p className="text-sm font-semibold text-red-900">-Rp 25.000.000</p>
                      </div>
                      <div>
                        <p className="text-xs text-red-700">Portofolio Baru</p>
                        <p className="text-sm font-semibold text-red-900">Rp 100.000.000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Posisi Paling Terdampak</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">TLKM</p>
                      <p className="text-xs text-gray-600">Nilai: Rp 18.000.000</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">-Rp 3.600.000</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">BBRI</p>
                      <p className="text-xs text-gray-600">Nilai: Rp 11.600.000</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">-Rp 2.320.000</span>
                  </div>
                </div>
              </div>

              <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Kustomisasi Skenario
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Eksposur Risiko" description="Faktor makro dan sektoral" />
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Suku Bunga</p>
              <p className="mt-1 text-sm text-gray-700">
                65% portofolio sensitif terhadap kenaikan suku bunga (perbankan, properti)
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Kurs USD/IDR</p>
              <p className="mt-1 text-sm text-gray-700">
                20% portofolio memiliki eksposur terhadap fluktuasi kurs
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Komoditas</p>
              <p className="mt-1 text-sm text-gray-700">
                15% portofolio terpengaruh harga komoditas (batu bara, CPO)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
