import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildContext } from '@/lib/ai-context'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `Anda adalah AI Analyst pendamping untuk investor ritel Indonesia (saham BEI).
Anda HANYA boleh menggunakan DATA TERSEDIA di bawah. Aturan ketat:
1. Setiap klaim faktual (angka, tanggal, status) WAJIB diikuti kutipan [cN] dari data.
2. Jangan mengarang angka yang tidak ada di data. Jika data tidak cukup, katakan "Data tidak tersedia".
3. Tunjukkan dua sisi: bukti pendukung dan bukti penentang.
4. Sebutkan tanggal/freshness data yang Anda pakai.
5. Jangan memberi kepastian harga atau janji keuntungan. Gunakan bahasa probabilistik.
6. Akhiri dengan "Confidence: TINGGI/SEDANG/RENDAH" dan alasannya singkat.
7. Jawab dalam Bahasa Indonesia, ringkas dan terstruktur.

DATA TERSEDIA:
`

interface ChatMessage { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question: string = (body.question || '').trim()
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-6) : []
    if (!question) return NextResponse.json({ error: 'question required' }, { status: 400 })

    const baseUrl = process.env.AI_BASE_URL
    const apiKey = process.env.AI_API_KEY
    const model = process.env.AI_MODEL || 'TR1/deepseek/deepseek-v4-flash-0731'
    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: 'AI_BASE_URL / AI_API_KEY belum dikonfigurasi di .env' }, { status: 500 })
    }

    const { text: context, citations } = await buildContext(prisma, question)

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + context },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: question },
    ]

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: 4000, temperature: 0.3 }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `LLM error ${res.status}: ${errText.slice(0, 200)}` }, { status: 502 })
    }
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content || ''
    if (!content.trim()) {
      return NextResponse.json({ error: 'Model mengembalikan jawaban kosong (kemungkinan max_tokens kurang atau reasoning-only response).' }, { status: 502 })
    }

    return NextResponse.json({
      content,
      citations,
      dataFreshness: new Date().toISOString(),
      model,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
