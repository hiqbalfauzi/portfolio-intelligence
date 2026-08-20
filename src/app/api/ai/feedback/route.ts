import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const VALID = ['correct', 'incorrect', 'incomplete', 'irrelevant']

// POST /api/ai/feedback — AI-09: simpan feedback jawaban AI
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { question, answer, feedback } = body

  if (!question || !answer || !feedback) {
    return NextResponse.json({ error: 'question, answer, feedback wajib diisi' }, { status: 400 })
  }
  if (!VALID.includes(feedback)) {
    return NextResponse.json({ error: `feedback harus salah satu: ${VALID.join(', ')}` }, { status: 400 })
  }

  const item = await prisma.aIFeedback.create({
    data: { userId: user.userId, question, answer, feedback },
  })
  return NextResponse.json({ item }, { status: 201 })
}

// GET /api/ai/feedback — riwayat feedback user
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.aIFeedback.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ items })
}
