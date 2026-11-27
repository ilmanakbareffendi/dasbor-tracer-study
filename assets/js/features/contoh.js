"use strict";
/* ================= CONTOH FIKTIF ================= */
function makeExample(){
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = (arr, w) => { const t = w.reduce((s, x) => s + x, 0); let u = rnd() * t; for (let i = 0; i < arr.length; i++) { u -= w[i]; if (u <= 0) return arr[i]; } return arr[arr.length - 1]; };
  const common = (r, i, tahun) => { Object.assign(r, { kdptimsmh: 11033, kdpstmsmh: 61201, nimhsmsmh: 993304020000 + i, nmmhsmsmh: "Alumni Contoh " + String(i).padStart(3, "0"), telpomsmh: 81200000000 + i, emailmsmh: "contoh" + i + "@contoh.id", tahun_lulus: tahun, f1201: pick([1,3,7],[85,10,5]), f14: pick([1,2,3,4,5],[15,30,30,12,13]), f15: pick([1,2,3,4],[12,70,9,9]), f301: pick([1,2,3],[35,40,25]), f302: 2, f303: 1, f6: pick([0,1,2,3,5,10],[20,20,25,15,12,8]), f1001: pick([1,2,3,4,5],[40,10,8,36,6]) }); r.f7 = Math.round(r.f6 * rnd()); r.f7a = Math.round(r.f7 * (0.5 + rnd() / 2)); F2.forEach(([c]) => { r[c] = pick([1,2,3,4,5],[30,32,28,6,4]); }); F4.forEach(([c], k) => { r[c] = rnd() < [0.05,0.1,0.08,0.55,0.08,0.02,0.05,0.18,0.06,0.18,0.42,0.12,0.15,0.08,0.06][k] ? 1 : 0; }); F16.forEach(([c], k) => { r[c] = rnd() < [0.22,0.3,0.12,0.04,0.03,0.08,0.1,0.1,0.1,0.09,0.07,0.15,0.1][k] ? 1 : 0; }); };
  const mk21 = (i, tahun) => { const r = {}; COLS21.forEach(c => r[c] = null); common(r, i, tahun); Object.assign(r, { nik: 1200000000000000 + i, f8: pick([1,2,3,4,5],[38,6,12,2,42]), f504: pick([1,2],[60,40]), f506: pick([7,9,12,15],[4,3,2,1]), f5a1: 70000, f5a2: pick([76000,70100,70300],[60,35,5]), f1101: pick([3,4,5,6,1],[45,25,20,6,4]), f5b: "PT Contoh", f5c: pick([1,2,3,4],[10,8,55,27]), f5d: pick([1,2,3],[55,38,7]) }); r.f502 = pick([0,1,2,3,4,6],[20,25,20,15,10,10]); F17_21.forEach(([a, b], k) => { r[a] = pick([3,4,5],[12 + k * 2,45,43]); r[b] = pick([3,4,5],[8,38,54 + k]); }); return r; };
  const mk19 = (i, tahun) => { const r = {}; COLS19.forEach(c => r[c] = null); common(r, i, tahun); Object.assign(r, { f8: pick([1,2],[70,30]), f501: pick([1,2],[45,55]), f1101: pick([3,4,5,1],[55,20,15,10]), f1301: pick([2500000,3500000,4500000,6000000,3],[3,4,3,2,1]) }); r.f503 = r.f501 === 2 ? pick([0,2,4,8,14],[3,3,2,1,1]) : null; r.f502 = r.f501 === 1 ? 3 : null; F9.forEach(([c], k) => { r[c] = rnd() < [0.15,0.05,0.1,0.35,0.3][k] ? 1 : 0; }); F17_19.forEach(([a, b], k) => { r[a] = pick([3,4,5],[10 + (k % 7) * 4,45,40]); r[b] = pick([3,4,5],[8,40,50 + (k % 5) * 3]); }); r.f1711a = 5; r.f1712a = 5; return r; };
  const a = [], b = [], c19 = [];
  for (let i = 1; i <= 220; i++) a.push(mk21(i, i <= 180 ? 2026 : pick([2023, 2024, 2025], [30, 30, 40])));
  for (let i = 201; i <= 300; i++) b.push(mk21(i, pick([2021, 2022, 2025], [50, 20, 30])));
  for (let i = 401; i <= 445; i++) c19.push(mk19(i, pick([2017, 2018, 2019, 2020], [30, 25, 25, 20])));
  const P1 = { from: "2026-01-01", to: "2026-10-27", src: "contoh" }, P2 = { from: "2025-01-01", to: "2025-12-31", src: "contoh" };
  const ent = (id, name, rows, header, version, period) => Object.assign(newEntry(name, id), { id, kind: "versi", rows, header, version, period });
  const fa = ent("ex1", "Contoh_Manajemen_V2021_2026.xlsx", a, COLS21.slice(), "v2021", P1);
  const fb = ent("ex2", "Contoh_Manajemen_V2021_2025.xlsx", b, COLS21.slice(), "v2021", P2);
  const fc = ent("ex3", "Contoh_Manajemen_V2019.csv", c19, COLS19.slice(), "v2019", P1);
  [fa, fb, fc].forEach(finishEntry);
  // daftar pengisian fiktif: tahun masuk 4 tahun sebelum lulus, tanggal isi di tahun lulus; 10 baris versi 2019 sengaja di luar daftar
  const dRows = (rows, P) => rows.map((r, k) => { const y = r.tahun_lulus; const mo = 1 + Math.floor(rnd() * 9); return { nim: String(r.nimhsmsmh), nama: r.nmmhsmsmh, prodiNama: "Sarjana Manajemen", tahunMasuk: y - (k % 17 === 0 ? 2 : 4), tahunLulus: y, tgl: new Date(Date.UTC(Math.max(y, Number(P.from.slice(0, 4))), mo - 1, 1 + Math.floor(rnd() * 27))), raw: null }; });
  const fd1 = Object.assign(newEntry("list_pengisian_tracer_study_2026-01-01_00_00_00_0700_2026-10-27_23_59_59_0700.xlsx", 4), { id: "ex4", kind: "daftar", period: P1, prodiNama: "Sarjana Manajemen", rows: dRows(a.concat(c19.slice(10)), P1), header: ["No.","Nama","NIM","Program Studi","Tahun Masuk","Tahun Alumni","No. telp","Email","Tanggal Pengisisan"] });
  const fd2 = Object.assign(newEntry("list_pengisian_tracer_study_2025-01-01_00_00_00_0700_2025-12-31_23_59_59_0700.xlsx", 5), { id: "ex5", kind: "daftar", period: P2, prodiNama: "Sarjana Manajemen", rows: dRows(b, P2), header: fd1.header });
  return [fa, fb, fc, fd1, fd2];
}
