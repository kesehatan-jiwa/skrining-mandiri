# 🧠 Aplikasi Skrining Kesehatan Jiwa Mandiri
### Puskesmas Lok Bahu, Kota Samarinda

Aplikasi web responsif untuk **skrining mandiri kesehatan jiwa** berbasis instrumen klinis terstandar:
1. **PHQ-4** (*Patient Health Questionnaire-4*) — Skrining depresi (PHQ-2) & kecemasan (GAD-2) untuk masyarakat umum dewasa.
2. **EPDS** (*Edinburgh Postnatal Depression Scale*) — Skrining depresi perinatal untuk ibu hamil dan ibu nifas (10 pertanyaan, dilengkapi *safety alert* jika ada indikasi pikiran mencelakai diri).
3. **Mini MINDHEAR Youth Scale** — Skrining ansietas dan depresi untuk anak dan remaja (kelompok usia 5–9 tahun, 10–14 tahun, dan 15–18 tahun).

---

## 🌟 Fitur Utama

1. **Desain Modern & Distinct (Indigo-Violet Deep Slate Palette)**:
   - Tampilan dirancang eksklusif dengan palet *Indigo / Violet / Slate* yang tenang dan ramah kesehatan jiwa (berbeda total dari tema Teal/Tosca Form TBC).
   - Tipografi modern Google Font *DM Sans*.
   - Animasi transisi lembut dan *glassmorphism*.

2. **Visualisasi Hasil Langsung Berbentuk Diagram Bulat (Donut Chart)**:
   - Responden langsung melihat visualisasi skor dalam bentuk **Diagram Lingkaran / Donut Chart** interaktif di halaman hasil (`hasil.html`).
   - Warna indikator dinamis: 🟢 Hijau (Normal/Tidak Berisiko), 🟡 Oranye (Ringan/Perlu Perhatian), 🔴 Merah (Signifikan/Berat).

3. **Multi-Perangkat Otomatis (Desktop & Mobile)**:
   - Pengguna HP/smartphone otomatis diarahkan ke `/mobile/` dengan navigasi praktis bawah (*bottom nav*) dan antarmuka *finger-friendly*.
   - Pengguna PC/laptop otomatis diarahkan ke `/desktop/` dengan tata letak lapang.

4. **Integrasi Google Sheets & Diagram Bulat Real-Time**:
   - Data otomatis tersimpan di Google Sheets melalui Google Apps Script (`google_apps_script.js`).
   - Tersedia sheet **`Dashboard_Grafik`** dengan Diagram Bulat otomatis untuk melihat persentase Berisiko vs Tidak Berisiko.
   - Tersedia sheet **`Semua_Data`** yang otomatis menandai warna merah untuk pasien berisiko dan hijau untuk yang tidak berisiko.

5. **Integrasi WhatsApp & Cetak PDF**:
   - Tombol langsung membuka WhatsApp petugas Puskesmas Lok Bahu (`+62 851-7117-2121`) dengan ringkasan otomatis.
   - Fitur simpan / cetak PDF resmi untuk rekam medis mandiri pasien.

---

## 📁 Struktur Berkas

```text
Form Kesehatan Jiwa/
├── index.html                           ← Router penentu perangkat (Desktop vs Mobile)
├── PANDUAN_GOOGLE_SHEETS_DAN_DIAGRAM.md  ← Panduan lengkap setup Google Sheets & Chart
├── google_apps_script.js                ← Script GAS untuk penerimaan data & auto-chart
├── logopuskesmas.png                    ← Logo resmi Puskesmas Lok Bahu
├── rancangan_form_kesehatan_jiwa.md     ← Dokumen rancangan sistem
│
├── desktop/                             ← Antarmuka Laptop & Komputer
│   ├── index.html                       ← Beranda & pemilihan kategori instrumen
│   ├── form.html                        ← Formulir 2-langkah dengan validasi usia
│   └── hasil.html                       ← Halaman hasil skrining & donut chart
│
├── mobile/                              ← Antarmuka Smartphone & Tablet
│   ├── index.html                       ← Beranda mobile ramah sentuhan
│   ├── form.html                        ← Form wizard mobile
│   └── hasil.html                       ← Hasil mobile & ringkasan skor
│
└── assets/
    ├── css/
    │   ├── desktop.css                  ← Desain sistem tema Indigo-Violet desktop
    │   └── mobile.css                   ← Desain responsif mobile & bottom bar
    ├── js/
    │   ├── config.js                    ← KONFIGURASI PUSKESMAS & ENDPOINT GAS
    │   ├── logic.js                     ← Algoritma scoring klinis PHQ-4, EPDS, Mini MINDHEAR
    │   └── router.js                    ← Router deteksi otomatis perangkat (Mobile vs Desktop)
    └── img/
        └── logopuskesmas.png
```

---

## ⚙️ Konfigurasi Puskesmas

Semua pengaturan puskesmas dan kontak terpusat di `assets/js/config.js`:
```javascript
window.FASKES_CONFIG = {
    namaFaskes: "Puskesmas Lok Bahu",
    namaPetugas: "Petugas Kesehatan Jiwa Puskesmas Lok Bahu",
    nomorWA: "6285171172121",
    alamat: "Jl. Ir. H. Nusyirwan Ismail, M.Si. (Ring Road 2) RT. 15...",
    jamLayanan: "Senin – Sabtu, 07.30 – 12.00 WITA",
    gasEndpointURL: "URL_GOOGLE_APPS_SCRIPT_ANDA_DI_SINI"
};
```

---

## 🚀 Cara Menjalankan

1. **Jalankan Secara Lokal:**
   - Cukup buka file `index.html` di browser Anda (atau via ekstensi Live Server VS Code).
   - Akses via port lokal misalnya `http://localhost:4444`.

2. **Hubungkan Google Sheets:**
   - Ikuti langkah di file **`PANDUAN_GOOGLE_SHEETS_DAN_DIAGRAM.md`**.
