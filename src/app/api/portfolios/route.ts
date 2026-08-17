import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.userId, isActive: true },
    select: { id: true, name: true, broker: true },
  })
  return NextResponse.json({ portfolios })
}
