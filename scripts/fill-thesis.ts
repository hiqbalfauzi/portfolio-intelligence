// Isi tesis 9 saham berdasarkan strategi dividen (min yield 7%).
// Usage: npx tsx scripts/fill-thesis.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })

type T = {
  ticker: string
  title: string
  summary: string
  reason: string
  horizon: string
  catalyst: string
  risks: string
  invalidation: string
  indicators: string[]
  thresholds: Record<string, string>
  status: string
  confidence: string
}

const DATA: T[] = [
  {
    ticker: 'BMRI',
    title: 'Core: Big bank berkualitas, pertumbuhan dividen',
    summary: 'Bank Mandiri adalah big-4 bank dengan ROE terbaik di kelasnya. Yield dividen moderat, tetapi DPS tumbuh mengikuti pertumbuhan laba. Posisi inti portofolio.',
    reason: 'Bank beraset terbesar dengan kualitas laba tinggi, payout ratio ~60% yang konsisten, dan pertumbuhan kredit double-digit. Dividen tumbuh bersama laba, bukan sekadar yield statis.',
    horizon: '5+ tahun',
    catalyst: 'Pertumbuhan kredit & CASA, potensi kenaikan payout ratio, penurunan BI Rate menekan cost of funds, inklusi indeks global.',
    risks: 'Kenaikan NPL jika ekonomi melambat; cost of funds tinggi saat suku bunga naik; intervensi kebijakan BUMN; pertumbuhan laba melambat.',
    invalidation: 'DPS turun 2 tahun berturut-turut, atau NPL gross > 3.5%, atau ROE turun di bawah 12%.',
    indicators: ['DPS tahunan', 'ROE', 'NPL gross', 'Payout ratio', 'Pertumbuhan laba bersih'],
    thresholds: { dps: 'tidak turun 2x beruntun', roe: '>= 12%', npl: '<= 3.5%' },
    status: 'UTUH',
    confidence: 'TINGGI',
  },
  {
    ticker: 'POWR',
    title: 'Core: Dividen listrik stabil dari kontrak USD',
    summary: 'Cikarang Listrindo memiliki kontrak jual listrik jangka panjang berdenominasi USD dengan PLN dan pelanggan industri. Arus kas stabil, dividen konsisten.',
    reason: 'Pendapatan terkontrak jangka panjang (take-or-pay) dengan PLN & kawasan industri, margin terlindungi formula harga, dividen rutin dengan yield menarik.',
    horizon: '5+ tahun',
    catalyst: 'Ekspansi kapasitas, permintaan listrik kawasan industri naik, USD kuat terhadap IDR.',
    risks: 'Kenaikan harga bahan bakar (gas/batu bara) jika tidak ter-pass-through; risiko regulasi PLN; kontrak jatuh tempo tanpa perpanjangan; pelemahan USD.',
    invalidation: 'DPS dipangkas, kontrak utama tidak diperpanjang, atau margin EBITDA turun > 20% dari rata-rata 3 tahun.',
    indicators: ['DPS tahunan', 'Volume penjualan listrik', 'Margin EBITDA', 'USD/IDR'],
    thresholds: { dps: 'stabil/naik', ebitdaMargin: '>= rata-rata 3th - 10%' },
    status: 'UTUH',
    confidence: 'SEDANG',
  },
  {
    ticker: 'AUTO',
    title: 'Core: Komponen otomotif Astra — yield di bawah target, pantau',
    summary: 'Astra Otoparts pemimpin komponen otomotif grup Astra, neraca sehat. Yield terakhir ~6.8% sedikit di bawah target 7% — perlu dipantau.',
    reason: 'Market leader komponen otomotif (OEM + aftermarket), dukungan grup Astra, kas bersih kuat, dividen rutin. Yield sedikit di bawah target sehingga masuk radar evaluasi.',
    horizon: '3-5 tahun',
    catalyst: 'Pemulihan penjualan otomotif, ekspansi produk EV components, kenaikan payout.',
    risks: 'Penjualan otomotif nasional melemah; persaingan komponen impor; ketergantungan siklus otomotif; yield tetap di bawah target.',
    invalidation: 'Yield dividen bertahan < 6% selama 2 tahun, atau DPS turun > 20%, atau penjualan otomotif nasional turun > 15% YoY.',
    indicators: ['DPS tahunan', 'Dividend yield', 'Penjualan otomotif nasional', 'Margin bersih'],
    thresholds: { yield: '>= 7% (target)', dps: 'tidak turun > 20%' },
    status: 'DIPANTAU',
    confidence: 'SEDANG',
  },
  {
    ticker: 'BJTM',
    title: 'Income: Bank daerah dengan yield tinggi',
    summary: 'Bank Jatim adalah BPD terbesar dengan dividend yield tinggi, didukung pemegang saham pemerintah daerah. Pilar income portofolio.',
    reason: 'Yield dividen tinggi (di atas target 7%), payout ratio besar, bisnis kredit konsumer/ASN yang stabil di Jawa Timur.',
    horizon: '3-5 tahun',
    catalyst: 'Pertumbuhan kredit ASN/konsumer, payout ratio terjaga, ekspansi digital banking.',
    risks: 'Kualitas kredit memburuk (NPL); tata kelola BPD & intervensi pemda; pertumbuhan terbatas; konsentrasi kredit daerah.',
    invalidation: 'DPS turun > 25%, atau NPL gross > 5%, atau yield turun di bawah 6%.',
    indicators: ['DPS tahunan', 'Dividend yield', 'NPL gross', 'LDR'],
    thresholds: { yield: '>= 7%', npl: '<= 5%' },
    status: 'UTUH',
    confidence: 'SEDANG',
  },
  {
    ticker: 'PGAS',
    title: 'Income: Distribusi gas — DPS turun 31%, evaluasi aktif',
    summary: 'PGN menguasai distribusi gas bumi nasional, namun DPS terakhir turun ~31%. Status DIPANTAU ketat; kandidat jual jika tren berlanjut.',
    reason: 'Posisi quasi-monopoli distribusi gas dengan yield historis tinggi. Namun penurunan DPS 31% adalah sinyal negatif serius terhadap tesis dividen.',
    horizon: '2-3 tahun (evaluasi per semester)',
    catalyst: 'Pemulihan volume distribusi gas, kenaikan harga gas, kebijakan energi pemerintah mendukung gas.',
    risks: 'DPS lanjut turun; volume gas turun akibat industri beralih energi; regulasi harga gas (HGBT); beban utang & capex; tumpang tindih kebijakan holding energi.',
    invalidation: 'DPS turun lagi tahun berikutnya, atau yield efektif < 7%, atau payout ratio dipangkas drastis tanpa alasan one-off.',
    indicators: ['DPS tahunan', 'Volume distribusi gas', 'Yield dividen', 'Payout ratio'],
    thresholds: { dps: 'tidak turun lagi', yield: '>= 7%' },
    status: 'DIPANTAU',
    confidence: 'SEDANG',
  },
  {
    ticker: 'DMAS',
    title: 'Satellite: Lahan industri dengan dividen besar',
    summary: 'Puradelta Lestari mengembangkan lahan industri Kota Deltamas. Dividen besar namun penjualan lahan bersifat lumpy — satellite, bukan core.',
    reason: 'Land bank industri luas dekat koridor Jakarta-Bandung, permintaan data center & manufaktur, kebijakan dividen besar dari kas.',
    horizon: '2-4 tahun',
    catalyst: 'Penjualan lahan ke investor data center/manufaktur, FDI masuk, infrastruktur kawasan (tol, pelabuhan).',
    risks: 'Penjualan lahan sangat lumpy & tergantung sedikit pembeli besar; siklus FDI; harga lahan tertekan; dividen tidak stabil.',
    invalidation: 'Tidak ada marketing sales signifikan 2 tahun berturut-turut, atau DPS dipangkas > 50%, atau pipeline pembeli besar batal.',
    indicators: ['Marketing sales lahan (ha)', 'DPS tahunan', 'Pipeline pembeli', 'Kas bersih'],
    thresholds: { marketingSales: '> 0 tiap tahun', dps: 'tidak dipangkas > 50%' },
    status: 'UTUH',
    confidence: 'SEDANG',
  },
  {
    ticker: 'TAPG',
    title: 'Satellite: Dividen CPO Triputra Agro',
    summary: 'Perkebunan sawit grup Triputra dengan profil yield dividen menarik. Komoditas siklikal — posisi satellite.',
    reason: 'Produksi CPO dengan biaya kompetitif, umur tanaman produktif, kebijakan dividen grup yang royal saat harga CPO tinggi.',
    horizon: '2-4 tahun',
    catalyst: 'Harga CPO naik, program biodiesel (B35/B40) menaikkan permintaan domestik, cuaca mendukung produksi.',
    risks: 'Harga CPO jatuh; cuaca ekstrem (El Nino/La Nina); kebijakan ekspor (levy, DMO); regulasi lahan/lingkungan.',
    invalidation: 'Harga CPO turun > 25% dari rata-rata 2 tahun, atau DPS dipangkas > 40%, atau produksi turun > 15%.',
    indicators: ['Harga CPO', 'DPS tahunan', 'Produksi TBS/CPO', 'Yield dividen'],
    thresholds: { yield: '>= 7%', cpo: 'tidak jatuh > 25%' },
    status: 'UTUH',
    confidence: 'SEDANG',
  },
  {
    ticker: 'MPMX',
    title: 'Satellite: Otomotif konsumer yield tinggi',
    summary: 'Mitra Pinasthika Mustika: distribusi otomotif & bisnis konsumer grup Saratoga. Yield tinggi, posisi satellite.',
    reason: 'Portofolio bisnis (distribusi motor, pelumas, asuransi) menghasilkan kas stabil dengan kebijakan dividen tinggi.',
    horizon: '2-4 tahun',
    catalyst: 'Pemulihan penjualan motor, pertumbuhan bisnis pelumas (Federal Oil), dividen spesial.',
    risks: 'Penjualan otomotif melemah; laba volatil antar segmen; aksi korporasi/akuisisi yang mendilusi; likuiditas saham rendah.',
    invalidation: 'DPS turun > 30%, atau laba bersih turun > 40%, atau ada aksi korporasi mendilusi signifikan.',
    indicators: ['DPS tahunan', 'Laba bersih', 'Penjualan motor nasional', 'Yield dividen'],
    thresholds: { yield: '>= 7%', dps: 'tidak turun > 30%' },
    status: 'UTUH',
    confidence: 'SEDANG',
  },
  {
    ticker: 'RALS',
    title: 'Satellite: Dividen ritel musiman, bisnis menurun',
    summary: 'Ramayana department store dengan kas besar dan dividen musiman (Lebaran). Bisnis inti struktural menurun — satellite spekulatif-dividen.',
    reason: 'Neraca kas bersih besar, dividen dibayar dari laba + kas, yield tinggi saat harga rendah. Namun bisnis ritel department store terus menyusut.',
    horizon: '1-3 tahun (review ketat)',
    catalyst: 'Musim Lebaran kuat, dividen spesial dari kas, efisiensi toko.',
    risks: 'Penjualan terus turun struktural; penutupan toko; disrupsi e-commerce; dividen tidak sustainable jika kas tergerus.',
    invalidation: 'DPS dipangkas > 40%, atau same-store sales turun > 15%, atau kas bersih turun signifikan untuk menutup operasional.',
    indicators: ['DPS tahunan', 'Same-store sales', 'Kas bersih', 'Jumlah toko'],
    thresholds: { dps: 'tidak dipangkas > 40%', sss: 'tidak turun > 15%' },
    status: 'DIPANTAU',
    confidence: 'RENDAH',
  },
]

const main = async () => {
  let ok = 0
  for (const d of DATA) {
    const sec = await p.security.findFirst({ where: { ticker: d.ticker } })
    if (!sec) { console.log(`❌ ${d.ticker}: security tidak ditemukan`); continue }
    const existing = await p.thesis.findFirst({ where: { securityId: sec.id } })
    const data = {
      title: d.title,
      summary: d.summary,
      reason: d.reason,
      horizon: d.horizon,
      catalyst: d.catalyst,
      risks: d.risks,
      invalidation: d.invalidation,
      indicators: JSON.stringify(d.indicators),
      thresholds: JSON.stringify(d.thresholds),
      status: d.status,
      confidence: d.confidence,
      version: existing ? existing.version + 1 : 1,
    }
    if (existing) {
      await p.thesis.update({ where: { id: existing.id }, data })
    } else {
      await p.thesis.create({ data: { ...data, securityId: sec.id } })
    }
    console.log(`✅ ${d.ticker} [${d.status}] v${data.version}`)
    ok++
  }
  console.log(`\n🎉 ${ok}/${DATA.length} tesis terisi`)
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
