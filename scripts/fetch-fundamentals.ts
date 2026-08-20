// Fetch real fundamental data from Yahoo Finance for seeded IDX stocks
// Usage: npx tsx scripts/fetch-fundamentals.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const SOURCE = 'Yahoo Finance'

interface YahooSession { cookie: string; crumb: string }

async function getYahooSession(): Promise<YahooSession> {
  const res1 = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': UA } })
  const setCookies = res1.headers.getSetCookie?.() || []
  const cookie = setCookies.map(c => c.split(';')[0]).join('; ')
  const res2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  })
  const crumb = (await res2.text()).trim()
  if (!crumb || crumb.includes('<')) throw new Error('Failed to get Yahoo crumb')
  return { cookie, crumb }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchQuoteSummary(ticker: string, session: YahooSession, modules: string): Promise<any> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}.JK?modules=${modules}&crumb=${encodeURIComponent(session.crumb)}`
  const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: session.cookie } })
  const data = await res.json()
  if (data.quoteSummary?.error) {
    console.log(`  ⚠ ${ticker}: ${data.quoteSummary.error.description}`)
    return null
  }
  return data.quoteSummary?.result?.[0] || null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw = (v: any): number | null => (v && typeof v.raw === 'number' ? v.raw : null)

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function main() {
  console.log('📡 Fetching fundamental data from Yahoo Finance...\n')
  const session = await getYahooSession()
  console.log('✅ Yahoo session established\n')

  const securities = await prisma.security.findMany({ where: { isActive: true } })
  console.log(`Found ${securities.length} securities\n`)

  let success = 0

  for (const sec of securities) {
    console.log(`--- ${sec.ticker} (${sec.name}) ---`)
    try {
      const result = await fetchQuoteSummary(
        sec.ticker, session,
        'incomeStatementHistory,balanceSheetHistory,financialData,defaultKeyStatistics,price'
      )
      if (!result) continue

      const incomeHistory = result.incomeStatementHistory?.incomeStatementHistory || []
      const bsHistory = result.balanceSheetHistory?.balanceSheetStatements || []
      const fd = result.financialData || {}
      const ks = result.defaultKeyStatistics || {}
      const priceModule = result.price || {}

      // Update last price if available
      const marketPrice = raw(priceModule.regularMarketPrice)
      if (marketPrice) {
        await prisma.security.update({
          where: { id: sec.id },
          data: { lastPrice: marketPrice, lastUpdate: new Date() },
        })
      }

      // --- Store income statements (annual, up to 4 periods) ---
      for (const stmt of incomeHistory) {
        const periodEnd = stmt.endDate?.raw ? new Date(stmt.endDate.raw * 1000) : null
        if (!periodEnd) continue
        const data = {
          totalRevenue: raw(stmt.totalRevenue),
          costOfRevenue: raw(stmt.costOfRevenue),
          grossProfit: raw(stmt.grossProfit),
          operatingIncome: raw(stmt.operatingIncome),
          operatingExpense: raw(stmt.operatingExpense),
          ebitda: raw(stmt.ebitda),
          netIncome: raw(stmt.netIncome),
          netIncomeApplicableToCommonShares: raw(stmt.netIncomeApplicableToCommonShares),
          minorityInterest: raw(stmt.minorityInterest),
          sellingGeneralAdministrative: raw(stmt.sellingGeneralAdministrative),
          researchDevelopment: raw(stmt.researchDevelopment),
          otherOperatingExpenses: raw(stmt.otherOperatingExpenses),
          // FUND-04: bank-specific lines (sering tersedia untuk emiten Financials)
          interestIncome: raw(stmt.interestIncome),
          interestExpense: raw(stmt.interestExpense),
        }
        await prisma.financialStatement.upsert({
          where: {
            securityId_periodEnd_type: {
              securityId: sec.id,
              periodEnd,
              type: 'INCOME_STATEMENT',
            },
          },
          update: { data: JSON.stringify(data), publishedAt: new Date() },
          create: {
            securityId: sec.id,
            periodType: 'ANNUAL',
            periodEnd,
            publishedAt: new Date(),
            type: 'INCOME_STATEMENT',
            data: JSON.stringify(data),
            source: SOURCE,
            sourceUrl: `https://finance.yahoo.com/quote/${sec.ticker}.JK/financials`,
          },
        })
      }

      // --- Store balance sheets ---
      for (const stmt of bsHistory) {
        const periodEnd = stmt.endDate?.raw ? new Date(stmt.endDate.raw * 1000) : null
        if (!periodEnd) continue
        const keys = Object.keys(stmt).filter(k => k !== 'maxAge' && k !== 'endDate')
        if (keys.length === 0) continue // Yahoo returns empty BS for some (e.g. banks)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: Record<string, number | null> = {}
        for (const k of keys) data[k] = raw(stmt[k])
        await prisma.financialStatement.upsert({
          where: {
            securityId_periodEnd_type: {
              securityId: sec.id,
              periodEnd,
              type: 'BALANCE_SHEET',
            },
          },
          update: { data: JSON.stringify(data), publishedAt: new Date() },
          create: {
            securityId: sec.id,
            periodType: 'ANNUAL',
            periodEnd,
            publishedAt: new Date(),
            type: 'BALANCE_SHEET',
            data: JSON.stringify(data),
            source: SOURCE,
            sourceUrl: `https://finance.yahoo.com/quote/${sec.ticker}.JK/balance-sheet`,
          },
        })
      }

      // --- Store key metrics (latest period) ---
      const latestPeriod = incomeHistory[0]?.endDate?.raw
        ? new Date(incomeHistory[0].endDate.raw * 1000)
        : new Date()

      const metrics: Array<{ name: string; value: number | null; formula?: string; dataType?: string }> = [
        { name: 'PER', value: raw(ks.trailingPE) ?? raw(fd.trailingPE), formula: 'Price / EPS (TTM)' },
        { name: 'FORWARD_PER', value: raw(ks.forwardPE), formula: 'Price / Forward EPS' },
        { name: 'PBV', value: raw(ks.priceToBook) ?? raw(fd.priceToBook), formula: 'Price / Book Value per Share' },
        { name: 'BOOK_VALUE_PER_SHARE', value: raw(ks.bookValue) ?? raw(fd.bookValue) },
        { name: 'ROE', value: raw(fd.returnOnEquity), formula: 'Net Income / Equity' },
        { name: 'ROA', value: raw(fd.returnOnAssets), formula: 'Net Income / Total Assets' },
        { name: 'OPERATING_MARGIN', value: raw(fd.operatingMargins), formula: 'Operating Income / Revenue' },
        { name: 'NET_MARGIN', value: raw(fd.profitMargins), formula: 'Net Income / Revenue' },
        { name: 'GROSS_MARGIN', value: raw(fd.grossMargins), formula: 'Gross Profit / Revenue' },
        { name: 'DEBT_TO_EQUITY', value: raw(fd.debtToEquity) != null ? raw(fd.debtToEquity)! / 100 : null, formula: 'Total Debt / Equity' },
        { name: 'CURRENT_RATIO', value: raw(fd.currentRatio), formula: 'Current Assets / Current Liabilities' },
        { name: 'TOTAL_DEBT', value: raw(fd.totalDebt) },
        { name: 'TOTAL_CASH', value: raw(fd.totalCash) },
        { name: 'TOTAL_REVENUE_TTM', value: raw(fd.totalRevenue) },
        { name: 'REVENUE_GROWTH', value: raw(fd.revenueGrowth), formula: 'YoY revenue growth' },
        { name: 'EARNINGS_GROWTH', value: raw(fd.earningsGrowth), formula: 'YoY earnings growth' },
        { name: 'DIVIDEND_YIELD', value: raw(fd.dividendYield) != null ? raw(fd.dividendYield)! / 100 : null, formula: 'DPS / Price' },
        { name: 'BETA', value: raw(ks.beta) },
        { name: 'SHARES_OUTSTANDING', value: raw(ks.sharesOutstanding) ?? raw(fd.sharesOutstanding) },
        { name: 'ENTERPRISE_VALUE', value: raw(ks.enterpriseValue) },
        { name: 'MARKET_CAP', value: raw(priceModule.marketCap) },
      ]

      let storedMetrics = 0
      for (const m of metrics) {
        if (m.value == null || !isFinite(m.value)) continue
        await prisma.financialMetric.upsert({
          where: {
            securityId_periodEnd_metricName: {
              securityId: sec.id,
              periodEnd: latestPeriod,
              metricName: m.name,
            },
          },
          update: { metricValue: m.value, formula: m.formula },
          create: {
            securityId: sec.id,
            periodEnd: latestPeriod,
            periodType: 'ANNUAL',
            metricName: m.name,
            metricValue: m.value,
            formula: m.formula,
            dataType: 'ACTUAL',
            confidence: 'HIGH',
          },
        })
        storedMetrics++
      }

      console.log(`  ✅ ${incomeHistory.length} income stmts, ${bsHistory.length} balance sheets, ${storedMetrics} metrics${marketPrice ? `, price → ${marketPrice}` : ''}`)
      success++
    } catch (e) {
      console.log(`  ❌ ${sec.ticker}: ${e instanceof Error ? e.message : e}`)
    }
    await sleep(800) // rate limit courtesy
  }

  console.log(`\n🎉 Done: ${success}/${securities.length} securities updated`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
