# Product Requirements Document (PRD)

## AI Investment Intelligence & Portfolio Thesis Monitor

| Atribut | Nilai |
|---|---|
| Status | Draft v1.0 |
| Tanggal | 16 Agustus 2026 |
| Pemilik produk | TBD |
| Nama produk | TBD — nama sementara: **Portfolio Intelligence** |
| Platform awal | Web responsif, desktop-first |
| Target pengguna awal | Investor ritel Indonesia |
| Cakupan pasar awal | Saham yang tercatat di Bursa Efek Indonesia (BEI) |

---

## 1. Ringkasan Eksekutif

Portfolio Intelligence adalah sistem pendukung keputusan investasi berbasis AI yang memusatkan analisis hanya pada saham yang dimiliki atau dipantau pengguna. Produk ini menggabungkan data portofolio, fundamental, teknikal, berita, sentimen, risiko, valuasi, dan jurnal investasi ke dalam satu ruang kerja.

Tujuan produk bukan memberikan pembenaran untuk terus memegang saham, melainkan membantu pengguna menjawab pertanyaan berikut secara objektif:

- Apakah alasan awal memiliki saham ini masih valid?
- Apa yang berubah sejak keputusan investasi dibuat?
- Bukti apa yang mendukung dan menentang keputusan untuk tetap memegang saham?
- Risiko apa yang saat ini paling material bagi posisi dan portofolio?
- Informasi apa yang perlu dipantau berikutnya?

AI berfungsi sebagai analis pendamping: mengolah data, merangkum sumber, mendeteksi perubahan, menyusun argumen dua sisi, dan menunjukkan keterbatasan data. AI tidak mengeksekusi transaksi dan tidak menjanjikan hasil investasi.

---

## 2. Latar Belakang dan Masalah

Investor ritel umumnya menggunakan beberapa aplikasi terpisah untuk memantau posisi, grafik, laporan keuangan, berita, dan catatan investasi. Informasi tersebut sering kali tidak terhubung dengan alasan awal membeli saham.

Masalah utama yang ingin diselesaikan:

1. **Informasi terfragmentasi.** Data portofolio, fundamental, teknikal, dan berita tersebar di banyak platform.
2. **Sulit mendeteksi perubahan tesis.** Pengguna melihat harga bergerak, tetapi belum tentu mengetahui apakah kondisi bisnis ikut berubah.
3. **Confirmation bias.** Pengguna cenderung mencari informasi yang mendukung posisi yang sudah dimiliki.
4. **Data tanpa konteks.** Banyak indikator tersedia, tetapi tidak selalu relevan dengan sektor, horizon, dan strategi pengguna.
5. **Tidak ada jejak keputusan.** Alasan pembelian dan perubahan pandangan jarang terdokumentasi secara konsisten.
6. **AI yang tidak terverifikasi.** Ringkasan AI dapat terdengar meyakinkan meskipun sumber, tanggal, atau kualitas datanya tidak jelas.

---

## 3. Visi Produk

Menjadi ruang kerja investasi pribadi yang membantu pengguna mempertahankan atau mengubah keputusan berdasarkan tesis, bukti, dan risiko—bukan semata-mata pergerakan harga atau sentimen sesaat.

### Prinsip produk

1. **Evidence before conclusion.** Kesimpulan harus dapat ditelusuri ke data dan sumber.
2. **Thesis before ticker.** Analisis selalu dikaitkan dengan alasan kepemilikan saham.
3. **Show both sides.** Produk wajib menunjukkan bukti pendukung dan bukti penentang.
4. **Freshness is visible.** Tanggal dan waktu pembaruan data selalu terlihat.
5. **Uncertainty is explicit.** AI menyatakan ketidakpastian, data yang hilang, dan konflik antar-sumber.
6. **Sector-aware analysis.** Metrik fundamental mengikuti karakteristik sektor.
7. **Decision support, not decision replacement.** Keputusan dan tanggung jawab tetap berada pada pengguna.
8. **Privacy by default.** Kredensial broker, PIN, OTP, dan kata sandi tidak pernah diminta atau disimpan.

---

## 4. Tujuan dan Non-Tujuan

### 4.1 Tujuan

- Menggabungkan informasi yang relevan dengan saham pengguna dalam satu dashboard.
- Menyediakan pemantauan tesis investasi secara berkelanjutan.
- Mengurangi waktu yang dibutuhkan untuk membaca laporan dan berita.
- Membantu pengguna mengenali perubahan fundamental, teknikal, sentimen, dan risiko.
- Memberikan jawaban AI yang memiliki sumber, tanggal, serta tingkat keyakinan.
- Membantu pengguna mengevaluasi kualitas proses keputusannya melalui jurnal.
- Memprioritaskan perhatian berdasarkan materialitas, bukan jumlah notifikasi.

### 4.2 Non-Tujuan

- Menjamin keuntungan atau akurasi prediksi harga.
- Memberikan sinyal beli/jual otomatis tanpa konteks.
- Melakukan auto-trading atau mengeksekusi order pada fase awal.
- Menjadi pengganti nasihat keuangan profesional.
- Menyediakan data real-time bursa tanpa lisensi yang sesuai.
- Menggunakan satu skor gabungan sebagai kebenaran absolut.
- Menganalisis seluruh saham di bursa secara mendalam jika tidak dimiliki atau dipantau pengguna.

---

## 5. Pengguna Sasaran

### Persona utama — Investor mandiri

- Memiliki 3–20 saham Indonesia.
- Horizon investasi beberapa bulan hingga beberapa tahun.
- Memahami konsep dasar saham, tetapi tidak selalu memiliki waktu membaca seluruh laporan.
- Ingin memisahkan perubahan harga dari perubahan kualitas bisnis.
- Membutuhkan alat untuk mempertahankan disiplin dan mengurangi bias.

### Persona sekunder — Investor aktif berbasis tesis

- Menggabungkan fundamental dan teknikal.
- Melakukan evaluasi posisi secara mingguan atau setelah peristiwa penting.
- Membutuhkan alert, peer comparison, scenario analysis, dan jurnal lebih mendalam.

### Jobs to be Done

- Ketika laporan keuangan terbit, saya ingin mengetahui perubahan yang material terhadap tesis investasi saya.
- Ketika harga turun tajam, saya ingin mengetahui apakah penyebabnya bersifat teknikal, sentimen, atau fundamental.
- Ketika saya ragu untuk tetap memegang saham, saya ingin melihat argumen terkuat dari kedua sisi beserta buktinya.
- Ketika portofolio terkonsentrasi, saya ingin memahami sumber risiko terbesar dan dampaknya.
- Ketika membuat keputusan, saya ingin mencatat alasan dan mengevaluasinya kemudian.

---

## 6. Metrik Keberhasilan

### North Star Metric

**Persentase posisi aktif yang memiliki tesis terdokumentasi dan telah ditinjau menggunakan bukti terbaru.**

### Metrik produk

- Persentase saham portofolio yang memiliki tesis lengkap.
- Persentase ringkasan AI dengan sumber valid dan tanggal data.
- Waktu median dari data/peristiwa baru hingga alert material diterima pengguna.
- Persentase alert yang dibuka, ditandai relevan, atau ditindaklanjuti.
- Jumlah tinjauan tesis per pengguna per bulan.
- Retensi pengguna mingguan dan bulanan.
- Tingkat penyelesaian onboarding dan impor portofolio.
- Persentase jawaban AI yang lolos pemeriksaan factual-grounding.

### Guardrail metrics

- Tingkat klaim AI tanpa sumber.
- Tingkat sumber gagal dibuka atau tidak mendukung klaim.
- Persentase data kedaluwarsa yang tidak diberi label.
- Jumlah alert duplikat atau tidak material.
- Persentase pengguna yang salah mengartikan output sebagai rekomendasi pasti, diukur melalui riset pengguna.
- Jumlah insiden keamanan atau kebocoran data: target **0**.

---

## 7. Ruang Lingkup dan Prioritas

### P0 — MVP

1. Akun dan profil investasi dasar.
2. Input portofolio manual dan impor CSV.
3. Overview portofolio.
4. Halaman detail saham.
5. Fundamental dasar dan tren antarperiode.
6. Teknikal dasar dan grafik harga.
7. Agregasi berita serta sentimen berbasis sumber.
8. Investment Thesis Monitor.
9. AI Analyst dengan jawaban berbasis data yang tersedia.
10. Risk Center dasar.
11. Alert berbasis aturan.
12. Jurnal investasi dasar.
13. Label sumber, waktu pembaruan, dan kualitas data.

### P1 — Setelah MVP tervalidasi

1. Peer comparison berbasis sektor.
2. Valuasi dan scenario analysis.
3. Corporate action calendar.
4. Alert cerdas berbasis materialitas.
5. Ringkasan harian dan mingguan.
6. Notifikasi email atau Telegram.
7. Benchmark portofolio terhadap IHSG dan indeks sektoral.
8. Evaluasi pola keputusan dari jurnal.
9. Ekspor laporan ke PDF/Markdown.

### P2 — Pengembangan lanjutan

1. Integrasi broker atau kustodian melalui mekanisme resmi dan berizin.
2. Data intraday atau real-time berlisensi.
3. Backtesting aturan teknikal atau tesis terstruktur.
4. Simulasi rebalancing dan optimasi portofolio.
5. Mode kolaborasi dengan penasihat atau komunitas privat.
6. Analisis transkrip paparan publik dan conference call.
7. Dukungan kelas aset atau pasar selain saham BEI.

---

## 8. Arsitektur Informasi

Navigasi utama:

1. **Overview**
2. **Portfolio**
3. **Stocks**
4. **AI Analyst**
5. **Risk Center**
6. **Alerts**
7. **Journal**
8. **Settings & Data Sources**

### Halaman Overview

- Nilai portofolio dan perubahan nilai.
- Realized dan unrealized profit/loss.
- Alokasi saham dan sektor.
- Kontributor untung/rugi terbesar.
- Ringkasan risiko utama.
- Perubahan tesis terbaru.
- Alert dengan prioritas tertinggi.
- Agenda: laporan keuangan, dividen, RUPS, dan corporate action.
- Ringkasan AI: “Apa yang perlu diperhatikan hari ini/minggu ini?”

### Halaman Detail Saham

Tab yang tersedia:

- Summary
- Position
- Fundamental
- Technical
- News & Sentiment
- Thesis
- Valuation
- Documents & Sources
- Journal

---

## 9. Kebutuhan Fungsional

### 9.1 Akun dan Profil Investasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ACC-01 | Pengguna dapat membuat akun dan masuk secara aman. | P0 |
| ACC-02 | Pengguna dapat memilih horizon investasi, toleransi risiko, benchmark, dan gaya analisis. | P0 |
| ACC-03 | Pengguna dapat mengatur mata uang dasar, zona waktu, dan preferensi notifikasi. | P0 |
| ACC-04 | Pengguna dapat mengekspor dan menghapus seluruh data pribadinya. | P0 |
| ACC-05 | Sistem tidak meminta atau menyimpan PIN, OTP, maupun kata sandi broker/KSEI. | P0 |

### 9.2 Manajemen Portofolio

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PORT-01 | Pengguna dapat menambahkan transaksi beli, jual, dividen, fee, dan pajak secara manual. | P0 |
| PORT-02 | Pengguna dapat mengimpor transaksi dari template CSV. | P0 |
| PORT-03 | Sistem memvalidasi ticker, tanggal, harga, lot, dan duplikasi transaksi. | P0 |
| PORT-04 | Sistem menghitung average cost, realized P/L, unrealized P/L, dan return. | P0 |
| PORT-05 | Metode perhitungan biaya dan asumsi fee ditampilkan secara transparan. | P0 |
| PORT-06 | Pengguna dapat memiliki beberapa portofolio atau akun broker. | P1 |
| PORT-07 | Pengguna dapat menambahkan saham ke watchlist tanpa memasukkannya ke portofolio. | P0 |
| PORT-08 | Sistem menyimpan riwayat perubahan data portofolio. | P1 |

### 9.3 Overview Portofolio

| ID | Kebutuhan | Prioritas |
|---|---|---|
| DASH-01 | Menampilkan nilai pasar, modal, cash flow investasi, dan P/L. | P0 |
| DASH-02 | Menampilkan alokasi per saham dan sektor. | P0 |
| DASH-03 | Menampilkan kontribusi return per posisi. | P0 |
| DASH-04 | Menampilkan benchmark comparison dengan periode yang sama. | P1 |
| DASH-05 | Menampilkan konsentrasi serta alert material. | P0 |
| DASH-06 | Seluruh kartu data menampilkan waktu pembaruan dan status freshness. | P0 |

### 9.4 Analisis Fundamental

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FUND-01 | Menampilkan laporan laba rugi, neraca, dan arus kas historis. | P0 |
| FUND-02 | Menampilkan pertumbuhan tahunan dan kuartalan. | P0 |
| FUND-03 | Menampilkan margin, profitabilitas, leverage, likuiditas, dan kualitas arus kas. | P0 |
| FUND-04 | Metrik menyesuaikan sektor, misalnya NIM/NPL/CAR untuk bank. | P0 |
| FUND-05 | Sistem menandai perubahan material berdasarkan threshold yang terdokumentasi. | P0 |
| FUND-06 | Pengguna dapat melihat formula dan data input setiap rasio. | P0 |
| FUND-07 | Menyediakan peer comparison. | P1 |
| FUND-08 | Sistem membedakan data aktual, estimasi, dan hasil perhitungan internal. | P0 |

### 9.5 Analisis Teknikal

| ID | Kebutuhan | Prioritas |
|---|---|---|
| TECH-01 | Menampilkan candlestick, volume, dan pilihan rentang waktu. | P0 |
| TECH-02 | Menampilkan MA20, MA50, MA200, RSI, dan MACD. | P0 |
| TECH-03 | Menampilkan volatilitas, drawdown, serta relative strength terhadap benchmark. | P0 |
| TECH-04 | Menandai breakout, breakdown, atau lonjakan volume sesuai aturan eksplisit. | P0 |
| TECH-05 | Menampilkan support/resistance sebagai zona estimasi, bukan angka pasti. | P1 |
| TECH-06 | Pengguna dapat mengaktifkan atau menonaktifkan indikator. | P1 |

### 9.6 Berita, Sentimen, dan Corporate Action

| ID | Kebutuhan | Prioritas |
|---|---|---|
| NEWS-01 | Mengumpulkan berita dan keterbukaan informasi yang relevan dengan saham pengguna. | P0 |
| NEWS-02 | Menghapus duplikasi dan mengelompokkan artikel tentang peristiwa yang sama. | P0 |
| NEWS-03 | Mengklasifikasikan sentimen, materialitas, topik, dan horizon dampak. | P0 |
| NEWS-04 | Menampilkan ringkasan, sumber, penulis bila tersedia, serta tanggal publikasi/peristiwa. | P0 |
| NEWS-05 | Membedakan keterbukaan resmi, berita, opini, dan rumor. | P0 |
| NEWS-06 | Menampilkan alasan di balik klasifikasi sentimen. | P0 |
| NEWS-07 | Menyediakan kalender dividen, RUPS, laporan keuangan, dan corporate action. | P1 |
| NEWS-08 | Berita lama yang muncul kembali tidak boleh ditampilkan sebagai peristiwa baru. | P0 |

### 9.7 Investment Thesis Monitor

| ID | Kebutuhan | Prioritas |
|---|---|---|
| THESIS-01 | Pengguna dapat menulis alasan membeli, horizon, katalis, risiko, dan kondisi invalidasi. | P0 |
| THESIS-02 | Pengguna dapat menentukan indikator yang perlu dipantau dan threshold-nya. | P0 |
| THESIS-03 | Sistem menyimpan versi tesis beserta tanggal perubahan. | P0 |
| THESIS-04 | AI menghubungkan bukti baru dengan elemen tesis yang relevan. | P0 |
| THESIS-05 | AI menampilkan bukti pendukung dan penentang secara berdampingan. | P0 |
| THESIS-06 | Status tesis terdiri dari: Utuh, Perlu Dipantau, Melemah, dan Patah. | P0 |
| THESIS-07 | Perubahan status wajib disertai alasan, bukti, tanggal, dan confidence. | P0 |
| THESIS-08 | AI tidak boleh mengubah tesis atau status final tanpa konfirmasi pengguna. | P0 |
| THESIS-09 | Pengguna dapat menjadwalkan review berkala. | P1 |

### 9.8 AI Analyst

| ID | Kebutuhan | Prioritas |
|---|---|---|
| AI-01 | Pengguna dapat bertanya mengenai portofolio, saham, data, berita, dan tesis. | P0 |
| AI-02 | Jawaban menggunakan data yang tersedia dan mencantumkan sumber untuk klaim faktual. | P0 |
| AI-03 | Jawaban menampilkan tanggal cut-off atau freshness data. | P0 |
| AI-04 | AI menyebutkan jika data tidak cukup, saling bertentangan, atau tidak tersedia. | P0 |
| AI-05 | AI dapat membandingkan periode, saham, dan skenario. | P0 |
| AI-06 | AI menyediakan mode “bull case vs bear case”. | P0 |
| AI-07 | AI dapat membuat ringkasan harian, mingguan, dan event-driven. | P1 |
| AI-08 | AI tidak mengklaim kepastian harga atau keuntungan. | P0 |
| AI-09 | Setiap jawaban dapat diberi feedback benar, salah, kurang lengkap, atau sumber tidak relevan. | P0 |
| AI-10 | Pengguna dapat membuka sumber asli dari setiap kutipan atau klaim material. | P0 |

### 9.9 Risk Center

| ID | Kebutuhan | Prioritas |
|---|---|---|
| RISK-01 | Menampilkan konsentrasi per saham dan sektor. | P0 |
| RISK-02 | Menampilkan volatilitas, drawdown, serta posisi dengan kontribusi risiko terbesar. | P0 |
| RISK-03 | Menampilkan korelasi antar-posisi jika data memadai. | P1 |
| RISK-04 | Menjalankan stress test sederhana, misalnya penurunan posisi sebesar 10–30%. | P0 |
| RISK-05 | Memetakan eksposur terhadap suku bunga, kurs, komoditas, dan faktor makro. | P1 |
| RISK-06 | Menampilkan risiko likuiditas berdasarkan volume atau metrik yang tersedia. | P1 |
| RISK-07 | Menyatakan asumsi dan keterbatasan setiap perhitungan risiko. | P0 |

### 9.10 Alerts

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ALERT-01 | Pengguna dapat membuat alert harga, volume, teknikal, fundamental, berita, dan tesis. | P0 |
| ALERT-02 | Alert memiliki tingkat prioritas: Info, Perlu Ditinjau, dan Kritis. | P0 |
| ALERT-03 | Alert menjelaskan pemicu, kondisi sebelumnya, kondisi sekarang, dan dampak potensial. | P0 |
| ALERT-04 | Sistem menggabungkan alert duplikat dalam satu event. | P0 |
| ALERT-05 | Pengguna dapat menandai alert sebagai relevan atau tidak relevan. | P0 |
| ALERT-06 | Alert tidak boleh menyatakan beli/jual sebagai perintah pasti. | P0 |

### 9.11 Jurnal Investasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| JRN-01 | Pengguna dapat mencatat keputusan, alasan, ekspektasi, emosi, dan bukti pendukung. | P0 |
| JRN-02 | Catatan dapat dihubungkan ke saham, transaksi, alert, atau versi tesis. | P0 |
| JRN-03 | Pengguna dapat menjadwalkan evaluasi ulang. | P1 |
| JRN-04 | AI dapat merangkum pola keputusan setelah jumlah data mencukupi. | P1 |
| JRN-05 | AI membedakan fakta tercatat dari interpretasi terhadap perilaku pengguna. | P1 |

### 9.12 Valuasi dan Skenario

| ID | Kebutuhan | Prioritas |
|---|---|---|
| VAL-01 | Menampilkan PER, PBV, EV/EBITDA, dividend yield, dan histori valuasi jika relevan. | P0 |
| VAL-02 | Menyediakan skenario pesimistis, dasar, dan optimistis. | P1 |
| VAL-03 | Setiap skenario menampilkan asumsi yang dapat diedit pengguna. | P1 |
| VAL-04 | Nilai wajar disajikan sebagai rentang, bukan satu angka pasti. | P1 |
| VAL-05 | Model valuasi disesuaikan dengan sektor dan ketersediaan data. | P1 |
| VAL-06 | Sistem menampilkan sensitivitas hasil terhadap asumsi utama. | P1 |

---

## 10. Sistem Penilaian dan Status

Produk tidak menggunakan satu “magic score” sebagai keputusan akhir. Dimensi berikut ditampilkan secara terpisah:

- Fundamental health
- Fundamental trend
- Valuation context
- Technical condition
- News and sentiment
- Thesis integrity
- Portfolio risk contribution
- Data quality and freshness

Setiap dimensi memiliki:

- Nilai atau kategori.
- Arah perubahan.
- Faktor yang paling berpengaruh.
- Data input dan formula jika berupa perhitungan.
- Tanggal pembaruan.
- Confidence atau kualitas bukti.

### Definisi confidence

Confidence tidak berarti probabilitas harga akan naik. Confidence menggambarkan kekuatan bukti berdasarkan:

1. Otoritas dan reliabilitas sumber.
2. Kelengkapan data.
3. Kebaruan data.
4. Konsistensi antar-sumber.
5. Besarnya inferensi yang dilakukan AI.

Kategori confidence:

- **Tinggi:** sumber primer, data lengkap, terbaru, dan konsisten.
- **Sedang:** data cukup tetapi terdapat keterbatasan atau inferensi moderat.
- **Rendah:** data tidak lengkap, lama, bertentangan, atau sebagian besar berbasis interpretasi.

---

## 11. Kebutuhan AI dan Tata Kelola Model

### 11.1 Tugas AI yang diizinkan

- Ekstraksi fakta dari dokumen.
- Ringkasan laporan, berita, dan peristiwa.
- Perbandingan antarperiode.
- Klasifikasi topik, sentimen, dan materialitas.
- Pemetaan bukti ke tesis.
- Penyusunan bull case, base case, dan bear case.
- Deteksi anomali untuk ditinjau pengguna.
- Tanya-jawab berbasis sumber yang tersimpan.

### 11.2 Batasan AI

- Tidak boleh mengarang angka yang tidak tersedia.
- Tidak boleh menyajikan rumor sebagai fakta.
- Tidak boleh menyebut prediksi sebagai kepastian.
- Tidak boleh menyembunyikan konflik antar-sumber.
- Tidak boleh mengganti keputusan pengguna.
- Tidak boleh menggunakan data pengguna untuk pelatihan tanpa persetujuan eksplisit.
- Tidak boleh mengeksekusi transaksi pada MVP.

### 11.3 Format minimum jawaban AI

Jawaban analitis harus memuat, sesuai relevansi:

1. Kesimpulan singkat.
2. Bukti utama.
3. Bukti yang menentang atau keterbatasan.
4. Dampak terhadap tesis.
5. Hal yang perlu dipantau.
6. Sumber dan tanggal.
7. Confidence.

### 11.4 Evaluasi AI

Sebelum rilis, sistem dievaluasi menggunakan kumpulan pertanyaan dan dokumen uji yang mencakup:

- Akurasi ekstraksi angka laporan keuangan.
- Kesesuaian klaim dengan sumber.
- Ketepatan tanggal peristiwa.
- Kemampuan membedakan fakta dan opini.
- Ketepatan klasifikasi sentimen serta materialitas.
- Kemampuan menyatakan “data tidak cukup”.
- Konsistensi analisis sektor.
- Ketahanan terhadap instruksi berbahaya di dalam dokumen sumber.

Jawaban dengan klaim material tanpa sumber dianggap gagal.

---

## 12. Data dan Integrasi

### Kategori data

| Data | Contoh | Frekuensi target awal |
|---|---|---|
| Portofolio | Transaksi, lot, average cost | Saat pengguna memperbarui/impor |
| Harga dan volume | OHLCV saham BEI | End-of-day pada MVP |
| Fundamental | Laporan keuangan dan rasio | Saat laporan baru tersedia |
| Keterbukaan | Corporate action, RUPS, dividen | Event-driven atau pemeriksaan berkala |
| Berita | Berita emiten, sektor, dan makro | Berkala sesuai lisensi sumber |
| Benchmark | IHSG dan indeks sektoral | End-of-day pada MVP |
| Makro | BI rate, inflasi, kurs, komoditas | Harian/bulanan sesuai jenis data |

### Hierarki sumber

1. Keterbukaan resmi emiten, regulator, bursa, dan lembaga pemerintah.
2. Laporan perusahaan dan materi paparan publik.
3. Penyedia data pasar berlisensi.
4. Media tepercaya.
5. Sumber sekunder lainnya dengan label kualitas lebih rendah.

### Aturan data

- Sumber, waktu pengambilan, periode, dan satuan wajib disimpan.
- Data aktual, estimasi, dan hasil kalkulasi harus dibedakan.
- Sistem harus mendeteksi perubahan satuan, restatement, stock split, dan corporate action relevan.
- Data lama tidak boleh terlihat sebagai data terbaru.
- Sistem harus menyediakan mekanisme koreksi data dan audit trail.
- Penggunaan data pasar wajib mematuhi lisensi dan ketentuan redistribusi.

### Input portofolio awal

MVP menggunakan input manual dan CSV. Integrasi langsung hanya dilakukan jika tersedia API resmi, izin pengguna, autentikasi yang aman, serta hak penggunaan data yang jelas.

---

## 13. Model Data Tingkat Tinggi

Entitas utama:

- User
- UserPreference
- Portfolio
- Account
- Security
- Transaction
- PositionSnapshot
- PriceBar
- FinancialStatement
- FinancialMetric
- NewsArticle
- Disclosure
- CorporateAction
- Thesis
- ThesisVersion
- ThesisEvidence
- AlertRule
- AlertEvent
- JournalEntry
- AIConversation
- AIResponseCitation
- DataSource
- DataQualityRecord

Relasi penting:

- Satu pengguna dapat memiliki beberapa portofolio.
- Satu portofolio memiliki banyak transaksi dan posisi.
- Satu saham dapat memiliki banyak dokumen, metrik, berita, dan versi tesis.
- Setiap bukti tesis terhubung ke sumber tertentu.
- Setiap klaim material AI dapat ditelusuri ke satu atau lebih sumber.

---

## 14. Alur Pengguna Utama

### 14.1 Onboarding

1. Pengguna membuat akun.
2. Pengguna memilih horizon, profil risiko, dan benchmark.
3. Pengguna mengimpor CSV atau memasukkan posisi manual.
4. Sistem memvalidasi dan menampilkan preview.
5. Pengguna mengonfirmasi portofolio.
6. Sistem membuat overview dan meminta pengguna melengkapi tesis setiap posisi.

### 14.2 Meninjau penurunan harga

1. Pengguna menerima alert penurunan harga.
2. Halaman event menunjukkan pergerakan harga, volume, berita, dan kondisi pasar.
3. AI memisahkan indikasi teknikal, sentimen, dan perubahan fundamental.
4. AI menunjukkan dampak potensial terhadap tesis dan bukti tandingan.
5. Pengguna mencatat keputusan: tidak ada tindakan, pantau, tambah riset, atau transaksi manual di luar sistem.

### 14.3 Meninjau laporan keuangan baru

1. Sistem mendeteksi laporan baru.
2. Angka penting diekstrak dan divalidasi.
3. Sistem membandingkan dengan periode sebelumnya.
4. AI merangkum perubahan material dan menghubungkannya ke tesis.
5. Pengguna menerima status usulan dan mengonfirmasi atau menolaknya.

### 14.4 Tanya-jawab AI

1. Pengguna mengajukan pertanyaan.
2. Sistem mengambil data dan sumber yang relevan.
3. AI menyusun jawaban dua sisi.
4. Jawaban menampilkan citation, freshness, dan confidence.
5. Pengguna dapat membuka sumber atau memberi feedback.

---

## 15. Kebutuhan Non-Fungsional

### Performa

- Overview awal dimuat dalam target kurang dari 3 detik pada koneksi normal, di luar proses impor pertama.
- Interaksi filter dan grafik umum merespons dalam target kurang dari 1 detik setelah data tersedia.
- Jawaban AI menampilkan status proses jika memerlukan waktu lebih lama.

### Ketersediaan dan ketahanan

- Proses ingest data bersifat idempotent dan dapat diulang.
- Kegagalan satu sumber tidak boleh membuat seluruh dashboard gagal.
- Sistem menyimpan status terakhir yang berhasil beserta waktu pembaruannya.

### Aksesibilitas

- Mendukung navigasi keyboard.
- Kontras warna memenuhi WCAG AA untuk elemen utama.
- Status tidak disampaikan hanya melalui warna.
- Grafik memiliki ringkasan tekstual.

### Observability

- Logging untuk ingest, kalkulasi, alert, dan permintaan AI.
- Audit trail untuk perubahan tesis dan koreksi data.
- Monitoring biaya dan latency model AI.
- PII dan informasi sensitif tidak masuk ke log aplikasi.

---

## 16. Keamanan dan Privasi

- Enkripsi data saat transit dan tersimpan.
- Password disimpan menggunakan hashing yang kuat; MFA disiapkan untuk fase berikutnya.
- Pemisahan data antar-pengguna.
- Prinsip least privilege untuk layanan dan administrator.
- API key disimpan di secret manager, bukan di source code atau browser.
- Perlindungan terhadap prompt injection dari berita atau dokumen.
- Rate limiting dan validasi input.
- Pengguna dapat mengekspor dan menghapus datanya.
- Kebijakan retensi data harus eksplisit.
- Tidak menyimpan kredensial broker/KSEI.
- Integrasi pihak ketiga harus melalui consent yang jelas dan dapat dicabut.

---

## 17. Desain Notifikasi

Notifikasi harus menjawab empat hal:

1. Apa yang berubah?
2. Mengapa perubahan tersebut material?
3. Bagian tesis atau risiko mana yang terdampak?
4. Apa yang perlu ditinjau pengguna?

Contoh:

> **Perlu Ditinjau — Margin laba bersih menurun**  
> Margin kuartal terbaru turun dari 14,2% menjadi 10,8%. Penurunan terutama berasal dari kenaikan biaya bahan baku. Hal ini berkaitan langsung dengan asumsi tesis “margin stabil di atas 13%”. Data berasal dari laporan keuangan terbaru; confidence tinggi.

Pengguna dapat mengatur quiet hours, kanal, frekuensi ringkasan, serta jenis alert yang diikuti.

---

## 18. Acceptance Criteria MVP

MVP dianggap siap untuk pilot jika:

1. Pengguna dapat membuat portofolio dari input manual atau CSV tanpa duplikasi transaksi.
2. Perhitungan posisi dan P/L lulus pengujian terhadap dataset referensi.
3. Overview menampilkan alokasi, performa, konsentrasi, dan freshness data.
4. Setiap saham memiliki halaman fundamental, teknikal, berita, tesis, dan sumber.
5. Tesis dapat dibuat, diperbarui, diberi versi, dan dikaitkan dengan bukti.
6. Jawaban AI memiliki citation untuk seluruh klaim material.
7. AI menyatakan keterbatasan saat data tidak tersedia atau bertentangan.
8. Pengguna dapat melihat bull case dan bear case untuk setiap posisi.
9. Alert harga, volume, fundamental, berita, dan invalidasi tesis dapat dibuat serta diuji.
10. Risk Center dapat menunjukkan konsentrasi dan menjalankan stress test sederhana.
11. Tidak ada fitur eksekusi order atau penyimpanan kredensial broker.
12. Pengguna dapat menghapus akun dan seluruh data yang terkait.
13. Pengujian keamanan dasar, aksesibilitas, dan factual-grounding telah lulus.

---

## 19. Roadmap Berbasis Fase

### Fase 0 — Discovery dan validasi

- Wawancara pengguna.
- Finalisasi persona dan strategi investasi sasaran.
- Audit sumber data, lisensi, dan biaya.
- Menentukan template CSV broker prioritas.
- Membuat prototipe alur Overview → Stock → Thesis Review.
- Menyusun dataset evaluasi AI.

### Fase 1 — Portfolio foundation

- Akun, onboarding, input transaksi, CSV, posisi, P/L, dan overview.
- Harga end-of-day dan benchmark.
- Data quality serta freshness layer.

### Fase 2 — Intelligence layer

- Fundamental, teknikal, berita, sentimen, dan dokumen sumber.
- AI Analyst berbasis citation.
- Thesis Monitor dan argumentasi dua sisi.

### Fase 3 — Risk and alerts

- Risk Center, stress test, dan alert engine.
- Jurnal serta evaluasi keputusan.
- Ringkasan harian atau mingguan.

### Fase 4 — Advanced analysis

- Peer comparison, valuasi, skenario, corporate action calendar.
- Notifikasi eksternal dan laporan ekspor.
- Integrasi resmi jika lisensi dan keamanannya memenuhi syarat.

---

## 20. Risiko Produk dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| AI berhalusinasi | Keputusan berdasarkan fakta palsu | Citation wajib, retrieval terkontrol, evaluasi factuality, tombol laporkan |
| Confirmation bias | Produk hanya memperkuat posisi pengguna | Bull/bear case wajib, invalidation criteria, evidence counter-panel |
| Data terlambat atau salah | Analisis menyesatkan | Freshness label, hierarki sumber, rekonsiliasi, audit trail |
| Lisensi data tidak memadai | Risiko hukum dan layanan terhenti | Audit lisensi, penyedia resmi, batasi redistribusi |
| Overreliance pada skor | Pengguna mengabaikan konteks | Skor dipisah per dimensi, tampilkan faktor dan keterbatasan |
| Alert fatigue | Pengguna mengabaikan peringatan | Materiality ranking, deduplikasi, digest, feedback relevansi |
| Perhitungan lintas sektor keliru | Analisis fundamental tidak tepat | Metric templates berbasis sektor dan review domain |
| Kebocoran data portofolio | Kerugian privasi dan kepercayaan | Enkripsi, least privilege, isolasi tenant, secret management |
| Prompt injection dari sumber | Manipulasi output AI | Sanitasi konten, pemisahan instruksi dan data, allowlist tool |
| Backtest overfitting | Ekspektasi performa tidak realistis | Out-of-sample test, biaya transaksi, disclosure metodologi |

---

## 21. Analitik Produk

Event minimum yang dicatat tanpa menyimpan isi sensitif yang tidak diperlukan:

- onboarding_started / completed
- portfolio_import_started / validated / completed / failed
- position_viewed
- thesis_created / updated / reviewed
- source_opened
- ai_question_submitted
- ai_answer_feedback_submitted
- alert_created / opened / dismissed / marked_relevant
- journal_entry_created
- risk_scenario_run
- data_issue_reported

Analytics harus mematuhi prinsip data minimization dan preferensi consent pengguna.

---

## 22. Pertanyaan Terbuka

Keputusan berikut perlu diselesaikan pada fase discovery:

1. Apakah target awal khusus investor jangka panjang atau juga swing investor?
2. Broker dan format CSV mana yang diprioritaskan?
3. Apakah MVP hanya menggunakan data end-of-day?
4. Penyedia harga, fundamental, berita, dan corporate action mana yang memiliki lisensi sesuai?
5. Apakah produk hanya untuk penggunaan pribadi atau akan menjadi SaaS multi-user?
6. Model valuasi sektor apa yang masuk versi pertama?
7. Apakah notifikasi eksternal diperlukan pada MVP?
8. Apakah pengguna dapat mengubah formula rasio dan threshold?
9. Bahasa awal: Indonesia saja atau bilingual?
10. Berapa batas biaya AI per pengguna yang dapat diterima?

---

## 23. Keputusan Awal yang Direkomendasikan

- Mulai dengan web desktop-first dan tetap responsif untuk mobile.
- Fokus pada saham BEI yang dimiliki atau masuk watchlist pengguna.
- Gunakan data end-of-day untuk MVP.
- Gunakan input manual dan CSV sebelum integrasi akun broker.
- Jadikan Thesis Monitor sebagai diferensiasi utama.
- Tampilkan skor per dimensi; hindari satu skor rekomendasi.
- Wajibkan citation, freshness, counter-evidence, dan confidence pada output AI.
- Jangan menyediakan eksekusi transaksi pada fase awal.
- Mulai dengan pengguna tunggal/private beta sebelum SaaS publik.

---

## 24. Referensi Awal

- [OJK — Buku Pasar Modal: Analisis Fundamental dan Teknikal](https://sikapiuangmu.ojk.go.id/FrontEnd/LiterasiPerguruanTinggi/assets/pdf/Buku%203%20-%20Pasar%20Modal.pdf)
- [KSEI — Fasilitas AKSes](https://akses.ksei.co.id/)
- [KSEI — Panduan Portofolioku](https://web.ksei.co.id/files/Panduan_Pengguna_Web_AKSes_-_Portofolioku.pdf)

---

## 25. Disclaimer Produk

Produk menyediakan informasi dan alat bantu analisis, bukan rekomendasi investasi personal, penawaran, atau jaminan hasil. Data dan analisis dapat terlambat, tidak lengkap, atau mengandung kesalahan. Pengguna tetap bertanggung jawab untuk memverifikasi informasi dan mengambil keputusan sesuai tujuan serta toleransi risikonya.

