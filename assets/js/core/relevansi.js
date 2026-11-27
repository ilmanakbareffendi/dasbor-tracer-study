"use strict";
/* ================= ATURAN RELEVANSI ================= */
const isWork21 = r => [1,3].includes(n_(r,"f8"));
const searched21 = r => [1,2].includes(n_(r,"f301")) || [1,3,5].includes(n_(r,"f8"));
const isWork19 = r => n_(r,"f8") === 1;
const searched19 = r => [1,2].includes(n_(r,"f301")) || n_(r,"f8") === 1 || n_(r,"f904") === 1;
const RULES = {
  all: ["Semua responden", null],
  work: ["Status F8 = Bekerja atau Wiraswasta", isWork21],
  work_ya: ["F8 = Bekerja/Wiraswasta dan F504 = Ya", r => isWork21(r) && n_(r,"f504") === 1],
  work_tidak: ["F8 = Bekerja/Wiraswasta dan F504 = Tidak", r => isWork21(r) && n_(r,"f504") === 2],
  wira: ["F8 = Wiraswasta, atau F8 = Bekerja dengan F11 = Wiraswasta/perusahaan sendiri", r => n_(r,"f8") === 3 || (n_(r,"f8") === 1 && n_(r,"f1101") === 4)],
  f11lain: ["F8 = Bekerja/Wiraswasta dan F11 = Lainnya", r => isWork21(r) && n_(r,"f1101") === 5],
  studi: ["F8 = Melanjutkan pendidikan", r => n_(r,"f8") === 4],
  f12lain: ["F12 = Lainnya", r => n_(r,"f1201") === 7],
  cari: ["F3 bukan 'Saya tidak mencari kerja', atau F8 = Bekerja/Wiraswasta/sedang mencari kerja", searched21],
  f302: ["F3 = Sebelum lulus", r => n_(r,"f301") === 1],
  f303: ["F3 = Sesudah lulus", r => n_(r,"f301") === 2],
  f4lain: ["Syarat F4 terpenuhi dan F4 Lainnya dicentang", r => searched21(r) && n_(r,"f415") === 1],
  f10lain: ["F10 = Lainnya", r => n_(r,"f1001") === 5],
  f16lain: ["F8 = Bekerja/Wiraswasta dan F16 Lainnya dicentang", r => isWork21(r) && n_(r,"f1613") === 1],
  w19: ["F8 = Ya (bekerja)", isWork19],
  w19_501a: ["F8 = Ya dan F5 = Sebelum lulus", r => isWork19(r) && n_(r,"f501") === 1],
  w19_501b: ["F8 = Ya dan F5 = Sesudah lulus", r => isWork19(r) && n_(r,"f501") === 2],
  f11lain19: ["F8 = Ya dan F11 = Lainnya", r => isWork19(r) && n_(r,"f1101") === 5],
  cari19: ["F3 bukan 'Saya tidak mencari kerja', atau F8 = Ya, atau F9 = Sedang mencari kerja", searched19],
  f4lain19: ["Syarat F4 terpenuhi dan F4 Lainnya dicentang", r => searched19(r) && n_(r,"f415") === 1],
  f9lain: ["F9 Lainnya dicentang", r => n_(r,"f905") === 1],
  f16lain19: ["F8 = Ya dan F16 Lainnya dicentang", r => isWork19(r) && n_(r,"f1613") === 1],
  hidden: ["Tidak tampil di layar sistem; nilainya selalu 5, abaikan", () => false]
};
