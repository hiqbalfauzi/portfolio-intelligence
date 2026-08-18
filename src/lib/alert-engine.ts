// Alert engine: evaluate rules against current data. Pure logic, DB-agnostic inputs.
import { rsi } from './indicators'

export interface PriceCondition { operator: 'above' | 'below'; value: number }
export interface VolumeCondition { multiplier: number } // vs avg 20 hari
export interface TechnicalCondition { indicator: 'RSI_OVERBOUGHT' | 'RSI_OVERSOLD' | 'BREAKOUT_20D' | 'BREAKDOWN_20D' }
export interface ThesisCondition { statuses: string[] } // e.g. ['MELEMAH','PATAH']

export interface RuleInput {
  id: string
  name: string
  type: string // PRICE | VOLUME | TECHNICAL | THESIS
  condition: string // JSON
  priority: string
  securityId: string | null
  lastTriggered: Date | null
}

export interface MarketInput {
  lastClose: number
  prevClose: number | null
  lastVolume: number
  avgVolume20: number
  closes: number[] // ascending, for RSI
  high20Prev: number | null // highest high 20 bar sebelumnya (excl last)
  low20Prev: number | null
  thesisStatus: string | null
}

export interface TriggerResult {
  title: string
  message: string
  previousValue: string
  currentValue: string
  impact: string
}

const COOLDOWN_DAYS = 7 // dedup: jangan trigger ulang rule yang sama dalam 7 hari (ALERT-04)

export function inCooldown(lastTriggered: Date | null, now = new Date()): boolean {
  if (!lastTriggered) return false
  return now.getTime() - lastTriggered.getTime() < COOLDOWN_DAYS * 86400_000
}

export function evaluateRule(rule: RuleInput, mkt: MarketInput): TriggerResult | null {
  let cond: Record<string, unknown>
  try { cond = JSON.parse(rule.condition) } catch { return null }

  switch (rule.type) {
    case 'PRICE': {
      const c = cond as unknown as PriceCondition
      if (c.operator === 'above' && mkt.lastClose >= c.value) {
        return {
          title: `Harga naik di atas ${c.value}`,
          message: `Harga terakhir ${mkt.lastClose} melewati batas atas ${c.value}. Tinjau apakah target harga tesis tercapai atau perlu ambil untung.`,
          previousValue: String(c.value), currentValue: String(mkt.lastClose),
          impact: 'Potensi target tercapai — evaluasi aksi sesuai tesis.',
        }
      }
      if (c.operator === 'below' && mkt.lastClose <= c.value) {
        return {
          title: `Harga turun di bawah ${c.value}`,
          message: `Harga terakhir ${mkt.lastClose} menembus batas bawah ${c.value}. Periksa apakah ini pelemahan tesis atau hanya pergerakan pasar.`,
          previousValue: String(c.value), currentValue: String(mkt.lastClose),
          impact: 'Periksa kondisi invalidasi tesis.',
        }
      }
      return null
    }
    case 'VOLUME': {
      const c = cond as unknown as VolumeCondition
      if (mkt.avgVolume20 > 0 && mkt.lastVolume > mkt.avgVolume20 * c.multiplier) {
        return {
          title: `Lonjakan volume ${(mkt.lastVolume / mkt.avgVolume20).toFixed(1)}x`,
          message: `Volume ${Math.round(mkt.lastVolume / 1e6)}jt = ${(mkt.lastVolume / mkt.avgVolume20).toFixed(1)}x rata-rata 20 hari (${(mkt.avgVolume20 / 1e6).toFixed(1)}jt). Ada aktivitas tidak biasa.`,
          previousValue: `${(mkt.avgVolume20 / 1e6).toFixed(1)}jt`, currentValue: `${Math.round(mkt.lastVolume / 1e6)}jt`,
          impact: 'Pergerakan dengan volume besar lebih bermakna — cek arah dan berita.',
        }
      }
      return null
    }
    case 'TECHNICAL': {
      const c = cond as unknown as TechnicalCondition
      const rsiNow = rsi(mkt.closes, 14)[mkt.closes.length - 1]
      if (c.indicator === 'RSI_OVERBOUGHT' && rsiNow != null && rsiNow >= 70) {
        return {
          title: `RSI overbought (${rsiNow.toFixed(0)})`,
          message: `RSI(14) = ${rsiNow.toFixed(1)} >= 70. Momentum jangka pendek sangat kuat, risiko koreksi meningkat.`,
          previousValue: '< 70', currentValue: rsiNow.toFixed(1),
          impact: 'Bukan sinyal jual otomatis — konfirmasi dengan tren dan tesis.',
        }
      }
      if (c.indicator === 'RSI_OVERSOLD' && rsiNow != null && rsiNow <= 30) {
        return {
          title: `RSI oversold (${rsiNow.toFixed(0)})`,
          message: `RSI(14) = ${rsiNow.toFixed(1)} <= 30. Tekanan jual jangka pendek ekstrem.`,
          previousValue: '> 30', currentValue: rsiNow.toFixed(1),
          impact: 'Periksa apakah penurunan karena fundamental atau teknikal.',
        }
      }
      if (c.indicator === 'BREAKOUT_20D' && mkt.high20Prev != null && mkt.lastClose > mkt.high20Prev) {
        return {
          title: 'Breakout 20 hari',
          message: `Close ${mkt.lastClose} > high tertinggi 20 hari sebelumnya (${mkt.high20Prev}).`,
          previousValue: String(mkt.high20Prev), currentValue: String(mkt.lastClose),
          impact: 'Konfirmasi dengan volume sebelum menyimpulkan tren baru.',
        }
      }
      if (c.indicator === 'BREAKDOWN_20D' && mkt.low20Prev != null && mkt.lastClose < mkt.low20Prev) {
        return {
          title: 'Breakdown 20 hari',
          message: `Close ${mkt.lastClose} < low terendah 20 hari sebelumnya (${mkt.low20Prev}).`,
          previousValue: String(mkt.low20Prev), currentValue: String(mkt.lastClose),
          impact: 'Periksa tesis — breakdown bisa jadi awal pelemahan.',
        }
      }
      return null
    }
    case 'THESIS': {
      const c = cond as unknown as ThesisCondition
      if (mkt.thesisStatus && c.statuses.includes(mkt.thesisStatus)) {
        return {
          title: `Status tesis: ${mkt.thesisStatus}`,
          message: `Tesis investasi saat ini berstatus ${mkt.thesisStatus}. Tinjau bukti terbaru dan pertimbangkan tindakan.`,
          previousValue: '-', currentValue: mkt.thesisStatus,
          impact: 'Status tesis berubah — evaluasi posisi secara menyeluruh.',
        }
      }
      return null
    }
    default:
      return null
  }
}
