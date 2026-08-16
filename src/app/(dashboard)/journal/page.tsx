import { Card, CardHeader, CardContent } from '@/components/Card'
import { BookOpen, Plus, Filter } from 'lucide-react'

const mockJournalEntries = [
  {
    id: '1',
    type: 'DECISION',
    title: 'Menambah Posisi BBRI',
    content: 'Menambah 10 lot BBRI di harga 5.600. Alasan: Valuasi menarik setelah koreksi, fundamental tetap kuat, NPL ratio membaik.',
    ticker: 'BBRI',
    action: 'ADD',
    emotion: 'Percaya Diri',
    confidence: 'TINGGI',
    date: '15 Agu 2026'
  },
  {
    id: '2',
    type: 'REVIEW',
    title: 'Review Tesis TLKM',
    content: 'Tesis masih utuh meskipun harga turun. Penurunan lebih karena sentimen pasar, bukan perubahan fundamental. Kompetisi memang meningkat, tetapi market share TLKM tetap dominan.',
    ticker: 'TLKM',
    date: '12 Agu 2026'
  },
  {
    id: '3',
    type: 'REFLECTION',
    title: 'Evaluasi Keputusan Jual ASII',
    content: 'Menjual ASII di harga 5.000 ternyata tepat. Harga turun 10% setelahnya. Alasan jual: siklus otomotif memuncak, valuasi sudah mahal. Pelajaran: lebih disiplin mengambil profit di siklus.',
    ticker: 'ASII',
    action: 'SELL',
    emotion: 'Puas',
    confidence: 'TINGGI',
    date: '10 Agu 2026'
  }
]

export default function JournalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Jurnal Investasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Catat keputusan, refleksi, dan pembelajaran investasi Anda</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Catatan Baru
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">12</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Catatan Bulan Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-2">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">75%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keputusan Tepat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-50 dark:bg-purple-900/20 p-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">5</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pembelajaran</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader 
          title="Catatan Terbaru" 
          description="Keputusan dan refleksi investasi"
          action={
            <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          }
        />
        <CardContent>
          <div className="space-y-4">
            {mockJournalEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          entry.type === 'DECISION'
                            ? 'bg-blue-100 text-blue-800'
                            : entry.type === 'REVIEW'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {entry.type === 'DECISION' ? 'Keputusan' : entry.type === 'REVIEW' ? 'Review' : 'Refleksi'}
                      </span>
                      {entry.ticker && (
                        <span className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {entry.ticker}
                        </span>
                      )}
                      {entry.action && (
                        <span className="text-xs text-gray-500">{entry.action}</span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{entry.content}</p>
                    <div className="mt-3 flex items-center gap-4">
                      {entry.emotion && (
                        <div>
                          <p className="text-xs text-gray-500">Emosi</p>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{entry.emotion}</p>
                        </div>
                      )}
                      {entry.confidence && (
                        <div>
                          <p className="text-xs text-gray-500">Kepercayaan Diri</p>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{entry.confidence}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Tanggal</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{entry.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Pola Keputusan" description="Analisis pola dari jurnal Anda" />
        <CardContent>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Insight:</strong> Anda cenderung membuat keputusan beli saat harga turun (contrarian). 
              80% dari keputusan beli Anda dilakukan setelah koreksi &gt;5%. Keputusan ini memiliki tingkat keberhasilan 75%.
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Distribusi Tipe Catatan</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Keputusan</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Review</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Refleksi</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">20%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Tingkat Keberhasilan</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Keputusan Beli</span>
                  <span className="text-sm font-medium text-green-600">75% tepat</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Keputusan Jual</span>
                  <span className="text-sm font-medium text-green-600">80% tepat</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
