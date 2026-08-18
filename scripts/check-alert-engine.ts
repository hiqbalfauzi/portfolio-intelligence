// Self-check alert engine: npx tsx scripts/check-alert-engine.ts
import { evaluateRule, inCooldown, type RuleInput, type MarketInput } from '../src/lib/alert-engine'

const assert = (cond: boolean, msg: string) => { if (!cond) { console.error('❌', msg); process.exit(1) } console.log('✅', msg) }

const mkt: MarketInput = {
  lastClose: 1000, prevClose: 950, lastVolume: 5_000_000, avgVolume20: 1_000_000,
  closes: Array.from({ length: 30 }, (_, i) => 900 + i * 5), // uptrend → RSI tinggi
  high20Prev: 990, low20Prev: 880, thesisStatus: 'MELEMAH',
}

const rule = (type: string, condition: object): RuleInput => ({
  id: 'r1', name: 'test', type, condition: JSON.stringify(condition),
  priority: 'INFO', securityId: null, lastTriggered: null,
})

// PRICE
assert(evaluateRule(rule('PRICE', { operator: 'above', value: 950 }), mkt) != null, 'PRICE above trigger')
assert(evaluateRule(rule('PRICE', { operator: 'above', value: 1100 }), mkt) == null, 'PRICE above no-trigger')
assert(evaluateRule(rule('PRICE', { operator: 'below', value: 1050 }), mkt) != null, 'PRICE below trigger')

// VOLUME
assert(evaluateRule(rule('VOLUME', { multiplier: 2 }), mkt) != null, 'VOLUME 5x > 2x trigger')
assert(evaluateRule(rule('VOLUME', { multiplier: 10 }), mkt) == null, 'VOLUME 5x < 10x no-trigger')

// TECHNICAL
assert(evaluateRule(rule('TECHNICAL', { indicator: 'BREAKOUT_20D' }), mkt) != null, 'BREAKOUT trigger (1000 > 990)')
const mktDown = { ...mkt, lastClose: 870 }
assert(evaluateRule(rule('TECHNICAL', { indicator: 'BREAKDOWN_20D' }), mktDown) != null, 'BREAKDOWN trigger (870 < 880)')
const flat = Array(40).fill(100)
assert(evaluateRule(rule('TECHNICAL', { indicator: 'RSI_OVERBOUGHT' }), { ...mkt, closes: flat }) == null, 'RSI flat no overbought')

// THESIS
assert(evaluateRule(rule('THESIS', { statuses: ['MELEMAH', 'PATAH'] }), mkt) != null, 'THESIS MELEMAH trigger')
assert(evaluateRule(rule('THESIS', { statuses: ['PATAH'] }), mkt) == null, 'THESIS PATAH-only no-trigger')

// Bad JSON
assert(evaluateRule({ ...rule('PRICE', {}), condition: '{bad' }, mkt) == null, 'Bad JSON → null (no crash)')

// Cooldown
assert(inCooldown(new Date(Date.now() - 1 * 86400_000)) === true, 'Cooldown aktif (1 hari lalu)')
assert(inCooldown(new Date(Date.now() - 8 * 86400_000)) === false, 'Cooldown lewat (8 hari lalu)')
assert(inCooldown(null) === false, 'Belum pernah trigger → no cooldown')

console.log('\n🎉 Semua cek alert engine lulus')
