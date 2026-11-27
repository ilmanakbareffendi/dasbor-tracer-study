"use strict";
/* ================= MODEL TERPADU UNTUK DASBOR ================= */
const GROUPS = [["kerja","Bekerja atau berwirausaha","var(--c1)"],["studi","Studi lanjut","var(--c3)"],["cari","Sedang mencari kerja","var(--neg)"],["lain","Lainnya (belum memungkinkan bekerja)","var(--neu)"]];
function model(x){
  const r = x.r, v = x.v, m = { tahun: num(r.tahun_lulus), pre: false };
  if (v === "v2021") {
    const f8 = n_(r,"f8");
    m.detail = {1:"Bekerja",2:"Belum memungkinkan bekerja",3:"Wiraswasta",4:"Studi lanjut",5:"Sedang mencari kerja"}[f8] || "Tidak diketahui";
    m.work = f8 === 1 || f8 === 3;
    m.wira = f8 === 3 || (f8 === 1 && n_(r,"f1101") === 4);
    const c = n_(r,"f5c"); m.founder = m.wira && (c === 1 || c === 2 || (c === null && f8 === 3)); m.freelance = m.wira && c === 4; m.staffOwn = m.wira && c === 3;
    if (m.work) { const a = n_(r,"f504"), ya = a === 1; m.le6 = ya; m.before = false; m.months = null;
      if (ya) { const q = n_(r,"f502"); m.months = q !== null && q >= 0 && q <= 6 ? q : null; m.yaOver = q !== null && q > 6; }
      else if (a === 2) { const q = n_(r,"f506"); m.months = q !== null && q > 6 && q <= 240 ? q : null; m.inconsistent = !(q !== null && q > 6 && q <= 240); m.altMonths = q !== null && q >= 0 && q <= 6 ? q : null; }
      else m.noWait = true; }
    m.searched = searched21(r);
  } else {
    const f8 = n_(r,"f8"), f1101 = n_(r,"f1101");
    m.work = f8 === 1; m.wira = m.work && f1101 === 4; m.founder = m.wira; m.freelance = false;
    m.detail = m.work ? (m.wira ? "Wiraswasta" : "Bekerja") : (n_(r,"f901") === 1 ? "Studi lanjut" : n_(r,"f904") === 1 ? "Sedang mencari kerja" : "Belum memungkinkan bekerja");
    if (m.work) { const a = n_(r,"f501"); m.before = a === 1; m.months = a === 1 ? 0 : a === 2 ? n_(r,"f503") : null; m.le6 = a === 1 || (a === 2 && m.months !== null && m.months <= 6); }
    m.searched = searched19(r);
  }
  m.group = m.work ? "kerja" : m.detail === "Studi lanjut" ? "studi" : m.detail === "Sedang mencari kerja" ? "cari" : "lain";
  const inc = n_(r,"f1301"); m.income = m.work && inc !== null ? inc : null;
  // dari daftar pengisian (Download Data Mahasiswa): tahun masuk dan tanggal pengisian
  const d = x.d; m.tahunMasuk = d && d.tahunMasuk != null ? d.tahunMasuk : null; m.tgl = d && d.tgl ? d.tgl : null;
  m.lamaStudi = m.tahunMasuk != null && m.tahun != null ? m.tahun - m.tahunMasuk : null;
  m.jarakIsi = m.tgl && m.tahun != null ? m.tgl.getUTCFullYear() - m.tahun : null;
  return m;
}
function ikuCategory(m){
  if (m.group === "studi") return "Studi lanjut";
  if (!m.work) return "Belum terhitung";
  if (m.le6) return "Kerja ≤6 bulan";
  if (m.months !== null && m.months !== undefined && m.months <= 12) return "Kerja 7 sampai 12 bulan";
  return "Kerja >12 bulan/tanpa data";
}
function ikuWeight(m, thr, force){
  if (m.group === "studi") return 0.6;
  if (!m.work) return 0;
  const hi = force !== undefined ? force : m.income !== null && m.income >= 100000 && m.income >= thr;
  const le6 = m.le6, le12 = le6 || (m.months !== null && m.months !== undefined && m.months <= 12);
  if (m.before) return hi ? 1 : 0.6;
  if (m.freelance) return le6 ? (hi ? 0.5 : 0.3) : le12 ? (hi ? 0.4 : 0.2) : 0;
  if (m.founder) return le6 ? (hi ? 1.2 : 0.8) : le12 ? (hi ? 1 : 0.6) : 0;
  return le6 && hi ? 1 : le12 ? (hi ? 0.8 : 0.6) : 0;
}
