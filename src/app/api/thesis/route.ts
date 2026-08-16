import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/thesis?positionId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const positionId = searchParams.get('positionId')
  const thesisId = searchParams.get('thesisId')
  const ticker = searchParams.get('ticker')

  if (thesisId) {
    const thesis = await prisma.thesis.findUnique({
      where: { id: thesisId },
      include: {
        security: true,
        evidence: {
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    })
    return NextResponse.json({ thesis })
  }

  if (positionId) {
    const thesis = await prisma.thesis.findFirst({
      where: { positionId },
      include: {
        security: true,
        evidence: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    return NextResponse.json({ thesis })
  }

  if (ticker) {
    const thesis = await prisma.thesis.findFirst({
      where: { security: { ticker } },
      include: {
        security: true,
        evidence: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    return NextResponse.json({ thesis })
  }

  return NextResponse.json({ error: 'positionId, thesisId, or ticker required' }, { status: 400 })
}

// POST /api/thesis - Create new thesis
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Resolve securityId and positionId from ticker if not provided
  let securityId = body.securityId
  let positionId = body.positionId

  if (!securityId && body.ticker) {
    const security = await prisma.security.findUnique({ where: { ticker: body.ticker } })
    if (!security) return NextResponse.json({ error: 'Security not found' }, { status: 404 })
    securityId = security.id

    if (!positionId) {
      const position = await prisma.position.findFirst({
        where: { securityId, isActive: true },
      })
      if (position) positionId = position.id
    }
  }

  if (!securityId) return NextResponse.json({ error: 'securityId or ticker required' }, { status: 400 })

  const thesis = await prisma.thesis.create({
    data: {
      positionId,
      securityId,
      title: body.title,
      summary: body.summary,
      reason: body.reason,
      horizon: body.horizon,
      catalyst: body.catalyst,
      risks: body.risks,
      invalidation: body.invalidation,
      status: 'UTUH',
      confidence: 'SEDANG',
      version: 1,
    },
    include: { security: true },
  })

  // Create initial version
  await prisma.thesisVersion.create({
    data: {
      thesisId: thesis.id,
      version: 1,
      title: thesis.title,
      summary: thesis.summary,
      reason: thesis.reason,
      horizon: thesis.horizon,
      catalyst: thesis.catalyst,
      risks: thesis.risks,
      invalidation: thesis.invalidation,
      status: thesis.status,
      confidence: thesis.confidence,
      changeNotes: 'Thesis created',
    },
  })

  return NextResponse.json(thesis, { status: 201 })
}

// PUT /api/thesis - Update thesis
export async function PUT(request: NextRequest) {
  const body = await request.json()

  const existing = await prisma.thesis.findUnique({
    where: { id: body.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Thesis not found' }, { status: 404 })
  }

  const newVersion = existing.version + 1

  const thesis = await prisma.thesis.update({
    where: { id: body.id },
    data: {
      title: body.title,
      summary: body.summary,
      reason: body.reason,
      horizon: body.horizon,
      catalyst: body.catalyst,
      risks: body.risks,
      invalidation: body.invalidation,
      status: body.status,
      confidence: body.confidence,
      version: newVersion,
      updatedAt: new Date(),
    },
  })

  // Create new version
  await prisma.thesisVersion.create({
    data: {
      thesisId: thesis.id,
      version: newVersion,
      title: thesis.title,
      summary: thesis.summary,
      reason: thesis.reason,
      horizon: thesis.horizon,
      catalyst: thesis.catalyst,
      risks: thesis.risks,
      invalidation: thesis.invalidation,
      status: thesis.status,
      confidence: thesis.confidence,
      changeNotes: body.changeNotes || 'Thesis updated',
    },
  })

  return NextResponse.json(thesis)
}
