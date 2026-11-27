"use strict";
/* ================= BUAT PAKET (khusus CARU, dibuka lewat #caru) ================= */
// Menggantikan skill pemaketan: tiga file tarikan sistem + screenshot layar menjadi satu file paket,
// lengkap dengan hasil cek, pesan WhatsApp, dan satu baris log untuk Google Sheet.
const LOG_SHEET = "https://docs.google.com/spreadsheets/d/10MbPnIJZfT61aFiuvfGPrR9iTfjhEVHfOyuBLptzrQQ/edit";
const WEB_LINK = "https://ilmanakbareffendi.github.io/dasbor-tracer-study/";
const OCR_CDN = { lib: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js", libIntegrity: "sha384-GJqSu7vueQ9qN0E9yLPb3Wtpd7OrgK8KmYzC8T1IysG1bcvxvIO4qtYR/D3A991F", worker: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js", core: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1", lang: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int" };
const BULAN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const PK = { v21: null, v19: null, daftar: null, shots: [], ocr: { status: "", fields: {}, notes: [] }, result: null };
const pkF = { prodiLayar: "", tahunMasuk: "", tahapan: "", dari: "", sampai: "", total: "", n21: "", n19: "", tarik: new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10) };
const tglPanjang = s => { const p = String(s).split("-").map(Number); return p.length === 3 ? p[2] + " " + BULAN_PANJANG[p[1] - 1] + " " + p[0] : s; };
const shortNama = n => { for (const [a, b] of [["Sarjana Terapan ", "D4 "], ["Sarjana ", "S1 "], ["Magister ", "S2 "], ["Doktor ", "S3 "]]) if (n.startsWith(a)) return b + n.slice(a.length); return n; };

/* ---------- membaca file ---------- */
async function pkRead(file){
  if (/^image\//.test(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name)) { PK.shots.push(file); return "shot"; }
  if (/\.csv$/i.test(file.name)) {
    const text = await file.text(), wb = XLSX.read(text, { type: "string", raw: true }), ws = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }).map(r => r.map(v => v == null ? "" : String(v))).filter(r => r.some(v => v.trim()));
    const h = (aoa[0] || []).map(x => x.trim().toLowerCase());
    if (!h.includes("f501") && !h.includes("f1701")) throw new Error(file.name + ": bukan file Download Versi 2019.");
    PK.v19 = { file, aoa }; return "v19";
  }
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellNF: true });
  if (wb.SheetNames.includes("Info Tarikan")) throw new Error(file.name + " sudah berupa paket. Unggah di halaman utama untuk melihat dasbornya.");
  const ws = wb.Sheets[wb.SheetNames[0]], aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
  const h = (aoa[0] || []).map(x => String(x == null ? "" : x).trim().toLowerCase());
  if (h.includes("f504") && h.includes("f5a1")) { PK.v21 = { file, ws, aoa }; return "v21"; }
  if (h.some(x => /^tanggal pengis/.test(x)) && h.includes("nim")) { PK.daftar = { file, ws, aoa }; return "daftar"; }
  throw new Error(file.name + ": format tidak dikenali. Gunakan file dari tombol Download Versi 2021, Download Versi 2019, atau Download Data Mahasiswa.");
}
async function pkAdd(list){
  const msgs = []; let shot = false;
  for (const f of list) { try { const k = await pkRead(f); if (k === "shot") shot = true; } catch (e) { msgs.push(e.message); } }
  pkApplyFiles(); pkRender(msgs);
  if (shot) await pkOcr();
}

/* ---------- membaca screenshot (OCR di browser) ---------- */
let pkWorker = null;
async function pkOcr(){
  PK.ocr.status = "Membaca screenshot. Pertama kali perlu mengunduh mesin pembaca teks (sekitar 5 MB)."; pkRender();
  try {
    if (!window.Tesseract) await loadScript(OCR_CDN.lib, OCR_CDN.libIntegrity);
    if (!pkWorker) pkWorker = await Tesseract.createWorker("eng", 1, { workerPath: OCR_CDN.worker, corePath: OCR_CDN.core, langPath: OCR_CDN.lang });
    const texts = [];
    for (let i = 0; i < PK.shots.length; i++) { PK.ocr.status = "Membaca screenshot " + (i + 1) + " dari " + PK.shots.length + "."; pkRender(); const { data } = await pkWorker.recognize(PK.shots[i]); texts.push(data.text); }
    const r = pkParseShots(texts); PK.ocr.fields = r.fields; PK.ocr.notes = r.notes;
    Object.entries(r.fields).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== "") pkF[k] = String(v); });
    PK.ocr.status = "done";
  } catch (e) { PK.ocr.status = "Screenshot gagal dibaca (" + (e.message || e) + "). Isi kolom di bawah secara manual."; }
  pkRender();
}
function pkParseShots(texts){
  const fields = {}, notes = [];
  const lines = texts.map(t => t.split("\n").map(l => l.trim()).filter(Boolean));
  // bagian atas: prodi, tahun masuk, tahapan, periode
  const top = lines.flat().find(l => /Periode\s*Pengisian/i.test(l) || /MAHASISWA/.test(l));
  if (top) {
    const low = top.toLowerCase().replace(/\s+/g, " ");
    const prodi = Object.keys(FAKULTAS).filter(n => low.includes(n.toLowerCase())).sort((a, b) => b.length - a.length)[0];
    if (prodi) fields.prodiLayar = prodi; else notes.push("Nama prodi di screenshot tidak cocok dengan katalog prodi; periksa kolom Prodi di layar.");
    const tm = top.match(/Semua Tahun Masuk|\b(?:19|20)\d{2}(?:\/(?:19|20)\d{2})?\b(?=.*Tahapan|.*Semua Tahapan)/i); fields.tahunMasuk = tm ? (/semua/i.test(tm[0]) ? "Semua Tahun Masuk" : tm[0]) : "";
    const th = top.match(/Semua Tahapan Masuk/i); fields.tahapan = th ? "Semua Tahapan Masuk" : "";
    if (!th) notes.push("Isian tahapan masuk tidak terbaca; isi manual.");
    const d = top.match(/(\d{2})\/(\d{2})\/(\d{4})\s*s\s*\/?\s*d\s*(\d{2})\/(\d{2})\/(\d{4})/i);
    if (d) { fields.dari = d[3] + "-" + d[2] + "-" + d[1]; fields.sampai = d[6] + "-" + d[5] + "-" + d[4]; } else notes.push("Periode pengisian di screenshot tidak terbaca.");
  } else notes.push("Screenshot bagian atas (isian prodi dan periode) tidak ditemukan.");
  // bagian bawah: nomor baris terakhir dan batas versi 2021 dan 2019
  let best = null;
  lines.forEach(ls => {
    const rows = ls.map(l => l.match(/^\W*(\d{1,5})\S?\s+\S.*?Tahun\s*(20(?:19|21))\b/i)).filter(Boolean).map(m => ({ n: +m[1], v: m[2] }));
    if (!rows.length) return;
    // nomor yang salah baca (mis. "11" terbaca "1") diperbaiki dari urutan baris
    for (let i = 1; i < rows.length; i++) if (rows[i].n !== rows[i - 1].n + 1) rows[i].n = rows[i - 1].n + 1;
    const last = rows[rows.length - 1].n; if (!best || last > best.last) best = { rows, last };
  });
  if (best) {
    fields.total = best.last;
    const has19 = best.rows.some(r => r.v === "2019"), last21 = [...best.rows].reverse().find(r => r.v === "2021");
    if (!has19) { fields.n21 = best.last; fields.n19 = 0; }
    else if (last21) { fields.n21 = last21.n; fields.n19 = best.last - last21.n; }
    else notes.push("Batas baris versi 2021 dan 2019 tidak terlihat di screenshot; isi jumlahnya manual.");
  } else notes.push("Screenshot bagian bawah daftar (nomor baris terakhir) tidak ditemukan.");
  return { fields, notes };
}

/* ---------- pemeriksaan dan paket ---------- */
function pkApplyFiles(){
  PK.namePeriod = PK.daftar ? periodFromName(PK.daftar.file.name) : null;
  PK.rawNotes = []; if (PK.v21) pkCopy(PK.v21.ws, "Versi 2021", PK.rawNotes); if (PK.daftar) pkCopy(PK.daftar.ws, "Daftar Pengisian", PK.rawNotes);
}
function pkInfo(src){
  if (!src) return { n: 0, nims: [], kode: [], lulus: {} };
  const aoa = src.aoa, h = aoa[0].map(x => String(x == null ? "" : x).trim().toLowerCase()), iN = h.indexOf("nimhsmsmh"), iK = h.indexOf("kdpstmsmh"), iL = h.indexOf("tahun_lulus");
  const body = aoa.slice(1).filter(r => r && r.some(v => !isBlank(v)));
  const lulus = {}; body.forEach(r => { lulus[nimKey(r[iN])] = nimKey(r[iL]); });
  return { n: body.length, nims: body.map(r => nimKey(r[iN])), kode: [...new Set(body.map(r => nimKey(r[iK])).filter(Boolean))], lulus };
}
function pkCompute(){
  if (!PK.daftar && !PK.v21 && !PK.v19) return null;
  const noD = !PK.daftar, dA = noD ? [[]] : PK.daftar.aoa, dh = dA[0].map(x => String(x == null ? "" : x).trim()), col = re => dh.findIndex(x => re.test(x));
  const iN = col(/^NIM$/i), iP = col(/^Program Studi/i), iA = col(/^Tahun (Alumni|Lulus)/i);
  const daftar = {}; dA.slice(1).forEach(r => { const k = r && nimKey(r[iN]); if (k) daftar[k] = r; });
  const prodiNames = [...new Set(dA.slice(1).map(r => r && iP >= 0 && !isBlank(r[iP]) ? String(r[iP]).trim() : null).filter(Boolean))].sort();
  const prodi = prodiNames[0] || pkF.prodiLayar || "";
  const per = PK.namePeriod, dari = per ? per.from : pkF.dari, sampai = per ? per.to : pkF.sampai;
  const i21 = pkInfo(PK.v21), i19 = pkInfo(PK.v19), kode = [...new Set(i21.kode.concat(i19.kode))].sort(), fakultas = FAKULTAS[prodi] || "";
  const cek = [], add = (level, teks) => cek.push({ level, teks }), ival = s => s === "" || s == null ? null : parseInt(String(s).replace(/\D/g, ""), 10);
  if (noD) add("peringatan", "Data Mahasiswa tidak diunggah. Paket tetap dibuat, tetapi tanggal pengisian, tahun masuk, dan pemeriksaan baris di luar periode tidak tersedia. File versi 2019 dari sistem bisa memuat baris di luar periode yang tidak bisa dipisahkan tanpa Data Mahasiswa. Bila Data Mahasiswa sudah bisa diunduh, buat ulang paketnya.");
  if (noD && !pkF.prodiLayar) add("gagal", "Prodi belum diketahui. Tanpa Data Mahasiswa, prodi diambil dari screenshot; isi kolom Prodi di layar.");
  if (!PK.v21 && !PK.v19) add("gagal", "File kuesioner belum diunggah (Download Versi 2021 dan, bila ada, Download Versi 2019).");
  if (kode.length > 1) add("gagal", "File kuesioner berisi lebih dari satu kode prodi: " + kode.join(", ") + ".");
  if (prodiNames.length > 1) add("gagal", "Daftar pengisian berisi lebih dari satu prodi: " + prodiNames.join(", ") + ".");
  if (pkF.prodiLayar && prodi && pkF.prodiLayar.trim().toLowerCase() !== prodi.toLowerCase()) add("gagal", "Prodi di layar (" + pkF.prodiLayar + ") berbeda dengan prodi di daftar pengisian (" + prodi + ").");
  if (!dari || !sampai) add("gagal", "Periode pengisian belum diketahui: nama file Data Mahasiswa sudah diganti dan periode di screenshot tidak terbaca. Isi kolom periode.");
  if (per && pkF.dari && pkF.sampai && (per.from !== pkF.dari || per.to !== pkF.sampai)) add("peringatan", "Periode di nama file Data Mahasiswa (" + per.from + " sd " + per.to + ") berbeda dengan periode di screenshot (" + pkF.dari + " sd " + pkF.sampai + "). Paket memakai periode dari nama file.");
  const tot = ival(pkF.total), n21 = ival(pkF.n21), n19 = ival(pkF.n19), nD = Object.keys(daftar).length;
  if (tot !== null && !noD) add(tot === nD ? "ok" : "peringatan", "Baris di layar " + tot + "; baris di daftar pengisian " + nD + "." + (tot < nD && PK.ocr.status === "done" ? " Bila screenshot bawah tidak memperlihatkan baris terakhir daftar, ubah angka baris di layar." : ""));
  [["versi 2021", n21, i21], ["versi 2019", n19, i19]].forEach(([l, lay, inf]) => { if (lay !== null) add(lay === inf.n ? "ok" : "peringatan", "Baris " + l + ": di layar " + lay + ", di file " + inf.n + "."); });
  const luar = {};
  [["versi 2021", i21], ["versi 2019", i19]].forEach(([l, inf]) => {
    const out = noD ? [] : inf.nims.filter(n => !daftar[n]); luar[l] = out;
    if (out.length) add("peringatan", out.length + " baris " + l + " tidak ada di daftar pengisian (kemungkinan di luar periode). Contoh NIM: " + out.slice(0, 5).join(", ") + ".");
    const cnt = {}; inf.nims.forEach(n => { cnt[n] = (cnt[n] || 0) + 1; }); const dup = Object.keys(cnt).filter(n => cnt[n] > 1);
    if (dup.length) add("peringatan", dup.length + " NIM ganda di file " + l + ". Contoh: " + dup.slice(0, 5).join(", ") + ".");
  });
  const s19 = new Set(i19.nims), cross = i21.nims.filter(n => s19.has(n));
  if (cross.length) add("peringatan", cross.length + " NIM ada di versi 2021 dan versi 2019 sekaligus; web app memakai isian versi 2021.");
  const all = new Set(i21.nims.concat(i19.nims)), tanpa = noD ? [] : Object.keys(daftar).filter(n => !all.has(n));
  if (tanpa.length) add("peringatan", tanpa.length + " NIM di daftar pengisian tidak ada di file kuesioner. Contoh: " + tanpa.slice(0, 5).join(", ") + ".");
  const beda = [];
  [i21, i19].forEach(inf => Object.entries(inf.lulus).forEach(([n, y]) => { const r = daftar[n], dy = r && iA >= 0 ? nimKey(r[iA]) : null; if (dy && y && dy !== y) beda.push(n + " (" + y + " di file, " + dy + " di daftar)"); }));
  if (beda.length) add("peringatan", beda.length + " alumni dengan tahun lulus berbeda antarfile: " + beda.slice(0, 5).join("; ") + ".");
  (PK.rawNotes || []).forEach(t => add("peringatan", t));
  if (!cek.some(c => c.level !== "ok")) add("ok", "Tidak ada temuan pada tarikan ini.");
  const nama = "Tracer_" + shortNama(prodi) + "_" + (kode[0] || "kode") + "_" + dari + " sd " + sampai + ".xlsx";
  const nLuar = (luar["versi 2021"] || []).length + (luar["versi 2019"] || []).length;
  const lebih19 = noD && n19 !== null && n19 < i19.n ? i19.n - n19 : 0;
  const bagian = [i21.n + " alumni kuesioner versi 2021"].concat(i19.n ? [lebih19 ? i19.n + " baris versi 2019, " + lebih19 + " di antaranya kemungkinan di luar periode" : i19.n + " alumni versi 2019"] : []);
  const wa = "Yth. Pimpinan " + (fakultas || "Fakultas") + " / PIC Tracer Study,\n\nBersama ini kami sampaikan data tracer study " + shortNama(prodi) + " periode pengisian " + tglPanjang(dari) + " sampai " + tglPanjang(sampai) + " (" + bagian.join(" dan ") + ").\n\nMohon file terlampir diunggah melalui tautan berikut untuk memperoleh dasbor dan Excel kompilasi:\n" + WEB_LINK + "\n\n" + (nLuar ? "Catatan: " + nLuar + " baris berada di luar periode pengisian dan sudah ditandai di dasbor serta Excel.\n\n" : noD ? "Catatan: Data Mahasiswa belum dapat diunduh dari sistem, sehingga tanggal pengisian dan tahun masuk belum tersedia di dasbor. Paket lengkap akan kami kirim setelah data tersedia.\n\n" : "") + "Hormat kami,\nCARU CEDC UNPRI";
  const catatan = cek.filter(c => c.level !== "ok").map(c => c.teks).join(" ");
  const log = [pkF.tarik, prodi, kode[0] || "", fakultas, dari, sampai, pkF.tahunMasuk, pkF.tahapan, tot ?? "", i21.n, i19.n, noD ? "" : nD, noD ? "" : nLuar, catatan, nama, "", ""];
  return { prodi, kode, fakultas, dari, sampai, i21, i19, nD, tot, n21, n19, cek, nama, wa, log, gagal: cek.some(c => c.level === "gagal") };
}
// salinan sheet dari sistem: nilai apa adanya; angka 16 digit ke atas jadi teks, angka berformat tanggal yang tidak sah jadi angka biasa
function pkCopy(ws, title, notes){
  const out = {}, rng = XLSX.utils.decode_range(ws["!ref"] || "A1"), head = {};
  for (let c = rng.s.c; c <= rng.e.c; c++) { const h = ws[XLSX.utils.encode_cell({ r: rng.s.r, c })]; head[c] = h ? h.v : ""; }
  Object.keys(ws).forEach(k => { if (k[0] === "!") return; const s = ws[k]; if (s.v === undefined || s.v === null) return; const cell = { t: s.t, v: s.v }; if (s.z) cell.z = s.z;
    if (s.t === "n" && Math.abs(s.v) >= 1e15) { cell.t = "s"; cell.v = s.v.toFixed(0); delete cell.z; }
    else if (s.t === "n" && s.z && XLSX.SSF.is_date(s.z) && (s.v < 1 || s.v > 2958465)) { delete cell.z; if (notes) notes.push(title + " sel " + k + " (" + head[XLSX.utils.decode_cell(k).c] + ") berisi " + s.v + ", bukan tanggal yang sah; disalin sebagai angka apa adanya."); }
    out[k] = cell; });
  out["!ref"] = ws["!ref"]; return out;
}
function pkBuild(R){
  const wb = XLSX.utils.book_new();
  const info = [["kunci", "Keterangan", "Nilai"], ["prodi", "Program studi", R.prodi], ["kode_prodi", "Kode prodi PDDikti", R.kode[0] || null], ["fakultas", "Fakultas", R.fakultas],
    ["periode_dari", "Periode pengisian dari", R.dari], ["periode_sampai", "Periode pengisian sampai", R.sampai], ["filter_tahun_masuk", "Filter tahun masuk", pkF.tahunMasuk || null], ["filter_tahapan", "Filter tahapan masuk", pkF.tahapan || null],
    ["tanggal_tarik", "Tanggal tarik data", pkF.tarik], ["layar_total", "Baris di layar sistem (total)", R.tot], ["layar_v2021", "Baris di layar, versi 2021", R.n21], ["layar_v2019", "Baris di layar, versi 2019", R.n19],
    ["file_v2021", "Baris di file versi 2021", R.i21.n], ["file_v2019", "Baris di file versi 2019", R.i19.n], ["file_daftar", "Baris di daftar pengisian", PK.daftar ? R.nD : null], ["dibuat_oleh", "Disusun oleh", "Dasbor tracer study, mode CARU (CEDC UNPRI)"]]
    .concat(R.cek.filter(c => c.level !== "ok").map(c => ["catatan", "Hasil cek", c.teks]));
  const wsI = XLSX.utils.aoa_to_sheet(info); wsI["!cols"] = [{ wch: 20 }, { wch: 32 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, wsI, "Info Tarikan");
  if (PK.v21) XLSX.utils.book_append_sheet(wb, pkCopy(PK.v21.ws, "Versi 2021"), "Versi 2021");
  if (PK.v19) { const ws = XLSX.utils.aoa_to_sheet(PK.v19.aoa); Object.keys(ws).forEach(k => { if (k[0] !== "!") { ws[k].t = "s"; ws[k].v = String(ws[k].v); ws[k].z = "@"; } }); XLSX.utils.book_append_sheet(wb, ws, "Versi 2019"); }
  if (PK.daftar) XLSX.utils.book_append_sheet(wb, pkCopy(PK.daftar.ws, "Daftar Pengisian"), "Daftar Pengisian");
  return new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array", bookSST: true })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/* ---------- tampilan ---------- */
function pkRender(msgs){
  const slot = (lbl, src, btn) => '<li class="' + (src ? "ok" : "") + '"><b>' + lbl + "</b><span>" + (src ? esc(src.file.name) : "Belum ada · tombol " + btn) + "</span></li>";
  $("pkSlots").innerHTML = slot("Versi 2021", PK.v21, "Download Versi 2021") + slot("Versi 2019", PK.v19, "Download Versi 2019 (boleh tidak ada)") + slot("Data Mahasiswa", PK.daftar, "Download Data Mahasiswa (sangat disarankan)") +
    '<li class="' + (PK.shots.length ? "ok" : "") + '"><b>Screenshot</b><span>' + (PK.shots.length ? PK.shots.length + " gambar" : "Belum ada · bagian atas (isian prodi dan periode) dan bagian bawah daftar") + "</span></li>";
  const o = PK.ocr;
  $("pkOcr").innerHTML = (msgs && msgs.length ? msgs.map(m => '<div class="msg bad">' + esc(m) + "</div>").join("") : "") +
    (o.status && o.status !== "done" ? '<div class="msg warn">' + esc(o.status) + "</div>" : o.status === "done" ? '<div class="msg ok">Screenshot terbaca. Periksa kolom di bawah. Angka baris diambil dari baris terakhir yang terlihat di screenshot bawah; ubah bila ada yang salah.' + (o.notes.length ? "<br>" + o.notes.map(esc).join("<br>") : "") + "</div>" : "");
  const per = PK.namePeriod;
  Object.keys(pkF).forEach(k => { const el = $("pk_" + k); if (el && document.activeElement !== el) el.value = pkF[k]; });
  $("pkPerNote").textContent = per ? "Periode dibaca dari nama file Data Mahasiswa: " + per.from + " sampai " + per.to + "." : PK.daftar ? "Nama file Data Mahasiswa tidak memuat periode; paket memakai periode di kolom ini." : "";
  const R = PK.result = pkCompute();
  $("pkResult").hidden = !R;
  if (!R) return;
  const cls = { ok: "ok", peringatan: "warn", gagal: "bad" }, lbl = { ok: "Sesuai", peringatan: "Peringatan", gagal: "Gagal" };
  $("pkCek").innerHTML = R.cek.map(c => '<li><span class="pill ' + cls[c.level] + '">' + lbl[c.level] + "</span><span>" + esc(c.teks) + "</span></li>").join("");
  $("pkName").textContent = R.nama; $("pkWa").value = R.wa;
  $("pkDownload").disabled = R.gagal; $("pkOpen").disabled = R.gagal;
  $("pkStop").hidden = !R.gagal;
}
async function pkCopyText(text, btn){
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Tersalin"; }
  catch (e) { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); btn.textContent = "Tersalin"; } catch (er) { btn.textContent = "Salin manual"; } t.remove(); }
  setTimeout(() => { btn.textContent = old; }, 1800);
}
function pkRoute(){ $("sec-paket").hidden = location.hash !== "#caru" || !$("sec-dash").hidden; }
(function pkInit(){
  const inp = $("pkInput"), drop = $("pkDrop");
  inp.addEventListener("change", () => { pkAdd([...inp.files]); inp.value = ""; });
  ["dragover", "dragenter"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => pkAdd([...e.dataTransfer.files]));
  document.addEventListener("paste", e => { if ($("sec-paket").hidden) return; const fs = [...(e.clipboardData ? e.clipboardData.files : [])]; if (fs.length) pkAdd(fs.map((f, i) => new File([f], "tempel-" + (PK.shots.length + i + 1) + ".png", { type: f.type }))); });
  Object.keys(pkF).forEach(k => { const el = $("pk_" + k); if (el) el.addEventListener("input", () => { pkF[k] = el.value.trim(); pkRender(); }); });
  $("pkReset").addEventListener("click", () => { PK.v21 = PK.v19 = PK.daftar = null; PK.shots = []; PK.ocr = { status: "", fields: {}, notes: [] }; PK.namePeriod = null; PK.rawNotes = []; ["prodiLayar", "tahunMasuk", "tahapan", "dari", "sampai", "total", "n21", "n19"].forEach(k => { pkF[k] = ""; }); pkRender(); });
  $("pkDownload").addEventListener("click", async () => { const R = PK.result; if (!R || R.gagal) return; await saveFile(R.nama, pkBuild(R)); });
  $("pkOpen").addEventListener("click", async () => { const R = PK.result; if (!R || R.gagal) return; const f = new File([pkBuild(R)], R.nama); resetAll(); await addFiles([f]); if (!$("btnProcess").disabled) $("btnProcess").click(); });
  $("pkCopyWa").addEventListener("click", e => pkCopyText($("pkWa").value, e.currentTarget));
  $("pkCopyLog").addEventListener("click", e => { const R = PK.result; if (R) pkCopyText(R.log.map(v => String(v == null ? "" : v).replace(/[\t\n]+/g, " ")).join("\t"), e.currentTarget); });
  window.addEventListener("hashchange", pkRoute); pkRoute(); pkRender();
})();
