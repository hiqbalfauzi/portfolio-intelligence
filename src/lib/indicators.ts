// Pure technical indicator functions (no DB dependency).
export interface Bar {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    out.push(i >= period - 1 ? sum / period : null)
  }
  return out
}

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const out: number[] = []
  let prev = values[0]
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k)
    out.push(prev)
  }
  return out
}

// Wilder RSI
export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null]
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i < values.length; i++) {
    const chg = values[i] - values[i - 1]
    const gain = Math.max(chg, 0)
    const loss = Math.max(-chg, 0)
    if (i <= period) {
      avgGain += gain / period
      avgLoss += loss / period
      out.push(i === period ? rsiVal(avgGain, avgLoss) : null)
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
      out.push(rsiVal(avgGain, avgLoss))
    }
  }
  return out
}

function rsiVal(gain: number, loss: number): number {
  if (gain === 0 && loss === 0) return 50 // flat: netral
  if (loss === 0) return 100
  const rs = gain / loss
  return 100 - 100 / (1 + rs)
}

export interface MacdResult {
  macd: number[]
  signal: number[]
  histogram: number[]
}

export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9): MacdResult {
  const emaFast = ema(values, fast)
  const emaSlow = ema(values, slow)
  const line = emaFast.map((v, i) => v - emaSlow[i])
  const sig = ema(line, signalPeriod)
  return { macd: line, signal: sig, histogram: line.map((v, i) => v - sig[i]) }
}

// Annualized volatility from daily closes
export function annualizedVolatility(closes: number[]): number | null {
  if (closes.length < 21) return null
  const rets: number[] = []
  for (let i = 1; i < closes.length; i++) rets.push(Math.log(closes[i] / closes[i - 1]))
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length
  const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / (rets.length - 1)
  return Math.sqrt(variance) * Math.sqrt(252) * 100
}

// Max drawdown (%) over the series
export function maxDrawdown(closes: number[]): number | null {
  if (closes.length < 2) return null
  let peak = closes[0]
  let maxDd = 0
  for (const c of closes) {
    if (c > peak) peak = c
    const dd = (c - peak) / peak
    if (dd < maxDd) maxDd = dd
  }
  return maxDd * 100
}

// Support/resistance as estimation zones from recent N bars
export function srZones(bars: Bar[], lookback = 20): { support: [number, number]; resistance: [number, number] } | null {
  if (bars.length < lookback) return null
  const recent = bars.slice(-lookback)
  const lo = Math.min(...recent.map(b => b.low))
  const hi = Math.max(...recent.map(b => b.high))
  return {
    support: [lo, lo * 1.02],
    resistance: [hi * 0.98, hi],
  }
}
