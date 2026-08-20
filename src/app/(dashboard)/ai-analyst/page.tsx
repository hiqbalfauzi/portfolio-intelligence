'use client'

import { useState, useEffect, type ReactNode, Fragment } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { Brain, Send, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{
    id: string
    title: string
    source: string
    url?: string
    date: string
  }>
  confidence?: 'TINGGI' | 'SEDANG' | 'RENDAH'
  dataFreshness?: string
  feedback?: 'correct' | 'incorrect' | 'incomplete' | 'irrelevant'
}

interface BriefStock {
  ticker: string
  name: string
  sector: string
  lastPrice: number | null
  unrealizedPLPercent: number
  currentValue: number
  brief: { content: string; confidence: string; date: string; generatedAt: string } | null
}

export default function AIAnalystPage() {
  const [briefs, setBriefs] = useState<BriefStock[]>([])
  const [briefsLoading, setBriefsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadBriefs = () =>
    fetch('/api/ai/briefs')
      .then(async res => {
        const json = await res.json()
        if (res.ok) setBriefs(json.stocks || [])
      })
      .catch(() => {})
      .finally(() => setBriefsLoading(false))

  useEffect(() => { loadBriefs() }, [])

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    const prevSnapshot = JSON.stringify(briefs.map(s => s.brief?.content))
    try {
      const res = await fetch('/api/ai/briefs/refresh', { method: 'POST' })
      if (!res.ok) throw new Error('Gagal memulai refresh')
      // Generation takes ~5 min (rate limit 2 req/menit). Poll until briefs change.
      const started = Date.now()
      const poll = setInterval(async () => {
        const json = await fetch('/api/ai/briefs').then(r => r.json()).catch(() => null)
        if (!json) return
        setBriefs(json.stocks || [])
        const changed = JSON.stringify((json.stocks || []).map((s: BriefStock) => s.brief?.content)) !== prevSnapshot
        if (changed || Date.now() - started > 8 * 60_000) {
          clearInterval(poll)
          setRefreshing(false)
        }
      }, 20_000)
    } catch {
      setRefreshing(false)
    }
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya AI Analyst Anda. Saya dapat membantu menganalisis portofolio, saham, tesis investasi, dan memberikan insight berdasarkan data yang tersedia. Apa yang ingin Anda tanyakan hari ini?',
      confidence: 'TINGGI',
      dataFreshness: '17 Agu 2026, 16:00 WIB'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = [...messages, userMessage]
        .filter(m => m.role === 'user' || m.content)
        .map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, history: history.slice(0, -1) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      const confMatch = /Confidence:\s*(TINGGI|SEDANG|RENDAH)/i.exec(data.content)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        citations: data.citations || [],
        confidence: (confMatch?.[1]?.toUpperCase() as Message['confidence']) || 'SEDANG',
        dataFreshness: new Date(data.dataFreshness).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Gagal memproses: ${e instanceof Error ? e.message : String(e)}`,
        confidence: 'RENDAH',
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: Message['feedback']) => {
    const idx = messages.findIndex(m => m.id === messageId)
    const msg = messages[idx]
    if (!msg) return
    // AI-09: persist feedback — cari pertanyaan user terdekat sebelumnya
    const question = [...messages.slice(0, idx)].reverse().find(m => m.role === 'user')?.content ?? ''
    fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer: msg.content, feedback }),
    }).catch(() => {})
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m))
  }

  // Replace [cN] markers with hoverable superscript chips
  const renderCitations = (node: ReactNode, citations?: Message['citations']): ReactNode => {
    if (typeof node === 'string') {
      const parts = node.split(/\[(c\d+)\]/)
      if (parts.length === 1) return node
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          const c = citations?.find(x => x.id === part)
          return (
            <sup
              key={i}
              title={c ? `${c.title} — ${c.source} (${c.date})` : part}
              className="inline-flex items-center justify-center min-w-[1.4rem] h-4 px-0.5 ml-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] font-semibold cursor-help align-super"
            >
              {part}
            </sup>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })
    }
    if (Array.isArray(node)) return node.map((n, i) => <Fragment key={i}>{renderCitations(n, citations)}</Fragment>)
    return node
  }

  const mdComponents = (citations?: Message['citations']) => ({
    p: ({ children }: { children?: ReactNode }) => <p className="mb-2 last:mb-0 leading-relaxed">{renderCitations(children, citations)}</p>,
    ul: ({ children }: { children?: ReactNode }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
    ol: ({ children }: { children?: ReactNode }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
    li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{renderCitations(children, citations)}</li>,
    strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-gray-900 dark:text-gray-50">{renderCitations(children, citations)}</strong>,
    h1: ({ children }: { children?: ReactNode }) => <h3 className="font-bold text-sm mt-3 mb-1.5 text-gray-900 dark:text-gray-50">{renderCitations(children, citations)}</h3>,
    h2: ({ children }: { children?: ReactNode }) => <h3 className="font-bold text-sm mt-3 mb-1.5 text-gray-900 dark:text-gray-50">{renderCitations(children, citations)}</h3>,
    h3: ({ children }: { children?: ReactNode }) => <h4 className="font-semibold text-sm mt-3 mb-1 text-gray-900 dark:text-gray-50">{renderCitations(children, citations)}</h4>,
    blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 my-2 text-gray-600 dark:text-gray-400">{children}</blockquote>,
    hr: () => <hr className="my-3 border-gray-200 dark:border-gray-700" />,
  })

  const confidenceStyle: Record<string, string> = {
    TINGGI: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    SEDANG: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    RENDAH: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analyst</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tanyakan apa saja tentang portofolio dan investasi Anda</p>
      </div>

      {/* Daily Briefs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Brief Harian Pra-Market
          </h2>
          <div className="flex items-center gap-3">
            {briefs[0]?.brief && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Diperbarui {new Date(briefs[0].brief.generatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh harga & generate ulang brief (±5 menit)"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Memperbarui...' : 'Refresh'}
            </button>
          </div>
        </div>
        {briefsLoading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4">Memuat brief...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {briefs.map((s) => (
              <Card key={s.ticker} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link href={`/stocks/${s.ticker}`} className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                        {s.ticker}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">{s.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {s.lastPrice != null ? s.lastPrice.toLocaleString('id-ID') : '-'}
                      </p>
                      <p className={`text-xs font-medium ${s.unrealizedPLPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {s.unrealizedPLPercent >= 0 ? '+' : ''}{s.unrealizedPLPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  {s.brief ? (
                    <>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <ReactMarkdown components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 mb-1.5">{children}</ul>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-800 dark:text-gray-200">{children}</strong>,
                        }}>
                          {s.brief.content.replace(/\s*Confidence:\s*(TINGGI|SEDANG|RENDAH)\.?/i, '')}
                        </ReactMarkdown>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          s.brief.confidence === 'TINGGI' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                          : s.brief.confidence === 'RENDAH' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {s.brief.confidence}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(s.brief.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2">Brief belum tersedia — jalankan generate-briefs.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader title="Percakapan" description="AI akan menjawab berdasarkan data portofolio Anda" />
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm">
                        <ReactMarkdown components={mdComponents(message.citations)}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Citations — compact footnote list */}
                    {message.citations && message.citations.length > 0 && (
                      <details className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300">
                          {message.citations.length} sumber data
                        </summary>
                        <div className="mt-2 space-y-1">
                          {message.citations.map((citation) => (
                            <div key={citation.id} className="flex items-baseline gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="shrink-0 font-mono text-blue-600 dark:text-blue-400">{citation.id}</span>
                              <span>
                                {citation.title} — {citation.source} ({citation.date})
                                {citation.url && (
                                  <> · <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">buka</a></>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Confidence and Freshness */}
                    {message.role === 'assistant' && (
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {message.confidence && (
                          <span className={`px-2 py-0.5 rounded-full font-medium ${confidenceStyle[message.confidence] || ''}`}>
                            Confidence: {message.confidence}
                          </span>
                        )}
                        {message.dataFreshness && (
                          <span>Data per: {message.dataFreshness}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback buttons */}
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleFeedback(message.id, 'correct')}
                        className={`p-1 rounded ${
                          message.feedback === 'correct'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title="Jawaban benar"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'incorrect')}
                        className={`p-1 rounded ${
                          message.feedback === 'incorrect'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title="Jawaban salah"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'incomplete')}
                        className={`px-2 py-1 text-xs rounded ${
                          message.feedback === 'incomplete'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        Kurang lengkap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanyakan tentang portofolio, saham, atau tesis investasi..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Tentang AI Analyst</p>
              <p>
                AI Analyst membantu Anda menganalisis portofolio dan investasi berdasarkan data yang tersedia. 
                Semua jawaban dilengkapi dengan sumber dan tingkat kepercayaan. AI tidak memberikan rekomendasi 
                beli/jual, tetapi membantu Anda memahami data dan membuat keputusan yang lebih terinformasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
