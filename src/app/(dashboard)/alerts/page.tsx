import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { AlertsManager } from '@/components/AlertsManager'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [rules, events, securities] = await Promise.all([
    prisma.alertRule.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.alertEvent.findMany({
      where: { rule: { userId: user.userId } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { rule: { select: { name: true, priority: true } } },
    }),
    prisma.security.findMany({
      where: { positions: { some: { isActive: true } } },
      orderBy: { ticker: 'asc' },
      select: { id: true, ticker: true },
    }),
  ])

  const tickerById = new Map(securities.map(s => [s.id, s.ticker]))
  const rulesWithTicker = rules.map(r => ({ ...r, ticker: r.securityId ? tickerById.get(r.securityId) : undefined }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alerts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Buat aturan alert harga, volume, teknikal, dan tesis. Alert tidak menyatakan beli/jual — hanya pemicu untuk meninjau.
        </p>
      </div>
      <AlertsManager
        rules={rulesWithTicker as never}
        events={events as never}
        tickers={securities.map(s => s.ticker)}
      />
    </div>
  )
}
