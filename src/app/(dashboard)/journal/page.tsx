import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { JournalEntryForm, DeleteButton } from '@/components/JournalForm'
import { redirect } from 'next/navigation'
import { BookOpen, TrendingUp, Brain } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [entries, securities] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.security.findMany({
      where: { positions: { some: { isActive: true } } },
      orderBy: { ticker: 'asc' },
      select: { id: true, ticker: true },
    }),
  ])

  const tickerById = new Map(securities.map(s => [s.id, s.ticker]))

  const typeColor = (type: string) => {
    switch (type) {
      case 'DECISION': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'REVIEW': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'REFLECTION': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }
  const typeLabel = (type: string) =>
    ({ DECISION: 'Keputusan', REVIEW: 'Tinjauan', REFLECTION: 'Refleksi' } as Record<string, string>)[type] || 'Catatan'
  const actionColor = (action?: string | null) => {
    switch (action) {
      case 'BUY': case 'ADD': return 'text-green-600 dark:text-green-400'
      case 'SELL': return 'text-red-600 dark:text-red-400'
      case 'REDUCE': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }
  const fmt = (date: Date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const decisionCount = entries.filter(e => e.type === 'DECISION').length
  const reflectionCount = entries.filter(e => e.type === 'REFLECTION').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jurnal Investasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Catat keputusan, alasan, ekspektasi, dan emosi — lalu evaluasi nanti</p>
        </div>
        <JournalEntryForm tickers={securities.map(s => s.ticker)} />
      </div>

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

      <Card>
        <CardHeader title="Catatan Terbaru" description="Riwayat keputusan dan refleksi investasi" />
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${typeColor(entry.type)}`}>{typeLabel(entry.type)}</span>
                      {entry.action && <span className={`text-xs font-medium ${actionColor(entry.action)}`}>{entry.action}</span>}
                      {entry.securityId && tickerById.get(entry.securityId) && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {tickerById.get(entry.securityId)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{fmt(entry.createdAt)}</span>
                    </div>
                    <DeleteButton id={entry.id} />
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{entry.content}</p>

                  {entry.reasoning && (
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 mb-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Alasan</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.reasoning}</p>
                    </div>
                  )}
                  {entry.expectations && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 mb-2">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Ekspektasi</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{entry.expectations}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {entry.emotion && <span>Emosi: <span className="font-medium">{entry.emotion}</span></span>}
                    {entry.reviewDate && <span>Review: {fmt(entry.reviewDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Belum ada catatan jurnal</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Mulai catat keputusan dan refleksi investasi Anda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
