import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { WatchlistClient } from './WatchlistClient'

export const dynamic = 'force-dynamic'

export default async function WatchlistPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const items = await prisma.watchlistItem.findMany({
    where: { userId: user.userId, isActive: true },
    include: { security: true },
    orderBy: { addedAt: 'desc' },
  })

  return (
    <WatchlistClient
      items={items.map(i => ({
        id: i.id,
        ticker: i.security.ticker,
        name: i.security.name,
        sector: i.security.sector,
        lastPrice: i.security.lastPrice,
        lastUpdate: i.security.lastUpdate?.toISOString() ?? null,
        addedAt: i.addedAt.toISOString(),
        notes: i.notes,
        targetPrice: i.targetPrice,
        stopLoss: i.stopLoss,
        thesisDraft: i.thesisDraft,
      }))}
    />
  )
}
