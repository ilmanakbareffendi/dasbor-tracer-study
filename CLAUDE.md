# CLAUDE.md

## Tentang project
Dasbor Tracer Study: web app untuk membaca data tracer study UNPRI per program studi, membuat kompilasi Excel dan laporan PPT, serta membuat paket tarikan untuk CARU. Semua pengolahan terjadi di browser.
Pemilik: Career and Alumni Relations Unit, Pusat Pengembangan Karir dan Kewirausahaan (CEDC) UNPRI.
Acuan: Standar Pengembangan Web CEDC UNPRI v1.0.

## Struktur saat ini
- `index.html`: markup halaman saja (sekitar 280 baris).
- `assets/css/`: `base.css` (tata letak, unggah, filter) dan `dasbor.css` (dasbor, kartu, bilah atas).
- `assets/js/data/`: kamus kode kuesioner dan kabupaten/kota (`kamus.js`), daftar kolom per versi (`versi.js`), logo base64 untuk Excel dan PPT (`logo.js`).
- `assets/js/utils/utils.js`: fungsi umum, termasuk `esc()` dan `$()`.
- `assets/js/core/`: logika tanpa tampilan (relevansi, spesifikasi kolom Excel, model terpadu, state, kompilasi, mesin anomali).
- `assets/js/features/`: baca file, grafik, dasbor, Excel kompilasi, contoh fiktif, alur, bilah atas, paket CARU, PPT.
- `assets/js/main.js`: titik masuk.
- `assets/vendor/`: SheetJS 0.20.3.
- Semua file JavaScript adalah skrip klasik yang dimuat berurutan di akhir `index.html` dan berbagi nama global. Urutan tag `<script>` penting: file data dan utils lebih dulu, `main.js` terakhir. File baru ditambahkan sesuai urutan ketergantungannya.
- SheetJS 0.20.3 disalin ke `assets/vendor/` (salinan dari paket npm @e965/xlsx, karena versi aman tidak ada di npm resmi). ExcelJS 4.4.0, Tesseract.js 5.1.1, dan PptxGenJS 3.12.0 dimuat dari jsDelivr dengan `integrity`.
- Fungsi `esc()` dipakai untuk semua data dari file sebelum disusun sebagai HTML. Pertahankan.

## Struktur target (Standar Pengembangan Web CEDC UNPRI v1.0)

```
index.html, pages/          hanya markup
assets/css/                 base.css, components.css, pages/
assets/js/main.js           titik masuk
assets/js/config.js         semua konfigurasi (URL, kunci publik)
assets/js/services/         akses Supabase dan API
assets/js/features/         satu folder per fitur
assets/js/utils/            fungsi umum (format, escape)
assets/data/                data statis .json
assets/vendor/              salinan pustaka luar versi tetap
tests/  docs/
```

## Catatan khusus
- File ini mengolah data pribadi alumni (UU 27/2022 tentang Pelindungan Data Pribadi). Jangan menyimpan data alumni ke `localStorage`, server, atau layanan pihak ketiga. `localStorage` hanya untuk pengaturan tampilan.
- Langkah berikutnya: ubah ke ES modules dengan `import`/`export`, lalu pasang Content Security Policy. Uji perubahan dengan membandingkan tampilan contoh fiktif sebelum dan sesudah.

## Aturan wajib

1. Sebelum menulis fungsi baru, cari dulu fungsi serupa (grep). Pakai ulang, jangan salin.
2. Satu file satu tugas. Target di bawah 300 baris. File di atas 500 baris wajib dipecah sebelum menambah fitur baru; usulkan dulu kepada pemilik.
3. File baru tidak memuat CSS atau JavaScript di dalam HTML, dan tidak memakai `style=""` atau `onclick=""`. Selector JavaScript memakai atribut `data-*`.
4. Teks dari pengguna, file, atau database ditampilkan lewat `textContent`, atau lewat `esc()` bila harus disusun sebagai HTML. `esc()` wajib mengamankan `& < > " '`.
5. Jangan pernah menulis secret key atau service_role key. Kunci publik Supabase saja yang boleh ada di kode.
6. Setiap tabel Supabase wajib RLS. Pengecekan hak admin, PIN, dan aturan permainan dilakukan di fungsi database, bukan di JavaScript.
7. Pustaka luar: versi dikunci dan memakai atribut `integrity` plus `crossorigin="anonymous"`, atau disalin ke `assets/vendor/`.
8. Logika hitung ditulis sebagai fungsi murni dan diuji di `tests/` dengan `node --test`.
9. Kerja di branch `fitur/...` atau `perbaikan/...`, bukan langsung di `main`, karena `main` langsung tayang di GitHub Pages. Catat setiap perubahan di `CHANGELOG.md`.
10. Jangan menghapus atau menulis ulang riwayat Git.

## Gaya tulisan

Teks antarmuka dan dokumentasi memakai bahasa Indonesia. Jangan memakai tanda pisah panjang atau en dash dalam kalimat. Tulis jenjang sebagai Sarjana, Magister, Doktoral, bukan singkatan S1, S2, S3.

## Perintah

- Jalankan lokal: `python3 -m http.server 8000`, lalu buka `http://localhost:8000`
- Pengujian (bila ada): `node --test tests/`
