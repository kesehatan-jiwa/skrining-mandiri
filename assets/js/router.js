// =============================================================================
//  router.js — DETEKSI PERANGKAT OTOMATIS (MOBILE vs DESKTOP)
//  Skrining Kesehatan Jiwa — Puskesmas Lok Bahu
// =============================================================================

(function () {
    const MOBILE_MAX_WIDTH = 1024; // px

    function isMobileDevice() {
        const ua = navigator.userAgent || "";
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
        const isNarrow = window.innerWidth < MOBILE_MAX_WIDTH;
        return isMobileUA || isNarrow;
    }

    // Deteksi base path secara dinamis agar aman di Live Server subfolder maupun GitHub Pages
    const base = (function () {
        const scripts = document.querySelectorAll("script[src]");
        for (const s of scripts) {
            if (s.src.includes("router.js")) {
                return s.src.replace("assets/js/router.js", "");
            }
        }
        return window.location.pathname.replace(/index\.html$/, "");
    })();

    // Parameter paksa tampilan (opsional untuk testing: ?view=mobile atau ?view=desktop)
    const params = new URLSearchParams(window.location.search);
    const forceView = params.get("view") || params.get("mode");

    if (forceView === "mobile" || (forceView !== "desktop" && isMobileDevice())) {
        window.location.replace(base + "mobile/index.html");
    } else {
        window.location.replace(base + "desktop/index.html");
    }
})();
