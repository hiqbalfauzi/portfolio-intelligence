import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/thesis/evidence - Add evidence
export async function POST(request: NextRequest) {
  const body = await request.json()

  const evidence = await prisma.thesisEvidence.create({
    data: {
      thesisId: body.thesisId,
      type: body.type, // SUPPORTING, CONTRADICTING, NEUTRAL
      source: body.source, // NEWS, FINANCIAL_DATA, DISCLOSURE, TECHNICAL, OTHER
      sourceId: body.sourceId,
      title: body.title,
      description: body.description,
      impact: body.impact, // HIGH, MEDIUM, LOW
      relevance: body.relevance, // DIRECT, INDIRECT
      aiAnalysis: body.aiAnalysis,
      confidence: body.confidence || 'SEDANG',
    },
  })

  return NextResponse.json(evidence, { status: 201 })
}

// DELETE /api/thesis/evidence
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const evidenceId = searchParams.get('id')

  if (!evidenceId) {
    return NextResponse.json({ error: 'Evidence ID required' }, { status: 400 })
  }

  await prisma.thesisEvidence.delete({
    where: { id: evidenceId },
  })

  return NextResponse.json({ success: true })
}
