# Alur Data Dasbor Tracer Study

Dokumen ini mencatat data apa yang diolah dasbor, di mana data itu berada, dan siapa yang bisa melihatnya. Acuan: UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi dan Standar Pengembangan Web CEDC UNPRI v1.0.

## Ringkasan

Semua pengolahan terjadi di browser pengguna. Dasbor tidak memiliki server atau database, tidak mengirim isi file ke mana pun, dan tidak menyimpan data alumni setelah halaman ditutup. Hasil olahan hanya keluar dari browser bila pengguna sendiri menekan tombol unduh (Excel, PPT, atau paket CARU).

## Data yang masuk

| Sumber | Isi | Diolah oleh |
|---|---|---|
| Download Versi 2021 (.xlsx) | Jawaban kuesioner tracer study versi 2021 | `features/baca-file.js` |
| Download Versi 2019 (.csv) | Jawaban kuesioner versi 2019 | `features/baca-file.js` |
| Download Data Mahasiswa (.xlsx) | Daftar pengisian: NIM, tanggal isi, tahun masuk | `features/baca-file.js` |
| Screenshot sistem (.png, .jpg, .webp) | Isian prodi dan periode di layar sistem tracer | `features/paket-caru.js` (OCR di browser) |

### Data pribadi di dalam file

| Kolom | Arti | Ditampilkan di dasbor | Ikut di Excel kompilasi |
|---|---|---|---|
| `nimhsmsmh` | NIM | Hanya di daftar NIM ganda | Ya |
| `nmmhsmsmh` | Nama | Hanya di daftar NIM ganda | Ya |
| `telpomsmh` | Nomor telepon | Tidak | Ya |
| `emailmsmh` | Email | Tidak | Ya |
| `nik` | NIK (versi 2021) | Tidak | Ya |
| `npwp` | NPWP (versi 2021) | Tidak | Ya |

Dasbor sendiri hanya menampilkan angka agregat per prodi. Data per alumni hanya muncul di Excel kompilasi, yang dipakai untuk tindak lanjut alumni yang belum mengisi.

## Data yang keluar

| Keluaran | Isi | Kapan |
|---|---|---|
| Excel kompilasi | Data per alumni, termasuk kolom pribadi di atas | Saat pengguna menekan Unduh Excel |
| Laporan PPT | Angka agregat dan grafik, tanpa data per alumni | Saat pengguna menekan Unduh PPT |
| File paket CARU | Salinan tiga file tarikan dalam satu file | Saat CARU menekan unduh paket |
| Teks WhatsApp dan baris log | Ringkasan jumlah dan periode, tanpa data per alumni | Saat pengguna menekan salin; ditempel manual oleh pengguna |

## Penyimpanan di browser

`localStorage` hanya menyimpan dua hal: pengaturan tampilan (`tracer-settings`: target IKU, UMP, tahun dan tanggal wisuda) dan tanda petunjuk sudah ditutup (`tracer-hint`). Tidak ada data alumni yang disimpan.

## Layanan pihak ketiga

| Layanan | Yang dikirim | Catatan |
|---|---|---|
| jsDelivr | Permintaan berkas pustaka (ExcelJS, Tesseract.js, PptxGenJS) dan data bahasa OCR | Tidak ada data alumni yang dikirim |
| Google Fonts | Permintaan berkas huruf | Tidak ada data alumni yang dikirim |
| GitHub Pages | Permintaan halaman | GitHub mencatat alamat IP pengunjung untuk keamanan |

## Kewajiban bagi pengguna dan pengembang

1. Excel kompilasi berisi NIK, NPWP, telepon, dan email. Simpan di folder yang aksesnya terbatas, jangan dibagikan ke grup umum, dan hapus bila tindak lanjut selesai.
2. Pengembang tidak boleh menambah pengiriman data ke server, analitik, atau layanan pihak ketiga tanpa memperbarui dokumen ini dan persetujuan pemilik.
3. Pengembang tidak boleh menyimpan data alumni di `localStorage`, `sessionStorage`, IndexedDB, atau cookie.
4. Bila dasbor dipindah ke server UNPRI, pastikan server tidak mencatat isi unggahan. Saat ini unggahan tidak pernah dikirim ke server, jadi cukup pertahankan arsitektur ini.
