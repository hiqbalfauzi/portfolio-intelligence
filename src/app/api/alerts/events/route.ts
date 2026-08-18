import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/alerts/events
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const events = await prisma.alertEvent.findMany({
    where: { rule: { userId: user.userId } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { rule: { select: { name: true, priority: true } } },
  })
  return NextResponse.json({ events })
}

// PATCH /api/alerts/events — { id, isRead?, isRelevant? }
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const event = await prisma.alertEvent.findFirst({
    where: { id: body.id, rule: { userId: user.userId } },
  })
  if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
  const updated = await prisma.alertEvent.update({
    where: { id: event.id },
    data: {
      ...(body.isRead != null ? { isRead: Boolean(body.isRead) } : {}),
      ...(body.isRelevant != null ? { isRelevant: Boolean(body.isRelevant) } : {}),
    },
  })
  return NextResponse.json(updated)
}
