# 📊 Panduan Integrasi Google Sheets & Diagram Bulat Otomatis
## Skrining Kesehatan Jiwa — Puskesmas Lok Bahu

Panduan ini disiapkan khusus untuk memfasilitasi kebutuhan petugas Puskesmas/klien:
> *"untuk pengisiannya itu hasilnya langsung berbentuk diagram bulat misalnya tapi tetap ada excel keseluruhannya, jadi nanti kalau mau lihat siapa yang berisiko dan tidak berisiko enak langsung ada hasilnya"*

Dengan script dan template yang sudah disiapkan, Google Sheets Anda akan otomatis memiliki:
1. **Sheet `Dashboard_Grafik`**: Berisi **Diagram Bulat (Donut Chart)** proporsi Berisiko (Merah) vs Tidak Berisiko (Hijau), kartu total responden, dan per instrumen yang ter-update otomatis secara *real-time*.
2. **Sheet `Semua_Data`**: Berisi data excel keseluruhan responden, lengkap dengan penandaan warna hijau (Tidak Berisiko) dan merah (Berisiko).
3. **Sheet Tab Detail**: Tab khusus instrumen `Detail_PHQ4`, `Detail_EPDS`, dan `Detail_MINDHEAR`.

---

## 🚀 Langkah Cepat 5 Menit (Copy-Paste Selesai)

### 1. Buat Google Spreadsheet Baru
1. Buka browser dan kunjungi: **[https://sheets.new](https://sheets.new)**
2. Beri judul spreadsheet Anda di kiri atas, contoh:
   `Data Skrining Kesehatan Jiwa — Puskesmas Lok Bahu`

### 2. Buka Apps Script
1. Di menu Google Sheets bagian atas, klik menu **Ekstensi** (*Extensions*) → pilih **Apps Script**.
2. Akan terbuka tab baru editor script.
3. Hapus seluruh tulisan bawaan yang ada di editor (`function myFunction() { ... }`).

### 3. Salin Kode Script
1. Buka file **`google_apps_script.js`** yang ada di folder proyek ini.
2. Salin (*Copy*) seluruh isinya (Ctrl+A lalu Ctrl+C).
3. Tempelkan (*Paste*) ke editor Apps Script.
4. Klik tombol **Simpan** (ikon disket 💾 atau Ctrl+S).

### 4. Jalankan Setup Otomatis (Sekali Klik)
1. Di bilah menu Apps Script sebelah tombol Debug/Jalankan, pastikan fungsi yang dipilih adalah: **`setupSpreadsheet`**.
2. Klik tombol **Jalankan** (*Run*).
3. Jika muncul jendela *"Authorization Required" / "Otorisasi Diperlukan"*:
   - Klik **Review Permissions** (Tinjau Izin)
   - Pilih akun Google Anda
   - Klik **Advanced** (Lanjutan) di bawah kiri
   - Klik **Go to Untitled project (unsafe)** / Buka proyek
   - Klik **Allow** (Izinkan).
4. Kembali ke tab Google Spreadsheet Anda: **Selesai!** 
   - Tab **`Dashboard_Grafik`** dengan **Diagram Bulat (Donut Chart)** sudah otomatis terbentuk!
   - Tab **`Semua_Data`** sudah siap menerima respon baru.

---

### 5. Deploy sebagai Web App (Agar Website Terhubung)
1. Di tab Apps Script, klik tombol biru **Terapkan** (*Deploy*) di pojok kanan atas → pilih **Penerapan baru** (*New deployment*).
2. Klik ikon gerigi ⚙️ di sebelah *Select type* → pilih **Aplikasi web** (*Web app*).
3. Isi setelan berikut:
   - **Deskripsi**: `Form Jiwa Endpoint v1`
   - **Jalankan sebagai** (*Execute as*): **Saya** (*Me / email anda*)
   - **Siapa yang memiliki akses** (*Who has access*): **Siapa saja** (*Anyone*) *(PENTING agar responden umum bisa mengirim data)*.
4. Klik tombol **Terapkan** (*Deploy*).
5. Salin teks **URL Aplikasi Web** yang berakhiran `/exec`.
   *(Contoh: `https://script.google.com/macros/s/AKfyc.../exec`)*.

---

### 6. Tempelkan URL ke Website
1. Buka file **`assets/js/config.js`** di folder proyek Anda.
2. Cari baris `gasEndpointURL: "",` (baris ke-10).
3. Tempelkan URL tadi di dalam tanda kutip:
   ```javascript
   gasEndpointURL: "https://script.google.com/macros/s/AKfyc.../exec",
   ```
4. Simpan file `config.js`.

Sekarang, setiap kali pasien mengisi formulir (baik dari HP maupun Laptop), data otomatis masuk ke Google Sheets dan diagram bulat akan langsung bergerak menyesuaikan data terbaru! 🎉

---

## 📈 Tampilan & Kemudahan Bagi Petugas Puskesmas

### A. Melihat Siapa yang Berisiko vs Tidak Berisiko:
- Di tab **`Semua_Data`**, kolom C (**Status Risiko**) sudah diformat dengan warna:
  - 🔴 **Merah**: Pasien **BERISIKO** (butuh tindak lanjut / rujukan).
  - 🟢 **Hijau**: Pasien **TIDAK BERISIKO**.
- Untuk memfilter hanya pasien berisiko:
  1. Klik panah kecil filter di judul kolom **Status Risiko**.
  2. Centang hanya `BERISIKO`.
  3. Petugas langsung mendapatkan daftar nama, nomor WhatsApp, dan alamat pasien berisiko untuk segera dihubungi!

### B. Menampilkan ke Pimpinan / Laporan Bulanan:
- Tab **`Dashboard_Grafik`** langsung menampilkan:
  - **Diagram Donut**: Persentase pasien berisiko vs tidak berisiko.
  - **Total Responden Keseluruhan**.
  - **Breakdown per kategori instrumen** (PHQ-4 Dewasa, EPDS Bumil/Nifas, Mini MINDHEAR Remaja).
- Petugas bisa langsung mencetak halaman ini atau mengambil tangkapan layar (*screenshot*) untuk bahan laporan.

### C. Ekspor ke Excel (.xlsx) Kapan Saja:
- Di Google Sheets, klik menu **File** → **Download** → **Microsoft Excel (.xlsx)**.
- File tersimpan di komputer dan bisa dibuka offline di Microsoft Excel.
