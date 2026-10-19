// ============================================================
//  config.js — KONFIGURASI TERPUSAT (Form Kesehatan Jiwa)
// ============================================================
window.FASKES_CONFIG = {
    namaFaskes: "Puskesmas Lok Bahu",
    namaPetugas: "Moh. Mukhlis Noor, A.Md.Kep.",
    nomorWA: "6281250067557",
    alamat: "Jl. Ir. H. Nusyirwan Ismail, M.Si. (Ring Road 2) RT. 15 (Belakang SMKN 15), Kelurahan Lok Bahu, Kecamatan Sungai Kunjang, Kota Samarinda, Kalimantan Timur 75129",
    jamLayanan: "Senin \u2013 Sabtu, 07.30 \u2013 12.00 WITA",
    gasEndpointURL: "https://script.google.com/macros/s/AKfycbzyxah5PC0Vu4jRvU3i09WZDmgRJxVV6bNxQtCatFRJyt3IQ1WsnrnBqsGF1zMFq8nXOQ/exec",

    labelInstrumen: {
        phq4:     "PHQ-4 (Dewasa Umum)",
        epds:     "EPDS (Ibu Hamil / Nifas)",
        mindhear: "Mini MINDHEAR Youth Scale (Anak & Remaja)"
    },

    buatPesanWhatsApp(dataPasien, hasil) {
        let t = `Halo Petugas ${this.namaFaskes}, saya telah mengisi Skrining Kesehatan Jiwa Mandiri.%0A%0A`;
        t += `*Data Pasien:*%0A`;
        t += `\u2022 Nama: ${dataPasien.nama || "-"}%0A`;
        t += `\u2022 NIK: ${dataPasien.nik || "-"}%0A`;
        if (dataPasien.asalSekolah) {
            t += `\u2022 Asal Sekolah: ${dataPasien.asalSekolah}%0A`;
        }
        if (dataPasien.kelas) {
            t += `\u2022 Kelas: ${dataPasien.kelas}%0A`;
        }
        t += `\u2022 Status Kawin: ${dataPasien.statusKawin || "-"}${dataPasien.statusKehamilan ? " (" + dataPasien.statusKehamilan + ")" : ""}%0A`;
        t += `\u2022 Alamat: ${dataPasien.alamat || "-"}%0A%0A`;
        t += `*Hasil Skrining:* *${hasil.ringkasan || "-"}*%0A`;
        if (hasil.instrumen === "epds" && hasil.q10Positif) {
            t += `%0A\u26a0\ufe0f *PERHATIAN: Ada indikasi pikiran mencelakai diri \u2014 mohon penanganan segera!*%0A`;
        }
        t += `%0AMohon arahan selanjutnya. Terima kasih.`;
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
