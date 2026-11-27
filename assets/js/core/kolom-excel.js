"use strict";
/* ================= SPESIFIKASI KOLOM (Excel) ================= */
function idSpec(){
  return {
    kdptimsmh: ["Kode PT", r => place(r.kdptimsmh, PT, "pt"), null, 22],
    kdpstmsmh: ["Program Studi", r => place(r.kdpstmsmh, PRODI, "pt"), null, 18],
    nimhsmsmh: ["NIM", r => ident(r.nimhsmsmh), null, 15],
    nmmhsmsmh: ["Nama", r => txt(r.nmmhsmsmh), null, 26],
    telpomsmh: ["Telepon", r => phone(r.telpomsmh), null, 15],
    emailmsmh: ["Email", r => txt(r.emailmsmh), null, 26],
    tahun_lulus: ["Tahun lulus", r => num(r.tahun_lulus), null, 10]
  };
}
const S21 = Object.assign(idSpec(), {
  nik: ["NIK", r => ident(r.nik), null, 19], npwp: ["NPWP", r => ident(r.npwp), null, 10],
  f8: ["F8 Status saat ini", r => dec(r.f8, F8_21), null, 28],
  f504: ["F504 Mendapat pekerjaan ≤6 bulan / bekerja sebelum lulus", r => dec(r.f504, YN), "work", 14],
  f502: ["F502 Jika Ya: dalam berapa bulan mendapat pekerjaan", r => num(r.f502), "work_ya", 12],
  f505: ["F505 Pendapatan per bulan versi kode Kemdikbud [tidak tampil di layar sistem, isian bercampur]", r => num(r.f505), "work", 16],
  f506: ["F506 Jika Tidak: dalam berapa bulan mendapat pekerjaan", r => num(r.f506), "work_tidak", 12],
  f5a1: ["F510 Provinsi tempat kerja", r => place(r.f5a1, PROV, "wil"), "work", 22],
  f5a2: ["F510 Kab/Kota tempat kerja", r => place(r.f5a2, KABKOTA, "wil"), "work", 22],
  f1101: ["F11 Jenis perusahaan/instansi tempat bekerja", r => dec(r.f1101, F11_21), "work", 26],
  f1102: ["F11 Lainnya, isian", r => txt(r.f1102), "f11lain", 16],
  f5b: ["F5B Nama perusahaan/kantor", r => txt(r.f5b), "work", 24],
  f5c: ["F5C Posisi/jabatan bila berwiraswasta", r => dec(r.f5c, F5C), "wira", 16],
  f5d: ["F5D Tingkat tempat kerja", r => dec(r.f5d, F5D), "work", 26],
  f18a: ["F18A Studi lanjut: sumber biaya", r => dec(r.f18a, F18A), "studi", 13],
  f18b: ["F18B Studi lanjut: perguruan tinggi", r => place(r.f18b, PT, "pt"), "studi", 22],
  f18c: ["F18C Studi lanjut: program studi", r => place(r.f18c, PRODI, "pt"), "studi", 18],
  f18d: ["F18D Studi lanjut: tanggal masuk", r => txt(r.f18d), "studi", 12],
  f1201: ["F12 Sumber dana pembiayaan kuliah", r => dec(r.f1201, F12), null, 20],
  f1202: ["F12 Lainnya, isian", r => txt(r.f1202), "f12lain", 14],
  f1301: ["F13 Pendapatan dari pekerjaan utama (Rp)", r => num(r.f1301), "work", 16],
  f1302: ["F13 Pendapatan dari lembur dan tips (Rp)", r => num(r.f1302), "work", 16],
  f1303: ["F13 Pendapatan dari pekerjaan lainnya (Rp)", r => num(r.f1303), "work", 16],
  f14: ["F14 Keeratan bidang studi dengan pekerjaan", r => dec(r.f14, F14), "work", 15],
  f15: ["F15 Tingkat pendidikan yang sesuai untuk pekerjaan", r => dec(r.f15, F15), "work", 18],
  f301: ["F3 Kapan mulai mencari pekerjaan", r => dec(r.f301, F3), null, 18],
  f302: ["F3 Jumlah bulan sebelum lulus", r => num(r.f302), "f302", 10],
  f303: ["F3 Jumlah bulan sesudah lulus", r => num(r.f303), "f303", 10],
  f416: ["F4 Lainnya, isian", r => txt(r.f416), "f4lain", 14],
  f6: ["F6 Jumlah perusahaan yang dilamar sebelum pekerjaan pertama", r => num(r.f6), "cari", 11],
  f7: ["F7 Jumlah perusahaan yang merespons lamaran", r => num(r.f7), "cari", 11],
  f7a: ["F7A Jumlah perusahaan yang mengundang wawancara", r => num(r.f7a), "cari", 11],
  f1001: ["F10 Aktif mencari pekerjaan dalam 4 minggu terakhir", r => dec(r.f1001, F10), null, 26],
  f1002: ["F10 Lainnya, isian", r => txt(r.f1002), "f10lain", 14],
  f1614: ["F16 Lainnya, isian", r => txt(r.f1614), "f16lain", 14]
});
F17_21.forEach(([a, b, l]) => { S21[a] = ["F17 " + l + " (A): dikuasai saat lulus, skala 1 sampai 5", r => num(r[a]), null, 15]; S21[b] = ["F17 " + l + " (B): diperlukan dalam pekerjaan, skala 1 sampai 5", r => num(r[b]), null, 15]; });
F2.forEach(([c, l]) => { S21[c] = ["F2 Penekanan metode pembelajaran: " + l, r => dec(r[c], F2S), null, 14]; });
F4.forEach(([c, l]) => { S21[c] = ["F4 Cara mencari kerja: " + l, r => yt(r[c]), "cari", 16]; });
F16.forEach(([c, l]) => { S21[c] = ["F16 Alasan ambil pekerjaan tidak sesuai pendidikan: " + l, r => yt(r[c]), "work", 18]; });

const S19 = Object.assign(idSpec(), {
  f301: ["F3 Kapan mulai mencari pekerjaan", r => dec(r.f301, F3), null, 18],
  f302: ["F3 Jumlah bulan sebelum lulus", r => num(r.f302), "f302", 10],
  f303: ["F3 Jumlah bulan sesudah lulus", r => num(r.f303), "f303", 10],
  f416: ["F4 Lainnya, isian", r => txt(r.f416), "f4lain19", 14],
  f6: ["F6 Jumlah perusahaan yang dilamar sebelum pekerjaan pertama", r => num(r.f6), "cari19", 11],
  f501: ["F5 Waktu memperoleh pekerjaan pertama", r => dec(r.f501, F501), "w19", 14],
  f502: ["F5 Jumlah bulan sebelum lulus", r => num(r.f502), "w19_501a", 10],
  f503: ["F5 Jumlah bulan sesudah lulus", r => num(r.f503), "w19_501b", 10],
  f7: ["F7 Jumlah perusahaan yang merespons lamaran", r => num(r.f7), "cari19", 11],
  f7a: ["F7A Jumlah perusahaan yang mengundang wawancara", r => num(r.f7a), "cari19", 11],
  f8: ["F8 Apakah bekerja saat ini (termasuk kerja sambilan dan wirausaha)", r => dec(r.f8, F8_19), null, 14],
  f906: ["F9 Lainnya, isian", r => txt(r.f906), "f9lain", 16],
  f1001: ["F10 Aktif mencari pekerjaan dalam 4 minggu terakhir", r => dec(r.f1001, F10), null, 26],
  f1002: ["F10 Lainnya, isian", r => txt(r.f1002), "f10lain", 14],
  f1101: ["F11 Jenis perusahaan/instansi tempat bekerja", r => dec(r.f1101, F11_19), "w19", 26],
  f1102: ["F11 Lainnya, isian", r => txt(r.f1102), "f11lain19", 16],
  f1201: ["F12 Sumber dana pembiayaan kuliah", r => dec(r.f1201, F12), null, 20],
  f1202: ["F12 Lainnya, isian", r => txt(r.f1202), "f12lain", 14],
  f1301: ["F13 Pendapatan dari pekerjaan utama (Rp)", r => num(r.f1301), "w19", 16],
  f1302: ["F13 Pendapatan dari lembur dan tips (Rp)", r => num(r.f1302), "w19", 16],
  f1303: ["F13 Pendapatan dari pekerjaan lainnya (Rp)", r => num(r.f1303), "w19", 16],
  f14: ["F14 Keeratan bidang studi dengan pekerjaan", r => dec(r.f14, F14), "w19", 15],
  f15: ["F15 Tingkat pendidikan yang sesuai untuk pekerjaan", r => dec(r.f15, F15), "w19", 18],
  f1614: ["F16 Lainnya, isian", r => txt(r.f1614), "f16lain19", 14],
  f1711a: ["F17 kolom f1711a (tidak tampil di layar, selalu 5)", r => num(r.f1711a), "hidden", 12],
  f1712a: ["F17 kolom f1712a (tidak tampil di layar, selalu 5)", r => num(r.f1712a), "hidden", 12]
});
F2.forEach(([c, l]) => { S19[c] = ["F2 Penekanan metode pembelajaran: " + l, r => dec(r[c], F2S), null, 14]; });
F4.forEach(([c, l]) => { S19[c] = ["F4 Cara mencari kerja: " + l, r => yt(r[c]), "cari19", 16]; });
F9.forEach(([c, l]) => { S19[c] = ["F9 Situasi saat ini: " + l, r => yt(r[c]), null, 16]; });
F16.forEach(([c, l]) => { S19[c] = ["F16 Alasan ambil pekerjaan tidak sesuai pendidikan: " + l, r => yt(r[c]), "w19", 18]; });
F17_19.forEach(([a, b, l]) => { S19[a] = ["F17 " + l + " (A): dikuasai saat lulus, skala 1 sampai 5", r => num(r[a]), null, 15]; S19[b] = ["F17 " + l + " (B): diperlukan dalam pekerjaan, skala 1 sampai 5", r => num(r[b]), null, 15]; });

const VERSIONS = {
  v2021: { key: "v2021", label: "Versi 2021", ext: "xlsx", cols: COLS21, spec: S21, f17: F17_21.map(x => [x[0], x[1], x[2], x[2]]), detect: h => h.includes("f504") && h.includes("f5a1") },
  v2019: { key: "v2019", label: "Versi 2019", ext: "csv", cols: COLS19, spec: S19, f17: F17_19, detect: h => h.includes("f501") && h.includes("f901") && h.includes("f1701") }
};
function specFor(v, col){ return VERSIONS[v].spec[col] || [col + " (kolom baru, belum ada di panduan)", r => txt(r[col]), null, 14]; }
