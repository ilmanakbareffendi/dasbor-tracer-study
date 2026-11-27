# Catatan Perubahan

Semua perubahan penting pada project ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan penomoran versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [Belum dirilis]

### Keamanan
- SheetJS diperbarui dari 0.18.5 ke 0.20.3 dan dimuat dari sumber resmi cdn.sheetjs.com. Versi lama rentan *prototype pollution* saat membaca file (CVE-2023-30533).
- Semua pustaka dari CDN kini memakai atribut `integrity` dan `crossorigin`, termasuk Tesseract.js dan PptxGenJS yang dimuat saat dibutuhkan.

### Diubah
- Pesan galat saat pustaka gagal dimuat kini umum, tidak hanya menyebut PowerPoint.

### Ditambahkan
- `CLAUDE.md` dan `AGENTS.md` berisi aturan struktur dan keamanan untuk alat AI.
- `.gitignore`, `.editorconfig`, dan catatan perubahan ini.
- README diperluas: cara menjalankan lokal, struktur, layanan pihak ketiga, dan keamanan data.
