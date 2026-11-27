# Dasbor Tracer Study

Web app CARU (Career and Alumni Relations Unit) CEDC Universitas Prima Indonesia untuk membaca data tracer study per prodi.

Alamat: https://ilmanakbareffendi.github.io/dasbor-tracer-study/

## Cara pakai
1. Unggah file paket dari CARU (satu file), atau tiga file tarikan sistem: Download Versi 2021, Download Versi 2019, dan Download Data Mahasiswa.
2. Klik **Gabungkan dan tampilkan** untuk melihat dasbor.
3. Klik **Unduh Excel kompilasi** untuk memperoleh data per alumni yang sudah diterjemahkan, lengkap dengan sheet Baca Dulu.

## Keamanan data
Semua pengolahan terjadi di browser pengguna. File yang diunggah tidak dikirim atau disimpan di server mana pun, dan halaman ini tidak memuat data alumni.

## Menjalankan di komputer sendiri
1. Unduh atau clone repo ini.
2. Di folder repo, jalankan `python3 -m http.server 8000`.
3. Buka `http://localhost:8000`.

## Struktur
- `index.html`: seluruh aplikasi dalam satu file. Pemecahan ke modul dijadwalkan sesuai Standar Pengembangan Web CEDC UNPRI.
- `CLAUDE.md`: aturan kerja untuk alat AI dan programmer.
- `CHANGELOG.md`: catatan perubahan.

## Layanan dan pustaka pihak ketiga
| Pustaka | Versi | Sumber | Fungsi |
|---|---|---|---|
| SheetJS (xlsx) | 0.20.3 | `assets/vendor/` (salinan di repo) | Membaca file tarikan dan menulis file paket |
| ExcelJS | 4.4.0 | jsDelivr | Menulis Excel kompilasi |
| Tesseract.js | 5.1.1 | jsDelivr | Membaca teks dari screenshot (fitur paket CARU) |
| PptxGenJS | 3.12.0 | jsDelivr | Membuat laporan PPT |

SheetJS disimpan langsung di repo karena versi aman tidak tersedia di npm resmi. Pustaka lain dimuat dari jsDelivr dengan atribut `integrity` (Subresource Integrity), sehingga browser menolak file yang isinya berubah.

## Pemilik dan kontak
Career and Alumni Relations Unit, Pusat Pengembangan Karir dan Kewirausahaan (CEDC) UNPRI. Kontak: ilmanakbareffendi@unprimdn.ac.id.

Status hak cipta dan lisensi akan dicantumkan di file `LICENSE` setelah ditetapkan.
