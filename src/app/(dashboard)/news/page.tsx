import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { RefreshNewsButton } from '@/components/RefreshNewsButton'
import { redirect } from 'next/navigation'
import { Newspaper, ExternalLink, Database } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const articles = await prisma.newsArticle.findMany({
    where: { securities: { some: { security: { positions: { some: { isActive: true } } } } } },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    include: { securities: { include: { security: { select: { ticker: true } } } } },
  })

  const sentimentBadge = (s: string | null) => {
    switch (s) {
      case 'POSITIVE': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'NEGATIVE': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
  }
  const sentimentLabel = (s: string | null) =>
    ({ POSITIVE: 'Positif', NEGATIVE: 'Negatif', NEUTRAL: 'Netral' } as Record<string, string>)[s ?? ''] || 'Belum diklasifikasi'
  const materialityBadge = (m: string | null) => {
    switch (m) {
      case 'HIGH': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    }
  }

  const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const lastFetched = articles.length > 0 ? articles.reduce((a, b) => (a.fetchedAt > b.fetchedAt ? a : b)).fetchedAt : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">News & Sentiment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Berita saham portofolio dari Google News, diklasifikasi AI (sentimen & materialitas)
          </p>
        </div>
        <RefreshNewsButton />
      </div>

      {lastFetched && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
          <Database className="h-3.5 w-3.5" />
          <span>
            Sumber: Google News RSS · Pengambilan terakhir: {lastFetched.toLocaleString('id-ID')} · Klasifikasi sentimen oleh AI — bisa salah, cek sumber asli.
          </span>
        </div>
      )}

      <Card>
        <CardHeader title="Berita Terbaru" description={`${articles.length} artikel (30 hari terakhir)`} />
        <CardContent>
          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map(a => (
                <div key={a.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <a
                        href={a.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-start gap-1.5"
                      >
                        <Newspaper className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                        {a.title}
                        <ExternalLink className="h-3 w-3 mt-1 shrink-0 text-gray-400" />
                      </a>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {a.securities.map(s => (
                          <span key={s.securityId} className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                            {s.security.ticker}
                          </span>
                        ))}
                        <span className={`text-xs px-2 py-0.5 rounded ${sentimentBadge(a.sentiment)}`}>{sentimentLabel(a.sentiment)}</span>
                        {a.materiality && (
                          <span className={`text-xs px-2 py-0.5 rounded ${materialityBadge(a.materiality)}`}>Materialitas {a.materiality}</span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">{a.source} · {fmtDate(a.publishedAt)}</span>
                      </div>
                      {/* NEWS-06: alasan klasifikasi sentimen */}
                      {a.sentimentReason && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                          Alasan klasifikasi: {a.sentimentReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Belum ada berita</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Klik &quot;Refresh Berita&quot; untuk mengambil berita terbaru</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
