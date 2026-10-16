// ============================================================
//  config.js — KONFIGURASI TERPUSAT (Form Kesehatan Jiwa)
// ============================================================
window.FASKES_CONFIG = {
    namaFaskes: "Puskesmas Lok Bahu",
    namaPetugas: "Petugas Kesehatan Jiwa Puskesmas Lok Bahu",
    nomorWA: "6285171172121",
    alamat: "Jl. Ir. H. Nusyirwan Ismail, M.Si. (Ring Road 2) RT. 15 (Belakang SMKN 15), Kelurahan Lok Bahu, Kecamatan Sungai Kunjang, Kota Samarinda, Kalimantan Timur 75129",
    jamLayanan: "Senin \u2013 Sabtu, 07.30 \u2013 12.00 WITA",
    gasEndpointURL: "",

    labelInstrumen: {
        phq4:     "PHQ-4 (Dewasa Umum)",
        epds:     "EPDS (Ibu Hamil / Nifas)",
        mindhear: "Mini MINDHEAR Youth Scale (Anak & Remaja)"
    },

    buatPesanWhatsApp(dataPasien, hasil) {
        const tgl = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
        let t = `Halo Petugas ${this.namaFaskes}, saya telah mengisi formulir Skrining Kesehatan Jiwa Mandiri melalui website.%0A%0A`;
        t += `*Ringkasan Data Skrining:*%0A`;
        t += `\u2022 Nama: ${dataPasien.nama || "-"}%0A`;
        t += `\u2022 Tanggal Lahir: ${dataPasien.tanggalLahir || "-"} (${dataPasien.usia || "-"} Tahun)%0A`;
        t += `\u2022 No. HP: ${dataPasien.noHp || "-"}%0A`;
        t += `\u2022 Instrumen: ${hasil.instrumenLabel || "-"}%0A`;
        t += `\u2022 Tanggal Skrining: ${tgl}%0A`;
        t += `\u2022 Hasil: *${hasil.ringkasan || "-"}*%0A`;
        if (hasil.instrumen === "epds" && hasil.q10Positif) {
            t += `%0A\u26a0\ufe0f *PERHATIAN: Ada indikasi pikiran mencelakai diri \u2014 mohon penanganan segera!*%0A`;
        }
        t += `%0AMohon arahan dan informasi selanjutnya dari ${this.namaFaskes}. Terima kasih.`;
        return t;
    },
    getLinkWA(dataPasien, hasil) {
        return `https://wa.me/${this.nomorWA}?text=${this.buatPesanWhatsApp(dataPasien, hasil)}`;
    },
    async kirimKeGoogleSheets(payload) {
        if (!this.gasEndpointURL || this.gasEndpointURL.trim() === "") {
            console.info("[GAS] gasEndpointURL belum diisi.");
            return { sukses: false };
        }
        try {
            await fetch(this.gasEndpointURL, {
                method: "POST", mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            console.info("[GAS] Data berhasil dikirim.");
            return { sukses: true };
        } catch (err) {
            console.error("[GAS] Error:", err);
            return { sukses: false };
        }
    }
};
