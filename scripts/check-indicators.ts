// Self-check indikator teknikal: npx tsx scripts/check-indicators.ts
import { sma, ema, rsi, macd, annualizedVolatility, maxDrawdown, srZones, Bar } from '../src/lib/indicators'

const assert = (cond: boolean, msg: string) => { if (!cond) { console.error('❌', msg); process.exit(1) } console.log('✅', msg) }
const approx = (a: number | null, b: number, tol = 1e-6) => a != null && Math.abs(a - b) < tol

// SMA
assert(approx(sma([1, 2, 3, 4, 5], 3)[2], 2), 'SMA3 [1..5][2] = 2')
assert(sma([1, 2], 3)[1] === null, 'SMA kurang data = null')

// EMA
const e = ema([1, 2, 3], 2)
assert(approx(e[0], 1) && approx(e[1], 5 / 3), 'EMA2 step values')

// RSI: all gains → 100
const r = rsi([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 14)
assert(approx(r[15] as number, 100, 0.01), 'RSI all-gain = 100')
// RSI: all losses → 0
const r2 = rsi([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 14)
assert(approx(r2[15] as number, 0, 0.01), 'RSI all-loss = 0')

// MACD: constant series → 0
const m = macd([5, 5, 5, 5, 5, 5, 5, 5, 5, 5], 3, 5, 3)
assert(approx(m.macd[9], 0) && approx(m.histogram[9], 0), 'MACD constant = 0')

// Vol & drawdown
assert(approx(annualizedVolatility(Array(25).fill(100)), 0), 'Vol flat = 0')
assert(annualizedVolatility([100, 100, 100]) === null, 'Vol kurang data = null')
assert(approx(maxDrawdown([100, 120, 90, 110]), -25), 'MaxDD 120→90 = -25%')

// SR zones
const bars: Bar[] = Array.from({ length: 25 }, (_, i) => ({ date: new Date(), open: 100, high: 110, low: 90, close: 100, volume: i }))
const sr = srZones(bars, 20)
assert(sr != null && sr.support[0] === 90 && sr.resistance[1] === 110, 'SR zones dari low/high')

console.log('\n🎉 Semua cek indikator lulus')
