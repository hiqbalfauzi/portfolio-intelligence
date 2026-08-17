'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { Brain, Send, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react'

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

export default function AIAnalystPage() {
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input),
        citations: [
          {
            id: '1',
            title: 'Laporan Keuangan Q3 2024',
            source: 'IDX',
            url: 'https://www.idx.co.id',
            date: '15 Nov 2024'
          },
          {
            id: '2',
            title: 'Analisis Sentimen Berita',
            source: 'Media Aggregator',
            date: '17 Agu 2026'
          }
        ],
        confidence: 'SEDANG',
        dataFreshness: '17 Agu 2026, 16:00 WIB'
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleFeedback = (messageId: string, feedback: Message['feedback']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ))
  }

  const generateMockResponse = (question: string): string => {
    if (question.toLowerCase().includes('portofolio')) {
      return 'Berdasarkan analisis portofolio Anda, total nilai saat ini adalah Rp 48.061.300 dengan return 1.58%. Portofolio terdiversifikasi ke 9 saham dari berbagai sektor. Sektor Financials dan Industrials memiliki alokasi terbesar. Perlu diperhatikan bahwa konsentrasi di sektor tertentu cukup tinggi, yang mungkin meningkatkan risiko korelasi.'
    }
    if (question.toLowerCase().includes('tesis') || question.toLowerCase().includes('thesis')) {
      return 'Dari 9 posisi aktif, 7 memiliki tesis dengan status UTUH, 1 DIPANTAU, dan 1 MELEMAH. Tesis yang perlu perhatian adalah posisi yang berstatus MELEMAH karena ada bukti yang mulai bertentangan dengan alasan awal investasi. Saya sarankan untuk meninjau ulang tesis tersebut dan mempertimbangkan apakah kondisi invalidasi sudah terpenuhi.'
    }
    if (question.toLowerCase().includes('risiko') || question.toLowerCase().includes('risk')) {
      return 'Analisis risiko menunjukkan bahwa saham dengan alokasi terbesar adalah POWR (8.14%) dan AUTO (3.53%). Konsentrasi di sektor Industrials cukup tinggi. Stress test menunjukkan jika portofolio turun 10%, kerugian akan mencapai Rp 4.8M. Diversifikasi sudah cukup baik namun bisa ditingkatkan dengan mengurangi eksposur di sektor yang sama.'
    }
    return 'Terima kasih atas pertanyaan Anda. Berdasarkan data yang tersedia, saya dapat memberikan analisis namun perlu diingat bahwa informasi ini bersifat edukatif dan bukan rekomendasi investasi. Selalu lakukan riset mandiri dan pertimbangkan toleransi risiko Anda sebelum mengambil keputusan.'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analyst</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tanyakan apa saja tentang portofolio dan investasi Anda</p>
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
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Sumber:
                        </p>
                        <div className="space-y-1">
                          {message.citations.map((citation) => (
                            <div key={citation.id} className="flex items-center gap-2 text-xs">
                              <ExternalLink className="h-3 w-3" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {citation.title} - {citation.source} ({citation.date})
                              </span>
                              {citation.url && (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Buka
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence and Freshness */}
                    {message.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {message.confidence && (
                          <span>Confidence: {message.confidence}</span>
                        )}
                        {message.dataFreshness && (
                          <span>Data: {message.dataFreshness}</span>
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
