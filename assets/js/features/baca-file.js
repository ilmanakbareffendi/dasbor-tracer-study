"use strict";
/* ================= MEMBACA FILE ================= */
// Jenis masukan: (1) paket dari skill CARU (sheet Info Tarikan, Versi 2021, Versi 2019, Daftar Pengisian),
// (2) file mentah dari sistem: Download Versi 2021, Download Versi 2019, Download Data Mahasiswa (daftar pengisian).
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agu: 8, agt: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };
const ymd = (y, mo, d) => y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0");
const isoDate = d => d.toISOString().slice(0, 10);
function fmtTgl(s){ if (!s) return ""; const p = String(s).slice(0, 10).split("-").map(Number); return p.length === 3 ? p[2] + " " + BULAN[p[1] - 1] + " " + p[0] : String(s); }
function periodText(p){ return p && p.from ? fmtTgl(p.from) + " sampai " + fmtTgl(p.to) : ""; }
function parseTanggal(v){
  if (v instanceof Date && !isNaN(v)) return v;
  if (isBlank(v)) return null;
  if (typeof v === "number" && v > 20000 && v < 80000) return new Date(Math.round((v - 25569) * 864e5));
  const s = String(v).trim(); let m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
}
function periodFromName(name){
  let m = name.match(/(\d{4}-\d{2}-\d{2})[\s_]\d{2}_\d{2}_\d{2}[\s_]\+?\d{4}_(\d{4}-\d{2}-\d{2})/);
  if (m) return { from: m[1], to: m[2], src: "nama file daftar pengisian dari sistem" };
  m = name.match(/(\d{4}-\d{2}-\d{2})[\s_]*(?:sd|s\.d\.?|sampai|ke)[\s_]*(\d{4}-\d{2}-\d{2})/i);
  if (m) return { from: m[1], to: m[2], src: "nama file" };
  m = name.match(/(\d{1,2})[\s_]+([A-Za-z]{3,})[\s_]+(\d{4})[\s_]*(?:ke|sd|s\.d\.?|sampai)[\s_]*(\d{1,2})[\s_]+([A-Za-z]{3,})[\s_]+(\d{4})/i);
  if (m) { const a = MON[m[2].slice(0, 3).toLowerCase()], b = MON[m[5].slice(0, 3).toLowerCase()]; if (a && b) return { from: ymd(+m[3], a, +m[1]), to: ymd(+m[6], b, +m[4]), src: "nama file" }; }
  return null;
}
function fyear(name){ const m = name.match(/20\d{2}/g); return m ? m[m.length - 1] : ""; }
function shortProdi(n){ if (!n) return ""; return String(n).trim().replace(/^Sarjana Terapan /, "D4 ").replace(/^Sarjana /, "S1 ").replace(/^Magister /, "S2 ").replace(/^Doktor /, "S3 "); }
const PRODI_DYN = {};
function prodiLabel(code){ const n = PRODI_DYN[code] || PRODI[code]; return n ? n + " (" + code + ")" : "Kode " + code; }
function sheetAoa(ws){
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: false });
  // Tanggal dari SheetJS dibuat dalam zona waktu lokal (dengan selisih detik zona waktu lama), sehingga di WIB bisa mundur satu hari saat ditulis ulang.
  // Dibulatkan ke hari terdekat lalu disimpan sebagai tengah malam UTC agar tanggalnya sama persis dengan file asli.
  aoa.forEach(r => r.forEach((v, i) => { if (v instanceof Date && !isNaN(v)) { const d = new Date(v.getTime() + 12 * 3600e3); r[i] = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); } }));
  return aoa;
}
function newEntry(name, size){ return { id: Math.random().toString(36).slice(2), name, size, kind: "versi", period: null, periode: "", rows: [], header: [], version: null, prodi: null, errors: [], warnings: [] }; }
function parseVersi(entry, aoa){
  const header = aoa[0].map(h => h == null ? "" : String(h).trim().toLowerCase());
  const ver = Object.values(VERSIONS).find(V => V.detect(header)); if (!ver) return false;
  entry.kind = "versi"; entry.version = ver.key;
  const missing = ver.cols.filter(c => !header.includes(c));
  if (missing.length) { entry.errors.push("Kolom " + ver.label + " tidak lengkap. Tidak ditemukan: " + missing.slice(0, 8).join(", ") + (missing.length > 8 ? " dan " + (missing.length - 8) + " lainnya" : "") + "."); return true; }
  entry.header = header.filter(h => h);
  const extra = entry.header.filter(h => !ver.cols.includes(h));
  if (extra.length) entry.warnings.push("Kolom baru ikut diproses: " + extra.join(", "));
  const idx = {}; header.forEach((h, i) => { if (h && idx[h] === undefined) idx[h] = i; });
  for (let i = 1; i < aoa.length; i++) { const a = aoa[i]; if (!a || a.every(isBlank)) continue; const r = {}; entry.header.forEach(c => { r[c] = a[idx[c]] === undefined ? null : a[idx[c]]; }); entry.rows.push(r); }
  finishEntry(entry); return true;
}
function parseDaftar(entry, aoa){
  const h = aoa[0].map(x => x == null ? "" : String(x).trim().toLowerCase());
  const iT = h.findIndex(x => /^tanggal pengis/.test(x)), iN = h.indexOf("nim"); if (iT < 0 || iN < 0) return false;
  const col = re => h.findIndex(x => re.test(x));
  const iNama = col(/^nama$/), iP = col(/^program studi/), iM = col(/^tahun masuk/), iA = col(/^tahun (alumni|lulus)/), iTel = col(/telp|telepon/), iE = col(/^email/);
  entry.kind = "daftar"; entry.header = aoa[0].map(x => x == null ? "" : String(x));
  for (let i = 1; i < aoa.length; i++) { const a = aoa[i]; if (!a || a.every(isBlank)) continue; const nim = nimKey(a[iN]); if (!nim) continue;
    entry.rows.push({ nim, nama: txt(a[iNama]), prodiNama: iP >= 0 ? txt(a[iP]) : null, tahunMasuk: iM >= 0 ? num(a[iM]) : null, tahunLulus: iA >= 0 ? num(a[iA]) : null, telp: iTel >= 0 ? a[iTel] : null, email: iE >= 0 ? txt(a[iE]) : null, tgl: parseTanggal(a[iT]), raw: a }); }
  const names = [...new Set(entry.rows.map(r => r.prodiNama).filter(Boolean))];
  if (!entry.rows.length) entry.errors.push("Daftar pengisian tidak berisi baris data.");
  else if (names.length > 1) entry.errors.push("Daftar pengisian berisi lebih dari satu prodi (" + names.join(", ") + "). Tarik ulang per prodi.");
  entry.prodiNama = names[0] || null; return true;
}
function parseInfo(aoa){
  const o = { catatan: [] };
  aoa.forEach(r => { const k = String(r[0] == null ? "" : r[0]).trim(); if (!k || k === "kunci") return; const v = r[2];
    if (k === "catatan") { if (!isBlank(v)) o.catatan.push(String(v).trim()); return; }
    o[k] = v instanceof Date ? isoDate(v) : isBlank(v) ? null : String(v).trim(); });
  return o;
}
async function readFile(file){
  const out = [];
  try {
    let wb;
    if (/\.csv$/i.test(file.name)) wb = XLSX.read(await file.text(), { type: "string", raw: true });
    else wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    if (wb.SheetNames.includes("Info Tarikan")) {
      const info = parseInfo(sheetAoa(wb.Sheets["Info Tarikan"]));
      const period = info.periode_dari && info.periode_sampai ? { from: info.periode_dari, to: info.periode_sampai, src: "paket CARU" } : null;
      const pk = { name: file.name, info };
      ["Versi 2021", "Versi 2019", "Daftar Pengisian"].forEach(sn => {
        if (!wb.Sheets[sn]) return; const aoa = sheetAoa(wb.Sheets[sn]); if (aoa.length < 2) return;
        const e = newEntry(file.name, file.size); e.sheet = sn; e.paket = pk; e.period = period;
        if (!parseVersi(e, aoa) && !parseDaftar(e, aoa)) e.errors.push("Sheet " + sn + " di dalam paket tidak dikenali.");
        out.push(e);
      });
      if (!out.length) { const e = newEntry(file.name, file.size); e.errors.push("Paket tidak berisi data."); out.push(e); }
      return out;
    }
    const e = newEntry(file.name, file.size); out.push(e);
    const aoa = sheetAoa(wb.Sheets[wb.SheetNames[0]]);
    if (!aoa.length) { e.errors.push("File kosong."); return out; }
    if (!parseVersi(e, aoa) && !parseDaftar(e, aoa)) e.errors.push("Format tidak dikenali. Unggah file paket dari CARU, atau file dari tombol Download Versi 2021, Download Versi 2019, dan Download Data Mahasiswa di sistem tracer.");
    e.period = periodFromName(file.name);
  } catch (err) { const e = newEntry(file.name, file.size); e.errors.push("File tidak bisa dibaca. Pastikan file berasal dari tarikan sistem atau paket CARU dan tidak rusak."); out.push(e); }
  return out;
}
function finishEntry(entry){
  const codes = [...new Set(entry.rows.map(r => num(r.kdpstmsmh)).filter(v => v !== null))];
  if (!entry.rows.length) entry.errors.push("Tidak ada baris data.");
  else if (codes.length > 1) entry.errors.push("File berisi lebih dari satu prodi (" + codes.join(", ") + "). Tarik ulang per prodi.");
  else entry.prodi = codes[0] ?? null;
}
function fullProdiName(f){ return (f.paket && f.paket.info && f.paket.info.prodi) || f.prodiNama || null; }
function crossValidate(){
  const ok = f => !f.errors.length;
  state.files.forEach(f => { f.crossError = null; f.crossWarn = null; f.grp = f.kind === "versi" ? f.prodi : null; });
  const vf = state.files.filter(f => ok(f) && f.kind === "versi" && f.prodi != null), df = state.files.filter(f => ok(f) && f.kind === "daftar");
  // hubungkan daftar pengisian dengan prodi (kode dari file kuesioner) lewat NIM yang sama; satu daftar = satu prodi
  df.forEach(d => { const set = new Set(d.rows.map(r => r.nim)); const hits = {};
    vf.forEach(f => { const n = f.rows.filter(r => set.has(nimKey(r.nimhsmsmh))).length; if (n) hits[f.prodi] = (hits[f.prodi] || 0) + n; });
    const best = Object.keys(hits).sort((p, q) => hits[q] - hits[p])[0];
    if (best != null) { d.grp = Number(best); if (d.prodiNama) PRODI_DYN[d.grp] = shortProdi(d.prodiNama); }
    else if (vf.length) d.crossError = "Tidak ada satu pun NIM di daftar ini yang cocok dengan file kuesioner. Pastikan daftar berasal dari prodi dan periode yang sama."; });
  // nama lengkap prodi per kelompok (dari paket atau daftar) untuk menentukan fakultas
  const fullName = {}; state.files.forEach(f => { if (f.grp != null && !f.crossError) { const n = fullProdiName(f); if (n && !fullName[f.grp]) fullName[f.grp] = n; } });
  state.files.forEach(f => { if (f.paket && f.paket.info && f.paket.info.prodi && f.grp != null) PRODI_DYN[f.grp] = PRODI_DYN[f.grp] || shortProdi(f.paket.info.prodi); });
  const fakOf = g => { const pk = state.files.find(f => f.grp === g && f.paket && f.paket.info && f.paket.info.fakultas); return (pk && pk.paket.info.fakultas) || (fullName[g] && FAKULTAS[fullName[g]]) || null; };
  const order = [...new Set(state.files.filter(f => f.grp != null && !f.crossError && ok(f)).map(f => f.grp))];
  const refG = order.find(g => fakOf(g)), refF = refG != null ? fakOf(refG) : null;
  if (refF) order.forEach(g => { const fk = fakOf(g); if (fk && fk !== refF) state.files.filter(f => f.grp === g).forEach(f => { f.crossError = "Fakultas berbeda: " + prodiLabel(g) + " milik " + fk + ", sedangkan file pertama milik " + refF + ". Unggah prodi dari satu fakultas saja."; }); });
  const seen = {}; state.files.forEach(f => { const k = f.name + "|" + f.size + "|" + (f.sheet || ""); if (seen[k] && !f.crossError) f.crossError = "File yang sama sudah diunggah."; seen[k] = true; });
  // periode file kuesioner mentah tanpa periode di nama: diambil dari daftar pengisian yang NIM-nya cocok
  state.files.forEach(f => { f.periodShown = f.period ? periodText(f.period) : ""; if (!f.period && f.kind === "versi") { const d = df.find(d => d.period && f.rows.some(r => d.rows.some(x => x.nim === nimKey(r.nimhsmsmh)))); f.periodShown = d ? periodText(d.period) + " (dari daftar pengisian)" : ""; } });
}
function kindLabel(f){ return f.kind === "daftar" ? "Daftar pengisian" : f.version ? VERSIONS[f.version].label : "-"; }
function renderFiles(){
  crossValidate();
  const has = state.files.length > 0;
  $("fileTableWrap").hidden = !has; $("btnClear").hidden = !has;
  $("fileRows").innerHTML = state.files.map(f => {
    const err = f.errors[0] || f.crossError;
    const noPer = !err && !f.periodShown;
    const status = err ? '<span class="pill bad">Ditolak</span><div class="note" style="margin-top:6px;max-width:42ch">' + esc(err) + "</div>"
      : '<span class="pill ok">Siap</span>' + (noPer ? '<div class="note" style="margin-top:6px;max-width:34ch">Periode tidak diketahui. Unggah juga file Download Data Mahasiswa dari tarikan yang sama.</div>' : "") + (f.warnings.length ? '<div class="note" style="margin-top:6px">' + esc(f.warnings.join(" ")) + "</div>" : "");
    const prod = f.kind === "daftar" ? esc(shortProdi(f.prodiNama) || "-") : f.prodi != null ? esc(prodiLabel(f.prodi)) : "-";
    return "<tr><td>" + esc(f.name) + (f.paket ? '<div class="note">Paket CARU · sheet ' + esc(f.sheet) + "</div>" : "") + '</td><td><span class="pill ver">' + esc(kindLabel(f)) + "</span></td><td>" + (f.periodShown ? esc(f.periodShown) : '<span class="note">-</span>') + "</td><td>" + prod + '</td><td class="num">' + fmt(f.rows.length) + "</td><td>" + status + '</td><td><button class="btn-link" data-remove="' + f.id + '">Hapus</button></td></tr>';
  }).join("");
  const bad = state.files.filter(f => f.errors.length || f.crossError), good = state.files.filter(f => !f.errors.length && !f.crossError);
  const noVer = good.length && !good.some(f => f.kind === "versi");
  const noDaftar = good.some(f => f.kind === "versi") && !good.some(f => f.kind === "daftar");
  $("uploadMsg").innerHTML = bad.length ? '<div class="msg bad">' + bad.length + " file ditolak. Hapus file yang ditolak untuk melanjutkan.</div>"
    : noVer ? '<div class="msg warn">Belum ada file kuesioner (Versi 2021 atau Versi 2019). Daftar pengisian saja tidak cukup untuk membuat dasbor.</div>'
    : noDaftar ? '<div class="msg warn">Tanpa daftar pengisian, tanggal pengisian, tahun masuk, dan pemeriksaan baris di luar periode tidak tersedia. Dasbor tetap bisa dibuat.</div>' : "";
  $("btnProcess").disabled = !has || bad.length > 0 || noVer;
  $("btnProcess").classList.toggle("ready", !$("btnProcess").disabled);
}
async function addFiles(list){ for (const f of list) state.files.push(...await readFile(f)); renderFiles(); }
