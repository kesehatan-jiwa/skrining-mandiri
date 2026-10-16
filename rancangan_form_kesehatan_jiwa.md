# 🧠 Rancangan Web App — Skrining Kesehatan Jiwa
> Dokumen ini adalah blueprint pengembangan Form Kesehatan Jiwa.
> Konsep serupa dengan Form TB (Alpine.js, vanilla CSS, GAS/GSheet), tapi UI berbeda.

---

## 🎨 Identitas Visual (UI Theme)

| Aspek | Form TB (referensi) | Form Kesehatan Jiwa (baru) |
|---|---|---|
| **Warna Utama** | Teal (`#14b8a6`) | **Indigo-Violet** (`#6366f1`) |
| **Warna Sekunder** | Emerald, Rose | **Purple** (`#8b5cf6`), Soft Pink (`#ec4899`) |
| **Background** | Teal-50 (`#f0fdfa`) | Indigo-50 (`#eef2ff`) |
| **Font** | Plus Jakarta Sans | **DM Sans** (modern, rounded, friendly) |
| **Style** | Glassmorphism, sidebar kiri | Glassmorphism, **stepper horizontal**, card-based |
| **Mood** | Medis tegas, profesional | **Hangat, calm, tidak mengintimidasi** |

### Palet Warna Lengkap
```css
:root {
    /* Indigo - primary */
    --indigo-900: #1e1b4b;
    --indigo-800: #312e81;
    --indigo-700: #3730a3;
    --indigo-600: #4f46e5;
    --indigo-500: #6366f1;
    --indigo-400: #818cf8;
    --indigo-200: #c7d2fe;
    --indigo-100: #e0e7ff;
    --indigo-50:  #eef2ff;

    /* Violet - accent */
    --violet-600: #7c3aed;
    --violet-500: #8b5cf6;
    --violet-400: #a78bfa;

    /* Semantic */
    --success:  #10b981;  /* emerald - hasil normal */
    --warning:  #f59e0b;  /* amber - gejala ringan */
    --danger:   #ef4444;  /* red - gejala berat / risiko */
    --wa-green: #25D366;
}
```

---

## 📁 Struktur Folder

```
Form Kesehatan Jiwa/
├── index.html                  ← Landing page (pilih kategori pasien)
├── assets/
│   ├── css/
│   │   ├── desktop.css         ← Style desktop (indigo theme)
│   │   └── mobile.css          ← Style mobile
│   ├── js/
│   │   ├── config.js           ← Config faskes, WA, GAS endpoint
│   │   └── logic.js            ← Logika skoring semua instrumen
│   └── img/
│       └── poster.jpg          ← Poster (jika ada)
├── desktop/
│   ├── index.html              ← Landing desktop
│   ├── form.html               ← Form skrining desktop (stepper)
│   └── hasil.html              ← Halaman hasil desktop
└── mobile/
    ├── index.html              ← Landing mobile
    ├── form.html               ← Form skrining mobile
    └── hasil.html              ← Halaman hasil mobile
```

---

## 🔄 Alur Aplikasi (User Flow)

```
[Landing Page]
    │
    ├─ Deteksi device → redirect ke /desktop/ atau /mobile/
    │
[index.html — Pilih Kategori]
    │
    ├── 👶 Anak Usia 7–18 Tahun   ──→ [form.html?instrumen=mindhear]
    ├── 🧑 Dewasa (Umum)           ──→ [form.html?instrumen=phq4]
    └── 🤰 Ibu Hamil / Nifas       ──→ [form.html?instrumen=epds]
         │
         ▼
[form.html — Multi-step Stepper]
    Step 1: Data Diri
    Step 2: Pertanyaan Skrining (sesuai instrumen)
    Step 3: Review & Submit
         │
         ▼ (submit → kirim ke GAS/GSheet, lalu redirect)
[hasil.html — Hasil Skrining]
    - Skor & interpretasi
    - Rekomendasi tindak lanjut
    - Tombol WA ke petugas
    - Tombol cetak / PDF
```

---

## 📋 Instrumen Skrining

### 1. PHQ-4 — Dewasa Umum
**Data diri:** NIK, Nama, Tgl Lahir, JK, Alamat, No HP, Status Kawin

**4 Pertanyaan** (kondisi 2 minggu terakhir):

| No | Pertanyaan | Domain |
|---|---|---|
| 1 | Kurang/tidak bersemangat dalam kegiatan sehari-hari | Depresi (PHQ-2) |
| 2 | Merasa murung, tertekan, atau putus asa | Depresi (PHQ-2) |
| 3 | Merasa gugup, cemas, atau gelisah | Kecemasan (GAD-2) |
| 4 | Tidak mampu mengendalikan rasa khawatir | Kecemasan (GAD-2) |

**Skala jawaban (skor 0–3):**
- `0` = Tidak sama sekali
- `1` = Kurang dari 1 minggu
- `2` = Lebih dari 1 minggu
- `3` = Hampir setiap hari

**Scoring:**
| Sub-skor | Pertanyaan | Threshold | Interpretasi |
|---|---|---|---|
| PHQ-2 (Depresi) | Q1 + Q2 | < 3 | Tidak ada gejala signifikan |
| PHQ-2 (Depresi) | Q1 + Q2 | ≥ 3 | Kemungkinan gejala **depresi** |
| GAD-2 (Kecemasan) | Q3 + Q4 | < 3 | Tidak ada gejala signifikan |
| GAD-2 (Kecemasan) | Q3 + Q4 | ≥ 3 | Kemungkinan gejala **kecemasan** |

---

### 2. EPDS — Ibu Hamil & Nifas
**Data diri:** Nama, Tgl Lahir, JK, Alamat, No HP, Status Kehamilan (Hamil/Nifas)

**10 Pertanyaan** (kondisi 7 hari terakhir), pilihan a/b/c/d:

| No | Pertanyaan | Skoring |
|---|---|---|
| 1 | Mampu tertawa & merasakan hal menyenangkan | Normal (a=0, b=1, c=2, d=3) |
| 2 | Melihat ke depan dengan menyenangkan | Normal (a=0, b=1, c=2, d=3) |
| 3 | Menyalahkan diri saat sesuatu tidak berjalan baik | **Terbalik** (a=3, b=2, c=1, d=0) |
| 4 | Merasa cemas/kuatir tanpa alasan jelas | Normal (a=0, b=1, c=2, d=3) |
| 5 | Merasa takut/panik tanpa alasan jelas | **Terbalik** (a=3, b=2, c=1, d=0) |
| 6 | Banyak hal menjadi beban | **Terbalik** (a=3, b=2, c=1, d=0) |
| 7 | Merasa begitu sedih sampai sulit tidur | **Terbalik** (a=3, b=2, c=1, d=0) |
| 8 | Merasa sangat sedih sehingga menangis | **Terbalik** (a=3, b=2, c=1, d=0) |
| 9 | Merasa sedih atau susah | **Terbalik** (a=3, b=2, c=1, d=0) |
| 10 | ⚠️ Pikiran mencelakai diri sendiri | **Terbalik** (a=3, b=2, c=1, d=0) |

> **Skor maks = 30**

**Interpretasi & Tindak Lanjut:**
| Skor | Interpretasi | Penatalaksanaan |
|---|---|---|
| < 8 | Tidak depresi | Lanjutkan dukungan pada klien |
| 9–11 | Kemungkinan depresi | Skrining ulang 2–4 minggu, pertimbangkan rujukan |
| 12–13 | Kemungkinan depresi cukup tinggi | Observasi, edukasi, rujuk faskes |
| ≥ 14 | Depresi sangat mungkin | Penilaian & perawatan faskes/spesialis |
| Q10 positif (1,2,3) | ⚠️ Risiko bunuh diri | **Rujuk segera** ke psikiater |

---

### 3. Mini MINDHEAR Youth Scale — Anak & Remaja
**Target:**
- **Usia 7–9 thn** → Diisi orang tua/wali
- **Usia 10–18 thn** → Diisi sendiri

**Data diri:** Nama anak, Tgl Lahir, JK, Nama orang tua (jika 7-9 thn)

**6 Pertanyaan** (2 minggu terakhir), jawaban **Ya / Tidak**:

**Skala A — Ansietas (Kecemasan):**
| No | Pertanyaan (7-9 thn, via ortu) | Pertanyaan (10-18 thn) |
|---|---|---|
| A1 | Anak sering merasa khawatir/tidak tenang, tegang, deg-degan, gelisah terhadap hal negatif/belum tentu terjadi | Saya sering merasa khawatir... |
| A2 | Anak berpikir berlebihan dan tidak bisa mengendalikan diri terhadap hal negatif | Saya berpikir berlebihan... |
| A3 | Anak sulit tidur dan berkonsentrasi saat memikirkan hal negatif yang belum tentu terjadi | Saya sulit tidur dan berkonsentrasi... |

**Skala B — Depresi:**
| No | Pertanyaan (7-9 thn, via ortu) | Pertanyaan (10-18 thn) |
|---|---|---|
| B1 | Anak sering merasa sedih/tertekan padahal tidak ada penyebab jelas | Saya sering merasa sedih... |
| B2 | Anak tidak tertarik lagi dengan kegiatan yang biasanya dia suka | Saya tidak tertarik... |
| B3 | Anak merasa sering capek, sulit tidur, sulit fokus saat belajar | Saya merasa sering capek... |

**Scoring MINDHEAR (per skala, 3 jawaban):**
| Pola Jawaban | Interpretasi |
|---|---|
| Tidak-Tidak-Tidak / Tidak-Ya-Tidak | Tidak menunjukkan kemungkinan gejala |
| Tidak-Tidak-Ya / Ya-Tidak-Tidak / Tidak-Ya-Ya / Ya-Ya-Tidak | Gejala **Ringan** |
| Ya-Tidak-Ya / Ya-Ya-Ya | Gejala **Berat** |

---

## ⚙️ Konfigurasi (config.js)

```javascript
window.FASKES_CONFIG = {
    namaFaskes: "Puskesmas Lok Bahu",
    namaPetugas: "Petugas Kesehatan Jiwa Puskesmas Lok Bahu",
    nomorWA: "6285171172121",   // +62 851-7117-2121
    alamat: "Jl. Ir. H. Nusyirwan Ismail, M.Si. (Ring Road 2) RT. 15 (Belakang SMKN 15), Kelurahan Lok Bahu, Kecamatan Sungai Kunjang, Kota Samarinda, Kalimantan Timur 75129",
    jamLayanan: "Senin – Sabtu, 07.30 – 12.00 WITA",
    gasEndpointURL: "",  // diisi setelah deploy GAS
}
```

---

## 📊 Google Sheets — Kolom Data

### Sheet 1: PHQ-4
`Waktu | Nama | NIK | Tgl Lahir | Usia | JK | No HP | Alamat | Status Kawin | Q1 | Q2 | Q3 | Q4 | Skor PHQ-2 | Skor GAD-2 | Hasil Depresi | Hasil Kecemasan`

### Sheet 2: EPDS
`Waktu | Nama | Tgl Lahir | Usia | JK | No HP | Alamat | Status (Hamil/Nifas) | Q1..Q10 | Total Skor | Interpretasi | Q10 Positif`

### Sheet 3: MINDHEAR
`Waktu | Nama Anak | Tgl Lahir | Usia | JK | Nama Ortu | No HP | Kelompok Usia | A1 | A2 | A3 | B1 | B2 | B3 | Hasil Ansietas | Hasil Depresi`

---

## 🖥️ Komponen UI Utama

### Landing (index.html)
- Hero section dengan ilustrasi mental health
- 3 kartu kategori: Anak/Remaja, Dewasa, Ibu Hamil/Nifas
- Info faskes (jam layanan, kontak, alamat)
- Pesan disclaimer bukan pengganti diagnosis medis

### Form (form.html) — Stepper 3 langkah
```
[●──────○──────○]
Step 1: Data Diri   Step 2: Kuesioner   Step 3: Selesai
```
- Step 1: Data diri pasien
- Step 2: Pertanyaan skrining (adaptif sesuai instrumen)
- Tombol Sebelumnya / Selanjutnya / Submit

### Hasil (hasil.html)
- **Header**: Nama, tanggal, instrumen yang digunakan
- **Skor Visual**: Gauge/progress bar berwarna (hijau/kuning/merah)
- **Kartu Interpretasi**: Hasil per domain (depresi & kecemasan)
- **Rekomendasi**: Tindak lanjut berdasarkan skor
- **Action Buttons**: WA ke petugas, Cetak PDF
- ⚠️ **Alert darurat** jika Q10 EPDS positif

---

## 🔧 Tech Stack (sama dengan Form TB)

| Komponen | Teknologi |
|---|---|
| UI Framework | **Alpine.js** (reaktif, tanpa build tool) |
| CSS | Vanilla CSS, Glassmorphism, custom properties |
| Font | Google Fonts — **DM Sans** |
| Icons | Lucide Icons (CDN) |
| Data Store | **Google Sheets** via Google Apps Script |
| Hosting | GitHub Pages |

---

## ✅ Info Faskes yang Telah Dikonfirmasi

| Field | Nilai |
|---|---|
| **Nama Faskes** | Puskesmas Lok Bahu |
| **Nomor WA** | +62 851-7117-2121 (`6285171172121`) |
| **Alamat** | Jl. Ir. H. Nusyirwan Ismail, M.Si. (Ring Road 2) RT. 15 (Belakang SMKN 15), Kel. Lok Bahu, Kec. Sungai Kunjang, Samarinda, Kaltim 75129 |
| **Jam Layanan** | Senin – Sabtu, 07.30 – 12.00 WITA |
| **Instrumen** | ✅ Semua 3 instrumen (PHQ-4, EPDS, Mini MINDHEAR) |

---

## 🎯 Catatan Perbedaan Desain vs Form TB

> Wajib dibedakan agar tidak terkesan copy-paste!

| Elemen | Form TB | Form Kesehatan Jiwa |
|---|---|---|
| **Warna primer** | Teal `#14b8a6` | Indigo `#6366f1` |
| **Gradient hero** | Teal-to-dark | Indigo-to-Violet diagonal |
| **Font** | Plus Jakarta Sans | DM Sans |
| **Layout form** | Sidebar kiri + main content | Stepper horizontal (no sidebar) |
| **Kartu hasil** | Grid 2 kolom, border teal | Full-width card, accent violet |
| **Skor visual** | Badge label teks | **Radial gauge / donut chart** |
| **Background** | Flat teal-50 | Subtle **gradient mesh** indigo-purple |
| **Ilustrasi landing** | Poster/foto | Ilustrasi SVG mental health |
| **Navigasi** | Top nav + breadcrumb | Stepper progress bar di atas form |
| **Alert bahaya** | —  | Alert darurat merah jika Q10 EPDS positif |
