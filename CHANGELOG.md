# Catatan Perubahan

Semua perubahan penting pada project ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan penomoran versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [Belum dirilis]

### Diubah
- Kode dipecah dari satu `index.html` (2.630 baris) menjadi 2 file CSS dan 20 file JavaScript menurut fungsinya. Tidak ada file di atas 330 baris. Tampilan dan perilaku tidak berubah: diuji dengan membandingkan halaman awal, contoh fiktif, tab, filter, dan menu CARU sebelum dan sesudah.

### Keamanan
- SheetJS diperbarui dari 0.18.5 ke 0.20.3 dan disimpan di `assets/vendor/`. Versi lama rentan *prototype pollution* saat membaca file (CVE-2023-30533).
- Semua pustaka dari CDN (ExcelJS, Tesseract.js, PptxGenJS) kini memakai atribut `integrity` dan `crossorigin`.

### Diubah
- Pesan galat saat pustaka gagal dimuat kini umum, tidak hanya menyebut PowerPoint.

### Ditambahkan
- `CLAUDE.md` dan `AGENTS.md` berisi aturan struktur dan keamanan untuk alat AI.
- `.gitignore`, `.editorconfig`, dan catatan perubahan ini.
- README diperluas: cara menjalankan lokal, struktur, layanan pihak ketiga, dan keamanan data.
