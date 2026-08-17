import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { BookOpen, Plus, TrendingUp, TrendingDown, Brain, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const user = await prisma.user.findFirst({
    include: {
      journalEntries: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  const entries = user?.journalEntries || []

  const typeIcon = (type: string) => {
    switch (type) {
      case 'DECISION': return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'REVIEW': return <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'REFLECTION': return <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      default: return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const typeColor = (type: string) => {
    switch (type) {
      case 'DECISION': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'REVIEW': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'REFLECTION': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case 'DECISION': return 'Keputusan'
      case 'REVIEW': return 'Tinjauan'
      case 'REFLECTION': return 'Refleksi'
      default: return 'Catatan'
    }
  }

  const actionColor = (action?: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 dark:text-green-400'
      case 'SELL': return 'text-red-600 dark:text-red-400'
      case 'HOLD': return 'text-gray-600 dark:text-gray-400'
      case 'ADD': return 'text-green-600 dark:text-green-400'
      case 'REDUCE': return 'text-orange-600 dark:text-orange-400'
      default: return ''
    }
  }

  const fmt = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Stats
  const decisionCount = entries.filter(e => e.type === 'DECISION').length
  const reflectionCount = entries.filter(e => e.type === 'REFLECTION').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jurnal Investasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Catat keputusan, refleksi, dan evaluasi investasi Anda</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Catatan Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{decisionCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keputusan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reflectionCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Refleksi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{entries.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Catatan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entries */}
      <Card>
        <CardHeader title="Catatan Terbaru" description="Riwayat keputusan dan refleksi investasi" />
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-1.5 ${typeColor(entry.type)}`}>
                        {typeIcon(entry.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${typeColor(entry.type)}`}>
                            {typeLabel(entry.type)}
                          </span>
                          {entry.action && (
                            <span className={`text-xs font-medium ${actionColor(entry.action)}`}>
                              {entry.action}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {fmt(entry.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {entry.content}
                  </p>

                  {entry.reasoning && (
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 mb-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Alasan</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.reasoning}</p>
                    </div>
                  )}

                  {entry.expectations && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Ekspektasi</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{entry.expectations}</p>
                    </div>
                  )}

                  {entry.emotion && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Emosi: <span className="font-medium">{entry.emotion}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Belum ada catatan jurnal</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Mulai catat keputusan dan refleksi investasi Anda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
