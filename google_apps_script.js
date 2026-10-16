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
    var statusRisiko = (data.berisiko === "YA" || data.berisiko === true || data.berisiko === "Berisiko") ? "BERISIKO" : "TIDAK BERISIKO";
    
    // Keterangan khusus (misal jika ada Q10 EPDS positif)
    var catatanKhusus = "";
    if (data.q10Positif === "YA") {
      catatanKhusus = "⚠️ PERINGATAN: Ada ide mencelakai diri (EPDS Q10)! Segera hubungi pasien.";
    }

    // Siapkan baris data untuk "Semua_Data"
    var rowData = [
      waktuStr,
      data.instrumen || "-",
      statusRisiko,
      data.ringkasan || "-",
      data.nama || "-",
      data.nik ? "'" + data.nik : "-",
      data.tanggalLahir || "-",
      data.usia || "-",
      data.jenisKelamin || "-",
      data.noHp ? "'" + data.noHp : "-",
      data.alamat || "-",
      data.statusKawin || data.statusKehamilan || data.kelompokUsia || "-",
      data.calonPengantin || data.namaOrtu || "-",
      data.skorDepresi !== undefined ? ("Depresi: " + data.skorDepresi + " (" + (data.hasilDepresi || "") + "), Cemas: " + data.skorKecemasan + " (" + (data.hasilKecemasan || "") + ")")
        : (data.totalSkor !== undefined ? ("Skor EPDS: " + data.totalSkor + " - " + (data.interpretasi || ""))
        : (data.hasilAnsietas ? ("Ansietas: " + data.hasilAnsietas + ", Depresi: " + data.hasilDepresi) : "-")),
      catatanKhusus
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

    // Jika instrumen spesifik, simpan juga ke sheet instrumen masing-masing
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
 * Helper untuk menyimpan detail ke tab khusus instrumen
 */
function simpanKeSheetInstrumen(ss, data, waktuStr, statusRisiko) {
  var instrumen = (data.instrumen || "").toUpperCase();
  var sheetName = "";
  if (instrumen.indexOf("PHQ") !== -1) sheetName = "Detail_PHQ4";
  else if (instrumen.indexOf("EPDS") !== -1) sheetName = "Detail_EPDS";
  else if (instrumen.indexOf("MINDHEAR") !== -1) sheetName = "Detail_MINDHEAR";
  if (!sheetName) return;

  var sh = ss.getSheetByName(sheetName);
  if (!sh) return;

  if (sheetName === "Detail_PHQ4") {
    sh.appendRow([
      waktuStr, data.nama, "'" + data.noHp, statusRisiko,
      data.skorDepresi, data.hasilDepresi,
      data.skorKecemasan, data.hasilKecemasan,
      data.q1, data.q2, data.q3, data.q4
    ]);
  } else if (sheetName === "Detail_EPDS") {
    sh.appendRow([
      waktuStr, data.nama, "'" + data.noHp, statusRisiko,
      data.statusKehamilan, data.totalSkor, data.interpretasi, data.q10Positif,
      data.q1, data.q2, data.q3, data.q4, data.q5, data.q6, data.q7, data.q8, data.q9, data.q10
    ]);
  } else if (sheetName === "Detail_MINDHEAR") {
    sh.appendRow([
      waktuStr, data.nama, "'" + data.noHp, statusRisiko,
      data.kelompokUsia, data.namaOrtu,
      data.hasilAnsietas, data.hasilDepresi,
      data.a1, data.a2, data.a3, data.b1, data.b2, data.b3
    ]);
  }
}

/**
 * =============================================================================
 * SETUP OTOMATIS SPREADSHEET
 * Jalankan fungsi ini SEKALI di editor Apps Script untuk membuat:
 * 1. Sheet 'Dashboard_Grafik' dengan DIAGRAM BULAT (Pie Chart) Berisiko vs Tidak Berisiko
 * 2. Sheet 'Semua_Data' dengan Header & Formula
 * 3. Sheet detail PHQ-4, EPDS, dan Mini MINDHEAR
 * =============================================================================
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. SETUP TAB DASHBOARD_GRAFIK
  var dash = ss.getSheetByName("Dashboard_Grafik");
  if (!dash) {
    dash = ss.insertSheet("Dashboard_Grafik", 0);
  } else {
    dash.clear();
  }
  dash.setTabColor("#6366f1");

  // Judul Dashboard
  dash.getRange("A1:G1").merge()
    .setValue("📊 DASHBOARD & DIAGRAM SKRINING KESEHATAN JIWA — PUSKESMAS LOK BAHU")
    .setFontWeight("bold").setFontSize(14)
    .setBackground("#4338ca").setFontColor("#ffffff")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  dash.setRowHeight(1, 40);

  // Subtitle
  dash.getRange("A2:G2").merge()
    .setValue("Diagram lingkaran (Donut Chart) dan ringkasan proporsi Berisiko vs Tidak Berisiko ter-update otomatis secara real-time.")
    .setFontSize(9).setFontColor("#4b5563").setHorizontalAlignment("center");
  dash.setRowHeight(2, 22);

  // Tabel Rekapitulasi untuk Sumber Diagram
  dash.getRange("A4:C4").setValues([["Status Skrining", "Jumlah Pasien", "Persentase"]])
    .setFontWeight("bold").setBackground("#e0e7ff").setFontColor("#312e81")
    .setHorizontalAlignment("center");
  
  dash.getRange("A5:C5").setValues([["BERISIKO", '=COUNTIF(Semua_Data!C2:C, "BERISIKO")', '=IF(B7>0, B5/B7, 0)']])
    .setBackground("#fee2e2").setFontColor("#991b1b").setFontWeight("bold");
  dash.getRange("C5").setNumberFormat("0.0%");

  dash.getRange("A6:C6").setValues([["TIDAK BERISIKO", '=COUNTIF(Semua_Data!C2:C, "TIDAK BERISIKO")', '=IF(B7>0, B6/B7, 0)']])
    .setBackground("#d1fae5").setFontColor("#065f46").setFontWeight("bold");
  dash.getRange("C6").setNumberFormat("0.0%");

  dash.getRange("A7:C7").setValues([["TOTAL RESPONDEN", '=COUNTA(Semua_Data!A2:A)', '=IF(B7>0, 1, 0)']])
    .setBackground("#f3f4f6").setFontWeight("bold");
  dash.getRange("C7").setNumberFormat("0.0%");

  // Kartu Ringkasan Instrumen
  dash.getRange("E4:G4").setValues([["Kategori Instrumen", "Jumlah Pengisi", "Berisiko"]])
    .setFontWeight("bold").setBackground("#e0e7ff").setFontColor("#312e81")
    .setHorizontalAlignment("center");
  dash.getRange("E5:G5").setValues([["PHQ-4 (Dewasa)", '=COUNTIF(Semua_Data!B2:B, "*PHQ*")', '=COUNTIFS(Semua_Data!B2:B, "*PHQ*", Semua_Data!C2:C, "BERISIKO")']]);
  dash.getRange("E6:G6").setValues([["EPDS (Bumil/Nifas)", '=COUNTIF(Semua_Data!B2:B, "*EPDS*")', '=COUNTIFS(Semua_Data!B2:B, "*EPDS*", Semua_Data!C2:C, "BERISIKO")']]);
  dash.getRange("E7:G7").setValues([["Mini MINDHEAR (Remaja)", '=COUNTIF(Semua_Data!B2:B, "*MINDHEAR*")', '=COUNTIFS(Semua_Data!B2:B, "*MINDHEAR*", Semua_Data!C2:C, "BERISIKO")']]);

  // Kotak Info Callout
  dash.getRange("A9:G10").merge()
    .setValue("💡 Petunjuk Petugas: Klik sheet 'Semua_Data' untuk melihat identitas lengkap responden dan no. WA pasien yang perlu ditindaklanjuti.")
    .setFontSize(9).setBackground("#fef3c7").setFontColor("#92400e").setWrap(true);

  // Buat DIAGRAM LINGKARAN / BULAT (Pie/Donut Chart)
  var charts = dash.getCharts();
  for (var i = 0; i < charts.length; i++) {
    dash.removeChart(charts[i]);
  }

  var chartBuilder = dash.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dash.getRange("A4:B6"))
    .setPosition(12, 1, 0, 0)
    .setOption("title", "Diagram Lingkaran: Proporsi Pasien Berisiko vs Tidak Berisiko")
    .setOption("titleTextStyle", { color: "#312e81", fontSize: 13, bold: true })
    .setOption("is3D", false)
    .setOption("pieHole", 0.45) // Menjadikannya Diagram Donut modern
    .setOption("slices", {
      0: { color: "#ef4444" }, // BERISIKO = Merah
      1: { color: "#10b981" }  // TIDAK BERISIKO = Hijau
    })
    .setOption("width", 560)
    .setOption("height", 360)
    .build();

  dash.insertChart(chartBuilder);

  // 2. SETUP TAB SEMUA_DATA (EXCEL KESELURUHAN)
  var raw = ss.getSheetByName("Semua_Data");
  if (!raw) raw = ss.insertSheet("Semua_Data", 1);
  raw.setTabColor("#10b981");

  var headers = [
    "Waktu Skrining", "Instrumen", "Status Risiko", "Ringkasan Hasil",
    "Nama Lengkap", "NIK", "Tanggal Lahir", "Usia", "Jenis Kelamin",
    "No. WhatsApp", "Alamat", "Status Khusus", "Ket Tambahan",
    "Detail Skor & Interpretasi", "Catatan Khusus / Rujukan Segera"
  ];
  raw.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#4338ca").setFontColor("#ffffff")
    .setHorizontalAlignment("center");
  raw.setFrozenRows(1);

  // Auto lebar kolom
  for (var c = 1; c <= headers.length; c++) {
    raw.setColumnWidth(c, 140);
  }
  raw.setColumnWidth(1, 160);
  raw.setColumnWidth(3, 140);
  raw.setColumnWidth(4, 200);
  raw.setColumnWidth(5, 180);
  raw.setColumnWidth(11, 220);
  raw.setColumnWidth(14, 240);
  raw.setColumnWidth(15, 260);

  // 3. SETUP TAB DETAIL PHQ4
  var phq = ss.getSheetByName("Detail_PHQ4");
  if (!phq) phq = ss.insertSheet("Detail_PHQ4", 2);
  phq.getRange(1, 1, 1, 12).setValues([[
    "Waktu", "Nama Pasien", "No HP", "Status",
    "Skor Depresi (PHQ-2)", "Hasil Depresi",
    "Skor Cemas (GAD-2)", "Hasil Cemas",
    "Q1 (Minat)", "Q2 (Murung)", "Q3 (Cemas)", "Q4 (Khawatir)"
  ]]).setFontWeight("bold").setBackground("#312e81").setFontColor("#ffffff");
  phq.setFrozenRows(1);

  // 4. SETUP TAB DETAIL EPDS
  var epds = ss.getSheetByName("Detail_EPDS");
  if (!epds) epds = ss.insertSheet("Detail_EPDS", 3);
  epds.getRange(1, 1, 1, 18).setValues([[
    "Waktu", "Nama Pasien", "No HP", "Status", "Status Kehamilan",
    "Total Skor", "Interpretasi", "Q10 Harm Self?",
    "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"
  ]]).setFontWeight("bold").setBackground("#831843").setFontColor("#ffffff");
  epds.setFrozenRows(1);

  // 5. SETUP TAB DETAIL MINDHEAR
  var mh = ss.getSheetByName("Detail_MINDHEAR");
  if (!mh) mh = ss.insertSheet("Detail_MINDHEAR", 4);
  mh.getRange(1, 1, 1, 14).setValues([[
    "Waktu", "Nama Pasien", "No HP", "Status", "Kelompok Usia", "Nama Orang Tua",
    "Hasil Ansietas", "Hasil Depresi",
    "A1 (Gelisah)", "A2 (Khawatir)", "A3 (Tegang)",
    "B1 (Sedih)", "B2 (Hilang Minat)", "B3 (Lelah)"
  ]]).setFontWeight("bold").setBackground("#1e1b4b").setFontColor("#ffffff");
  mh.setFrozenRows(1);

  try {
    SpreadsheetApp.getUi().alert("✅ Inisialisasi Berhasil!", 
      "Sheet 'Dashboard_Grafik' (dengan Diagram Bulat), 'Semua_Data', dan detail instrumen telah siap digunakan.\\n\\nLangkah selanjutnya:\\nKlik Deploy > New Deployment > Web App (Who has access: Anyone) untuk mendapatkan Web App URL.",
      SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (uiErr) {
    Logger.log("✅ Inisialisasi Berhasil! Sheet siap digunakan.");
  }
}
