// ============================================================
//  logic.js — LOGIKA SKORING (PHQ-4 | EPDS | MINDHEAR)
// ============================================================
window.SKRINING_LOGIC = {

    // ── UTILITAS ─────────────────────────────────────────────
    hitungUsia(tanggalLahir) {
        if (!tanggalLahir) return "";
        const lahir = new Date(tanggalLahir);
        const now   = new Date();
        let usia = now.getFullYear() - lahir.getFullYear();
        const m = now.getMonth() - lahir.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < lahir.getDate())) usia--;
        return usia;
    },

    kategoriUsiaMindhear(usia) {
        if (usia >= 7 && usia <= 9)   return "7-9";
        if (usia >= 10 && usia <= 18) return "10-18";
        return null;
    },

    // ── PHQ-4 ────────────────────────────────────────────────
    // Q1+Q2 = PHQ-2 (Depresi)   |   Q3+Q4 = GAD-2 (Kecemasan)
    // Skala per pertanyaan: 0=Tidak sama sekali, 1=<1 minggu,
    //                       2=>1 minggu, 3=Hampir setiap hari
    hitungPHQ4(jawaban) {
        const q = (k) => parseInt(jawaban[k] ?? 0);
        const skorDepresi    = q("q1") + q("q2");
        const skorKecemasan  = q("q3") + q("q4");
        const totalSkor      = skorDepresi + skorKecemasan;

        const hasilDepresi = skorDepresi >= 3
            ? { label: "Kemungkinan Gejala Depresi",          level: "warning", ada: true  }
            : { label: "Tidak Ada Gejala Depresi Signifikan", level: "normal",  ada: false };

        const hasilKecemasan = skorKecemasan >= 3
            ? { label: "Kemungkinan Gejala Kecemasan",          level: "warning", ada: true  }
            : { label: "Tidak Ada Gejala Kecemasan Signifikan", level: "normal",  ada: false };

        const berisiko = hasilDepresi.ada || hasilKecemasan.ada;

        return {
            instrumen: "phq4", instrumenLabel: "PHQ-4 (Dewasa Umum)",
            skorDepresi, skorKecemasan, totalSkor,
            maxSkorDepresi: 6, maxSkorKecemasan: 6, maxSkor: 12,
            hasilDepresi, hasilKecemasan,
            berisiko,
            ringkasan: berisiko ? "Berisiko – Perlu Tindak Lanjut" : "Tidak Berisiko",
            jawaban
        };
    },

    // ── EPDS ─────────────────────────────────────────────────
    // Normal  (0-1-2-3): Q1, Q2, Q4
    // Terbalik(3-2-1-0): Q3, Q5, Q6, Q7, Q8, Q9, Q10
    // Q10 positif (skor>0) = risiko bunuh diri → rujuk segera
    hitungEPDS(jawaban) {
        const normalMap   = { a: 0, b: 1, c: 2, d: 3 };
        const reversedMap = { a: 3, b: 2, c: 1, d: 0 };
        const normalQ   = [1, 2, 4];
        const reversedQ = [3, 5, 6, 7, 8, 9, 10];

        let totalSkor = 0;
        const skorPerQ = {};
        for (let i = 1; i <= 10; i++) {
            const jawab = (jawaban[`q${i}`] || "d").toLowerCase();
            const skor  = reversedQ.includes(i) ? (reversedMap[jawab] ?? 0) : (normalMap[jawab] ?? 0);
            skorPerQ[`q${i}`] = skor;
            totalSkor += skor;
        }

        const q10Positif = skorPerQ.q10 > 0;

        let interpretasi, level, penatalaksanaan;
        if (totalSkor < 8) {
            interpretasi = "Tidak Depresi"; level = "normal";
            penatalaksanaan = "Lanjutkan pemberian dukungan pada klien.";
        } else if (totalSkor <= 11) {
            interpretasi = "Kemungkinan Depresi"; level = "warning";
            penatalaksanaan = "Beri dukungan, skrining ulang dalam 2–4 minggu, pertimbangkan rujukan ke fasilitas kesehatan.";
        } else if (totalSkor <= 13) {
            interpretasi = "Kemungkinan Depresi Cukup Tinggi"; level = "danger";
            penatalaksanaan = "Observasi, beri dukungan dan edukasi, rujuk ke fasilitas kesehatan.";
        } else {
            interpretasi = "Depresi Sangat Mungkin Terjadi"; level = "danger";
            penatalaksanaan = "Perlu penilaian dan perawatan di fasilitas kesehatan / dokter spesialis.";
        }

        if (q10Positif) {
            penatalaksanaan = "\u26a0\ufe0f Rujuk SEGERA ke psikiater. Adanya pikiran mencelakai diri memerlukan penanganan segera!";
            level = "danger";
        }

        return {
            instrumen: "epds", instrumenLabel: "EPDS (Ibu Hamil / Nifas)",
            totalSkor, maxSkor: 30,
            skorPerQ, interpretasi, level, penatalaksanaan,
            q10Positif,
            berisiko: totalSkor >= 9 || q10Positif,
            ringkasan: interpretasi,
            jawaban
        };
    },

    // ── MINDHEAR ─────────────────────────────────────────────
    // Skala A (Ansietas) & Skala B (Depresi): masing-masing 3 pertanyaan Ya/Tidak
    // Pola jawaban menentukan tingkat gejala:
    //   Berat  : Ya-Tidak-Ya atau Ya-Ya-Ya
    //   Normal : Tidak-Tidak-Tidak atau Tidak-Ya-Tidak
    //   Ringan : selainnya
    hitungMINDHEAR(jawaban, kelompokUsia) {
        const interpretasiSkala = (j1, j2, j3) => {
            const y1 = j1 === "ya", y2 = j2 === "ya", y3 = j3 === "ya";
            if ((y1 && !y2 && y3) || (y1 && y2 && y3))
                return { label: "Kemungkinan Gejala Berat",            level: "danger",  skor: 3 };
            if ((!y1 && !y2 && !y3) || (!y1 && y2 && !y3))
                return { label: "Tidak Menunjukkan Kemungkinan Gejala", level: "normal",  skor: 0 };
            return   { label: "Kemungkinan Gejala Ringan",             level: "warning", skor: 1 };
        };

        const hasilAnsietas = interpretasiSkala(jawaban.a1, jawaban.a2, jawaban.a3);
        const hasilDepresi  = interpretasiSkala(jawaban.b1, jawaban.b2, jawaban.b3);
        const adaBerat      = hasilAnsietas.level === "danger" || hasilDepresi.level === "danger";
        const berisiko      = hasilAnsietas.level !== "normal" || hasilDepresi.level !== "normal";

        return {
            instrumen: "mindhear", instrumenLabel: "Mini MINDHEAR Youth Scale",
            kelompokUsia, hasilAnsietas, hasilDepresi,
            berisiko, adaBerat,
            ringkasan: adaBerat ? "Berisiko Berat – Rujuk Segera"
                      : berisiko ? "Berisiko – Perlu Perhatian"
                      : "Tidak Berisiko",
            jawaban
        };
    },

    // ── BUILD GAS PAYLOAD ─────────────────────────────────────
    buildPayload(instrumen, dataPasien, hasil) {
        const base = {
            instrumen:     instrumen.toUpperCase(),
            waktuSkrining: new Date().toLocaleString("id-ID"),
            nama:          dataPasien.nama || "",
            nik:           dataPasien.nik  || "",
            tanggalLahir:  dataPasien.tanggalLahir || "",
            usia:          dataPasien.usia || "",
            jenisKelamin:  dataPasien.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
            noHp:          dataPasien.noHp   || "",
            alamat:        dataPasien.alamat || "",
            berisiko:      hasil.berisiko ? "YA" : "TIDAK",
            ringkasan:     hasil.ringkasan || ""
        };

        if (instrumen === "phq4") return {
            ...base,
            statusKawin:    dataPasien.statusKawin || "",
            q1: hasil.jawaban.q1 ?? "", q2: hasil.jawaban.q2 ?? "",
            q3: hasil.jawaban.q3 ?? "", q4: hasil.jawaban.q4 ?? "",
            skorDepresi:    hasil.skorDepresi,
            skorKecemasan:  hasil.skorKecemasan,
            hasilDepresi:   hasil.hasilDepresi.label,
            hasilKecemasan: hasil.hasilKecemasan.label
        };

        if (instrumen === "epds") {
            const p = {
                ...base,
                statusKehamilan: dataPasien.statusKehamilan || "",
                totalSkor:       hasil.totalSkor,
                interpretasi:    hasil.interpretasi,
                q10Positif:      hasil.q10Positif ? "YA" : "TIDAK"
            };
            for (let i = 1; i <= 10; i++) p[`q${i}`] = hasil.jawaban[`q${i}`] || "";
            return p;
        }

        if (instrumen === "mindhear") return {
            ...base,
            kelompokUsia:   hasil.kelompokUsia || "",
            namaOrtu:       dataPasien.namaOrtu || "",
            a1: hasil.jawaban.a1 || "", a2: hasil.jawaban.a2 || "", a3: hasil.jawaban.a3 || "",
            b1: hasil.jawaban.b1 || "", b2: hasil.jawaban.b2 || "", b3: hasil.jawaban.b3 || "",
            hasilAnsietas:  hasil.hasilAnsietas.label,
            hasilDepresi:   hasil.hasilDepresi.label
        };

        return base;
    }
};
