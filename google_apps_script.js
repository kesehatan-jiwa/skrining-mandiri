// =============================================================================
//  GOOGLE APPS SCRIPT (GAS) — SKRINING KESEHATAN JIWA PUSKESMAS LOK BAHU
// =============================================================================
//  Petunjuk Singkat:
//  1. Buat Google Spreadsheet baru di https://sheets.new
//  2. Beri nama: "Data Skrining Kesehatan Jiwa — Puskesmas Lok Bahu"
//  3. Buka menu Extensions (Ekstensi) > Apps Script
//  4. Hapus seluruh isi di editor, lalu PASTE seluruh kode di bawah ini
//  5. Jalankan fungsi "setupSpreadsheet" sekali (pilih setupSpreadsheet > klik Run/Jalankan)
//     -> Spreadsheet otomatis membuat sheet 'Semua_Data', 'Dashboard_Grafik', format warna, & Diagram Bulat!
//  6. Klik tombol "Deploy" (Terapkan) di pojok kanan atas > "New deployment" (Penerapan baru)
//  7. Pilih jenis: "Web app" (Aplikasi web)
//     - Execute as: "Me" (Saya)
//     - Who has access: "Anyone" (Siapa saja)
//  8. Klik Deploy > Salin Web App URL
//  9. Tempelkan URL tersebut ke file 'assets/js/config.js' pada baris gasEndpointURL: "..."
// =============================================================================
//
//  KOLOM Semua_Data (18 kolom):
//  1  Waktu Skrining
//  2  Instrumen
//  3  Status Risiko
//  4  Ringkasan Hasil
//  5  Nama Lengkap
//  6  NIK
//  7  Tanggal Lahir
//  8  Usia
//  9  Jenis Kelamin
//  10 No. WA Siswa/Pasien
//  11 No. WA Orang Tua / Wali       ← BARU
//  12 Alamat
//  13 Asal Sekolah                   ← BARU (kolom sendiri)
//  14 Kelas                          ← BARU (kolom sendiri)
//  15 Status Khusus (Kawin/Hamil/Usia)
//  16 Nama Ortu / Wali Pendamping    ← BARU (kolom sendiri)
//  17 Detail Skor & Interpretasi
//  18 Catatan Khusus / Rujukan Segera
// =============================================================================

/**
 * Endpoint penerima data kiriman dari formulir website (POST)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Semua_Data");

    // Jika sheet belum ada, jalankan inisialisasi otomatis
    if (!sheet) {
      setupSpreadsheet();
      sheet = ss.getSheetByName("Semua_Data");
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (errJson) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var timestamp = new Date();
    var waktuStr = Utilities.formatDate(timestamp, "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");

    // Tentukan Status Berisiko
    var statusRisiko = (data.berisiko === "YA" || data.berisiko === true || data.berisiko === "Berisiko")
      ? "BERISIKO" : "TIDAK BERISIKO";

    // Catatan khusus (Q10 EPDS positif = risiko mencelakai diri)
    var catatanKhusus = "";
    if (data.q10Positif === "YA") {
      catatanKhusus = "⚠️ PERINGATAN: Ada ide mencelakai diri (EPDS Q10)! Segera hubungi pasien.";
    }

    // Detail skor berdasarkan instrumen
    var detailSkor = "-";
    if (data.skorDepresi !== undefined) {
      detailSkor = "Depresi: " + data.skorDepresi + " (" + (data.hasilDepresi || "") + "), "
                 + "Cemas: " + data.skorKecemasan + " (" + (data.hasilKecemasan || "") + ")";
    } else if (data.totalSkor !== undefined) {
      detailSkor = "Skor EPDS: " + data.totalSkor + " — " + (data.interpretasi || "");
    } else if (data.hasilAnsietas) {
      detailSkor = "Ansietas: " + data.hasilAnsietas + ", Depresi: " + data.hasilDepresi;
    }

    // ── BARIS DATA SEMUA_DATA (18 kolom) ─────────────────────────────────────
    var rowData = [
      waktuStr,                                                         // 1  Waktu Skrining
      data.instrumen || "-",                                            // 2  Instrumen
      statusRisiko,                                                     // 3  Status Risiko
      data.ringkasan || "-",                                            // 4  Ringkasan Hasil
      data.nama || "-",                                                 // 5  Nama Lengkap
      data.nik ? "'" + data.nik : "-",                                  // 6  NIK
      data.tanggalLahir || "-",                                         // 7  Tanggal Lahir
      data.usia || "-",                                                 // 8  Usia
      data.jenisKelamin || "-",                                         // 9  Jenis Kelamin
      data.noHp    ? "'" + data.noHp    : "-",                         // 10 No. WA Siswa/Pasien
      data.noHpOrtu ? "'" + data.noHpOrtu : "-",                       // 11 No. WA Orang Tua / Wali
      data.alamat || "-",                                               // 12 Alamat
      data.asalSekolah || "-",                                          // 13 Asal Sekolah
      data.kelas || "-",                                                // 14 Kelas
      data.statusKawin || data.statusKehamilan || data.kelompokUsia || "-", // 15 Status Khusus
      data.namaOrtu || "-",                                             // 16 Nama Ortu / Wali Pendamping
      detailSkor,                                                       // 17 Detail Skor & Interpretasi
      catatanKhusus                                                     // 18 Catatan Khusus / Rujukan Segera
    ];

    sheet.appendRow(rowData);

    // Tandai warna baris terakhir secara visual
    var lastRow = sheet.getLastRow();
    var statusCell = sheet.getRange(lastRow, 3);
    if (statusRisiko === "BERISIKO") {
      statusCell.setBackground("#fee2e2").setFontColor("#991b1b").setFontWeight("bold");
      if (data.q10Positif === "YA") {
        sheet.getRange(lastRow, 1, 1, rowData.length).setBackground("#fef2f2");
      }
    } else {
      statusCell.setBackground("#d1fae5").setFontColor("#065f46").setFontWeight("bold");
    }

    // Simpan juga ke sheet instrumen masing-masing
    simpanKeSheetInstrumen(ss, data, waktuStr, statusRisiko);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET request untuk cek status endpoint
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    faskes: "Puskesmas Lok Bahu",
    layanan: "Skrining Kesehatan Jiwa Digital",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper — simpan detail ke tab khusus per instrumen
 *
 * Detail_PHQ4    (16 kolom):
 *   Waktu | Nama | Asal Sekolah | Kelas | No. WA Siswa | No. WA Ortu | Status |
 *   Skor Depresi | Hasil Depresi | Skor Cemas | Hasil Cemas | Q1 | Q2 | Q3 | Q4
 *
 * Detail_EPDS    (18 kolom):
 *   Waktu | Nama | No. WA | Status | Status Kehamilan |
 *   Total Skor | Interpretasi | Q10 Harm Self? | Q1–Q10
 *
 * Detail_MINDHEAR (17 kolom):
 *   Waktu | Nama | Asal Sekolah | Kelas | No. WA Siswa | No. WA Ortu | Status |
 *   Kelompok Usia | Nama Ortu/Wali | Hasil Ansietas | Hasil Depresi |
 *   A1 | A2 | A3 | B1 | B2 | B3
 */
function simpanKeSheetInstrumen(ss, data, waktuStr, statusRisiko) {
  var instrumen = (data.instrumen || "").toUpperCase();
  var sheetName = "";
  if (instrumen.indexOf("PHQ") !== -1)      sheetName = "Detail_PHQ4";
  else if (instrumen.indexOf("EPDS") !== -1)     sheetName = "Detail_EPDS";
  else if (instrumen.indexOf("MINDHEAR") !== -1) sheetName = "Detail_MINDHEAR";
  if (!sheetName) return;

  var sh = ss.getSheetByName(sheetName);
  if (!sh) return;

  if (sheetName === "Detail_PHQ4") {
    // 16 kolom
    sh.appendRow([
      waktuStr,                                     // 1  Waktu
      data.nama || "-",                             // 2  Nama Pasien
      data.asalSekolah || "-",                      // 3  Asal Sekolah
      data.kelas || "-",                            // 4  Kelas
      data.noHp    ? "'" + data.noHp    : "-",      // 5  No. WA Siswa
      data.noHpOrtu ? "'" + data.noHpOrtu : "-",    // 6  No. WA Orang Tua
      statusRisiko,                                 // 7  Status
      data.skorDepresi   !== undefined ? data.skorDepresi   : "-",  // 8  Skor Depresi
      data.hasilDepresi  || "-",                    // 9  Hasil Depresi
      data.skorKecemasan !== undefined ? data.skorKecemasan : "-",  // 10 Skor Cemas
      data.hasilKecemasan || "-",                   // 11 Hasil Cemas
      data.q1 !== undefined ? data.q1 : "-",        // 12 Q1
      data.q2 !== undefined ? data.q2 : "-",        // 13 Q2
      data.q3 !== undefined ? data.q3 : "-",        // 14 Q3
      data.q4 !== undefined ? data.q4 : "-"         // 15 Q4
    ]);

  } else if (sheetName === "Detail_EPDS") {
    // 18 kolom (tidak ada sekolah/ortu — EPDS untuk ibu hamil/nifas)
    sh.appendRow([
      waktuStr,                                     // 1  Waktu
      data.nama || "-",                             // 2  Nama Pasien
      data.noHp ? "'" + data.noHp : "-",            // 3  No. WA
      statusRisiko,                                 // 4  Status
      data.statusKehamilan || "-",                  // 5  Status Kehamilan
      data.totalSkor !== undefined ? data.totalSkor : "-",  // 6  Total Skor
      data.interpretasi || "-",                     // 7  Interpretasi
      data.q10Positif || "TIDAK",                   // 8  Q10 Harm Self?
      data.q1  !== undefined ? data.q1  : "-",      // 9  Q1
      data.q2  !== undefined ? data.q2  : "-",      // 10 Q2
      data.q3  !== undefined ? data.q3  : "-",      // 11 Q3
      data.q4  !== undefined ? data.q4  : "-",      // 12 Q4
      data.q5  !== undefined ? data.q5  : "-",      // 13 Q5
      data.q6  !== undefined ? data.q6  : "-",      // 14 Q6
      data.q7  !== undefined ? data.q7  : "-",      // 15 Q7
      data.q8  !== undefined ? data.q8  : "-",      // 16 Q8
      data.q9  !== undefined ? data.q9  : "-",      // 17 Q9
      data.q10 !== undefined ? data.q10 : "-"       // 18 Q10
    ]);

  } else if (sheetName === "Detail_MINDHEAR") {
    // 17 kolom
    sh.appendRow([
      waktuStr,                                     // 1  Waktu
      data.nama || "-",                             // 2  Nama Pasien
      data.asalSekolah || "-",                      // 3  Asal Sekolah
      data.kelas || "-",                            // 4  Kelas
      data.noHp    ? "'" + data.noHp    : "-",      // 5  No. WA Siswa
      data.noHpOrtu ? "'" + data.noHpOrtu : "-",    // 6  No. WA Orang Tua
      statusRisiko,                                 // 7  Status
      data.kelompokUsia || "-",                     // 8  Kelompok Usia
      data.namaOrtu || "-",                         // 9  Nama Ortu / Wali Pendamping
      data.hasilAnsietas || "-",                    // 10 Hasil Ansietas
      data.hasilDepresi  || "-",                    // 11 Hasil Depresi
      data.a1 || "-",                               // 12 A1 (Gelisah)
      data.a2 || "-",                               // 13 A2 (Khawatir)
      data.a3 || "-",                               // 14 A3 (Tegang)
      data.b1 || "-",                               // 15 B1 (Sedih)
      data.b2 || "-",                               // 16 B2 (Hilang Minat)
      data.b3 || "-"                                // 17 B3 (Lelah)
    ]);
  }
}

/**
 * =============================================================================
 * SETUP OTOMATIS SPREADSHEET
 * Jalankan fungsi ini SEKALI di editor Apps Script untuk membuat:
 * 1. Sheet 'Dashboard_Grafik' dengan DIAGRAM BULAT (Pie/Donut Chart)
 * 2. Sheet 'Semua_Data' dengan 18 kolom header lengkap
 * 3. Sheet detail PHQ-4, EPDS, dan Mini MINDHEAR (dengan kolom terbaru)
 * =============================================================================
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 1. TAB DASHBOARD_GRAFIK ────────────────────────────────────────────────
  var dash = ss.getSheetByName("Dashboard_Grafik");
  if (!dash) {
    dash = ss.insertSheet("Dashboard_Grafik", 0);
  } else {
    dash.clear();
  }
  dash.setTabColor("#6366f1");

  dash.getRange("A1:G1").merge()
    .setValue("📊 DASHBOARD & DIAGRAM SKRINING KESEHATAN JIWA — PUSKESMAS LOK BAHU")
    .setFontWeight("bold").setFontSize(14)
    .setBackground("#4338ca").setFontColor("#ffffff")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  dash.setRowHeight(1, 40);

  dash.getRange("A2:G2").merge()
    .setValue("Diagram lingkaran (Donut Chart) dan ringkasan proporsi Berisiko vs Tidak Berisiko ter-update otomatis secara real-time.")
    .setFontSize(9).setFontColor("#4b5563").setHorizontalAlignment("center");
  dash.setRowHeight(2, 22);

  dash.getRange("A4:C4").setValues([["Status Skrining", "Jumlah Pasien", "Persentase"]])
    .setFontWeight("bold").setBackground("#e0e7ff").setFontColor("#312e81")
    .setHorizontalAlignment("center");

  dash.getRange("A5:C5").setValues([["BERISIKO", '=COUNTIF(Semua_Data!C2:C,"BERISIKO")', '=IF(B7>0,B5/B7,0)']])
    .setBackground("#fee2e2").setFontColor("#991b1b").setFontWeight("bold");
  dash.getRange("C5").setNumberFormat("0.0%");

  dash.getRange("A6:C6").setValues([["TIDAK BERISIKO", '=COUNTIF(Semua_Data!C2:C,"TIDAK BERISIKO")', '=IF(B7>0,B6/B7,0)']])
    .setBackground("#d1fae5").setFontColor("#065f46").setFontWeight("bold");
  dash.getRange("C6").setNumberFormat("0.0%");

  dash.getRange("A7:C7").setValues([["TOTAL RESPONDEN", '=COUNTA(Semua_Data!A2:A)', '=IF(B7>0,1,0)']])
    .setBackground("#f3f4f6").setFontWeight("bold");
  dash.getRange("C7").setNumberFormat("0.0%");

  dash.getRange("E4:G4").setValues([["Kategori Instrumen", "Jumlah Pengisi", "Berisiko"]])
    .setFontWeight("bold").setBackground("#e0e7ff").setFontColor("#312e81")
    .setHorizontalAlignment("center");
  dash.getRange("E5:G5").setValues([["PHQ-4 (Dewasa)", '=COUNTIF(Semua_Data!B2:B,"*PHQ*")', '=COUNTIFS(Semua_Data!B2:B,"*PHQ*",Semua_Data!C2:C,"BERISIKO")']]);
  dash.getRange("E6:G6").setValues([["EPDS (Bumil/Nifas)", '=COUNTIF(Semua_Data!B2:B,"*EPDS*")', '=COUNTIFS(Semua_Data!B2:B,"*EPDS*",Semua_Data!C2:C,"BERISIKO")']]);
  dash.getRange("E7:G7").setValues([["Mini MINDHEAR (Remaja)", '=COUNTIF(Semua_Data!B2:B,"*MINDHEAR*")', '=COUNTIFS(Semua_Data!B2:B,"*MINDHEAR*",Semua_Data!C2:C,"BERISIKO")']]);

  dash.getRange("A9:G10").merge()
    .setValue("💡 Petunjuk Petugas: Klik sheet 'Semua_Data' untuk melihat identitas lengkap responden dan no. WA pasien yang perlu ditindaklanjuti. Kolom No. WA Orang Tua tersedia untuk siswa PHQ-4 & MINDHEAR.")
    .setFontSize(9).setBackground("#fef3c7").setFontColor("#92400e").setWrap(true);

  var charts = dash.getCharts();
  for (var i = 0; i < charts.length; i++) dash.removeChart(charts[i]);

  var chartBuilder = dash.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dash.getRange("A4:B6"))
    .setPosition(12, 1, 0, 0)
    .setOption("title", "Diagram Lingkaran: Proporsi Pasien Berisiko vs Tidak Berisiko")
    .setOption("titleTextStyle", { color: "#312e81", fontSize: 13, bold: true })
    .setOption("is3D", false)
    .setOption("pieHole", 0.45)
    .setOption("slices", {
      0: { color: "#ef4444" },
      1: { color: "#10b981" }
    })
    .setOption("width", 560)
    .setOption("height", 360)
    .build();
  dash.insertChart(chartBuilder);

  // ── 2. TAB SEMUA_DATA (18 kolom) ──────────────────────────────────────────
  var raw = ss.getSheetByName("Semua_Data");
  if (!raw) raw = ss.insertSheet("Semua_Data", 1);
  raw.setTabColor("#10b981");

  var headers = [
    "Waktu Skrining",          // 1
    "Instrumen",               // 2
    "Status Risiko",           // 3
    "Ringkasan Hasil",         // 4
    "Nama Lengkap",            // 5
    "NIK",                     // 6
    "Tanggal Lahir",           // 7
    "Usia",                    // 8
    "Jenis Kelamin",           // 9
    "No. WA Siswa/Pasien",     // 10
    "No. WA Orang Tua / Wali", // 11  ← BARU
    "Alamat",                  // 12
    "Asal Sekolah",            // 13  ← BARU
    "Kelas",                   // 14  ← BARU
    "Status Khusus",           // 15
    "Nama Ortu / Wali",        // 16  ← BARU
    "Detail Skor & Interpretasi",       // 17
    "Catatan Khusus / Rujukan Segera"   // 18
  ];
  raw.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#4338ca").setFontColor("#ffffff")
    .setHorizontalAlignment("center");
  raw.setFrozenRows(1);

  // Lebar kolom
  for (var c = 1; c <= headers.length; c++) raw.setColumnWidth(c, 130);
  raw.setColumnWidth(1,  160);  // Waktu
  raw.setColumnWidth(4,  200);  // Ringkasan
  raw.setColumnWidth(5,  180);  // Nama
  raw.setColumnWidth(10, 150);  // No. WA Siswa
  raw.setColumnWidth(11, 160);  // No. WA Ortu
  raw.setColumnWidth(12, 220);  // Alamat
  raw.setColumnWidth(13, 180);  // Asal Sekolah
  raw.setColumnWidth(15, 180);  // Status Khusus
  raw.setColumnWidth(16, 180);  // Nama Ortu
  raw.setColumnWidth(17, 250);  // Detail Skor
  raw.setColumnWidth(18, 270);  // Catatan Khusus

  // ── 3. TAB DETAIL_PHQ4 (15 kolom) ─────────────────────────────────────────
  var phq = ss.getSheetByName("Detail_PHQ4");
  if (!phq) phq = ss.insertSheet("Detail_PHQ4", 2);
  phq.setTabColor("#4338ca");
  phq.getRange(1, 1, 1, 15).setValues([[
    "Waktu",            // 1
    "Nama Pasien",      // 2
    "Asal Sekolah",     // 3  ← BARU
    "Kelas",            // 4  ← BARU
    "No. WA Siswa",     // 5
    "No. WA Orang Tua", // 6  ← BARU
    "Status Risiko",    // 7
    "Skor Depresi (PHQ-2)",  // 8
    "Hasil Depresi",    // 9
    "Skor Cemas (GAD-2)",    // 10
    "Hasil Cemas",      // 11
    "Q1 (Kurang Minat)", // 12
    "Q2 (Murung)",      // 13
    "Q3 (Cemas/Tegang)", // 14
    "Q4 (Tidak Bisa Stop Khawatir)" // 15
  ]]).setFontWeight("bold").setBackground("#312e81").setFontColor("#ffffff");
  phq.setFrozenRows(1);
  for (var cp = 1; cp <= 15; cp++) phq.setColumnWidth(cp, 150);

  // ── 4. TAB DETAIL_EPDS (18 kolom) — tidak berubah ─────────────────────────
  var epds = ss.getSheetByName("Detail_EPDS");
  if (!epds) epds = ss.insertSheet("Detail_EPDS", 3);
  epds.setTabColor("#831843");
  epds.getRange(1, 1, 1, 18).setValues([[
    "Waktu", "Nama Pasien", "No. WA", "Status Risiko", "Status Kehamilan",
    "Total Skor EPDS", "Interpretasi", "Q10 Mencelakai Diri?",
    "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"
  ]]).setFontWeight("bold").setBackground("#831843").setFontColor("#ffffff");
  epds.setFrozenRows(1);
  for (var ce = 1; ce <= 18; ce++) epds.setColumnWidth(ce, 140);

  // ── 5. TAB DETAIL_MINDHEAR (17 kolom) ─────────────────────────────────────
  var mh = ss.getSheetByName("Detail_MINDHEAR");
  if (!mh) mh = ss.insertSheet("Detail_MINDHEAR", 4);
  mh.setTabColor("#1e1b4b");
  mh.getRange(1, 1, 1, 17).setValues([[
    "Waktu",              // 1
    "Nama Pasien",        // 2
    "Asal Sekolah",       // 3  ← BARU
    "Kelas",              // 4  ← BARU
    "No. WA Siswa",       // 5
    "No. WA Orang Tua",   // 6  ← BARU
    "Status Risiko",      // 7
    "Kelompok Usia",      // 8
    "Nama Ortu / Wali Pendamping", // 9
    "Hasil Ansietas",     // 10
    "Hasil Depresi",      // 11
    "A1 (Gelisah)",       // 12
    "A2 (Khawatir Berlebih)", // 13
    "A3 (Otot Tegang)",   // 14
    "B1 (Sedih/Nangis)",  // 15
    "B2 (Hilang Minat)",  // 16
    "B3 (Lelah/Kurang Energi)" // 17
  ]]).setFontWeight("bold").setBackground("#1e1b4b").setFontColor("#ffffff");
  mh.setFrozenRows(1);
  for (var cm = 1; cm <= 17; cm++) mh.setColumnWidth(cm, 150);

  // ── Notifikasi selesai ─────────────────────────────────────────────────────
  try {
    SpreadsheetApp.getUi().alert(
      "✅ Inisialisasi Berhasil!",
      "Sheet berhasil dibuat dengan kolom terbaru:\n\n" +
      "• Semua_Data     : 18 kolom (+ No. WA Ortu, Asal Sekolah, Kelas, Nama Ortu)\n" +
      "• Detail_PHQ4    : 15 kolom (+ Asal Sekolah, Kelas, No. WA Ortu)\n" +
      "• Detail_EPDS    : 18 kolom (tidak berubah)\n" +
      "• Detail_MINDHEAR: 17 kolom (+ Asal Sekolah, Kelas, No. WA Ortu)\n\n" +
      "Langkah selanjutnya:\nKlik Deploy > New Deployment > Web App\n(Who has access: Anyone) untuk mendapatkan Web App URL.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (uiErr) {
    Logger.log("✅ Inisialisasi Berhasil! Sheet siap digunakan.");
  }
}
