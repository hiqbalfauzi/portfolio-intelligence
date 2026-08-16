export type Horizon = 'short-term' | 'medium-term' | 'long-term'
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'
export type AnalysisStyle = 'fundamental' | 'technical' | 'balanced'

export type ThesisStatus = 'UTUH' | 'DIPANTAU' | 'MELEMAH' | 'PATAH'
export type ConfidenceLevel = 'TINGGI' | 'SEDANG' | 'RENDAH'

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'FEE'
export type AlertPriority = 'INFO' | 'REVIEW' | 'CRITICAL'
export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
export type Materiality = 'HIGH' | 'MEDIUM' | 'LOW'

export type DimensionScore = {
  name: string
  value: number // 0-100
  trend: 'up' | 'down' | 'stable'
  confidence: ConfidenceLevel
  factors: string[]
  lastUpdated: Date
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  realizedPL: number
  unrealizedPL: number
  totalReturn: number
  dailyChange: number
  dailyChangePercent: number
}

export interface PositionSummary {
  id: string
  ticker: string
  name: string
  quantity: number
  averageCost: number
  currentPrice: number
  currentValue: number
  unrealizedPL: number
  unrealizedPLPercent: number
  allocation: number // percentage
  thesisStatus?: ThesisStatus
}

export interface AlertItem {
  id: string
  type: string
  priority: AlertPriority
  title: string
  message: string
  securityTicker?: string
  createdAt: Date
  isRead: boolean
}

export interface ThesisEvidence {
  id: string
  type: 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL'
  source: string
  title: string
  description: string
  impact: Materiality
  confidence: ConfidenceLevel
  createdAt: Date
}

export interface AIResponse {
  conclusion: string
  evidence: string[]
  counterEvidence: string[]
  thesisImpact?: string
  monitoringPoints?: string[]
  sources: Array<{
    title: string
    url?: string
    date: Date
    type: string
  }>
  confidence: ConfidenceLevel
  dataFreshness: Date
}
