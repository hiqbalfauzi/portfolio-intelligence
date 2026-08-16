import { Card, CardHeader, CardContent } from '@/components/Card'
import { Brain, MessageSquare, Sparkles } from 'lucide-react'

export default function AIAnalystPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analyst</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tanya jawab dengan AI tentang portofolio dan investasi Anda</p>
      </div>

      <Card>
        <CardContent className="py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Halo! Saya AI Analyst Anda</h2>
              <p className="mt-2 text-sm text-gray-600">
                Saya dapat membantu menganalisis portofolio, mengevaluasi tesis investasi, dan memberikan insight berdasarkan data terkini.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Contoh Pertanyaan</p>
                    <div className="mt-3 space-y-2">
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                        Apakah tesis investasi saya untuk BBCA masih valid?
                      </button>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                        Apa risiko terbesar dalam portofolio saya saat ini?
                      </button>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                        Bandingkan performa BBRI dengan peer-nya di sektor perbankan
                      </button>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                        Apakah ada berita material untuk saham yang saya miliki minggu ini?
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
                <button className="absolute bottom-3 right-3 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700">
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-900">
                  <strong>Catatan:</strong> AI Analyst menggunakan data dari portofolio, laporan keuangan, berita, dan analisis teknikal. 
                  Semua jawaban disertai sumber dan tingkat kepercayaan. AI tidak memberikan rekomendasi beli/jual, hanya analisis objektif.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Berdasarkan Data</h3>
              <p className="mt-2 text-xs text-gray-600">
                Semua analisis berdasarkan data aktual dari laporan keuangan, berita, dan market data
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Dengan Sumber</h3>
              <p className="mt-2 text-xs text-gray-600">
                Setiap klaim disertai sumber dan tanggal data untuk verifikasi
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Dua Sisi</h3>
              <p className="mt-2 text-xs text-gray-600">
                Menampilkan bull case dan bear case untuk analisis yang seimbang
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
