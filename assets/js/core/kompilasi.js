"use strict";
/* ================= KOMPILASI ================= */
function cmpPeriode(a, b){ const na = Number(a), nb = Number(b); if (!isNaN(na) && !isNaN(nb)) return na - nb; return String(a).localeCompare(String(b), "id"); }
const VRANK = { v2019: 0, v2021: 1 };
function compile(files){
  const vfiles = files.filter(f => f.kind === "versi"), dfiles = files.filter(f => f.kind === "daftar");
  // gabungan daftar pengisian: satu NIM dipakai catatan dengan tanggal pengisian terbaru
  const daftar = new Map();
  dfiles.forEach(f => f.rows.forEach(rec => { const old = daftar.get(rec.nim); if (!old || (rec.tgl && (!old.tgl || rec.tgl > old.tgl))) daftar.set(rec.nim, Object.assign({ period: f.period, file: f.name }, rec)); }));
  const filePeriod = f => f.period || (() => { const d = dfiles.find(d => d.period && f.rows.some(r => d.rows.some(x => x.nim === nimKey(r.nimhsmsmh)))); return d ? d.period : null; })();
  const all = [];
  vfiles.forEach((f, fi) => { const fp = filePeriod(f); f.resolvedPeriod = fp;
    f.rows.forEach((r, ri) => { const d = daftar.get(nimKey(r.nimhsmsmh)) || null; const p = (d && d.period) || fp;
      all.push({ r, v: f.version, file: f.paket ? f.name + " (sheet " + f.sheet + ")" : f.name, periode: p ? p.to : fyear(f.name), periodeTxt: p ? periodText(p) : fyear(f.name), d, inList: dfiles.length ? !!d : null, fi, ri }); }); });
  const groups = new Map(); let noNim = 0;
  all.forEach(x => { const k = nimKey(x.r.nimhsmsmh); if (!k) { noNim++; groups.set("__" + x.fi + "_" + x.ri, [x]); return; } if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); });
  const kept = [], dropped = [], dups = []; const stat = { v2021: { up: 0, dupSame: 0, dupCross: 0 }, v2019: { up: 0, dupSame: 0, dupCross: 0 } };
  all.forEach(x => stat[x.v].up++);
  groups.forEach((arr, k) => {
    if (arr.length === 1) { kept.push(Object.assign({ status: "Tunggal" }, arr[0])); return; }
    const sorted = arr.slice().sort((a, b) => VRANK[a.v] - VRANK[b.v] || cmpPeriode(a.periode, b.periode) || a.fi - b.fi || a.ri - b.ri);
    const win = sorted[sorted.length - 1];
    const sig = x => Object.keys(x.r).map(c => { const v = x.r[c]; return v instanceof Date ? v.toISOString().slice(0, 10) : (isBlank(v) ? "" : String(num(v) !== null ? num(v) : String(v).trim())); }).join("|");
    const crossVer = arr.some(x => x.v !== win.v);
    kept.push(Object.assign({ status: "Ganda, dipakai dari " + VERSIONS[win.v].label + " periode " + win.periodeTxt }, win));
    sorted.slice(0, -1).forEach(x => {
      const why = x.v !== win.v ? "Tidak dipakai: NIM yang sama ada di isian " + VERSIONS[win.v].label : "Tidak dipakai: ada isian periode " + win.periodeTxt + " (" + win.file + ")";
      if (x.v !== win.v) stat[x.v].dupCross++; else stat[x.v].dupSame++;
      dropped.push(Object.assign({ status: why }, x));
    });
    dups.push({ nim: k, nama: txt(win.r.nmmhsmsmh), kind: crossVer ? "Antar versi" : (new Set(arr.map(x => x.fi)).size === 1 ? "Dalam satu file" : "Antar file"), identical: !crossVer && arr.every(x => sig(x) === sig(win)), occ: sorted.map(x => VERSIONS[x.v].label + " · " + x.periodeTxt + " · " + x.file), used: VERSIONS[win.v].label + " · " + win.periodeTxt });
  });
  kept.sort((a, b) => a.fi - b.fi || a.ri - b.ri);
  kept.forEach(x => { x.m = model(x); });
  const headers = {}; vfiles.forEach(f => { if (!headers[f.version]) headers[f.version] = f.header.slice(); else f.header.forEach(h => { if (!headers[f.version].includes(h)) headers[f.version].push(h); }); });
  // periode gabungan dan informasi tarikan
  const periods = files.map(f => f.period || f.resolvedPeriod).filter(Boolean);
  const period = periods.length ? { from: periods.map(p => p.from).sort()[0], to: periods.map(p => p.to).sort().slice(-1)[0] } : null;
  const infos = []; files.forEach(f => { if (f.paket && !infos.includes(f.paket)) infos.push(f.paket); });
  const prodi = vfiles[0] ? vfiles[0].prodi : null;
  const prodiNama = (dfiles[0] && dfiles[0].prodiNama) || (infos[0] && infos[0].info.prodi) || null;
  if (prodi != null && prodiNama) PRODI_DYN[prodi] = shortProdi(prodiNama);
  const fakultas = (infos[0] && infos[0].info.fakultas) || (prodiNama && FAKULTAS[prodiNama]) || null;
  const inDaftarNotInFile = dfiles.length ? [...daftar.keys()].filter(k => !groups.has(k)) : [];
  return { all, kept, dropped, dups, noNim, stat, headers, prodi, prodiNama, fakultas, period, infos, hasDaftar: dfiles.length > 0, daftar, daftarFiles: dfiles.map(f => ({ name: f.name, period: f.period, n: f.rows.length, header: f.header, rows: f.rows })), inDaftarNotInFile, fileCount: new Set(files.map(f => f.name)).size, paketCount: infos.length,
    files: files.map(f => ({ name: f.paket ? f.name + " (sheet " + f.sheet + ")" : f.name, kind: f.kind, periode: periodText(f.period || f.resolvedPeriod) || fyear(f.name), n: f.rows.length, v: f.version })) };
}
function wisudaDates(y){ return ((state.settings.wisuda || {})[y] || []).filter(Boolean).map(s => new Date(s + "T00:00:00Z")).filter(d => !isNaN(d)); }
function applyPre(cc){
  if (!cc && state.groups.length > 1) { state.groups.forEach(g => applyPre(g.compiled)); return; }
  const c = cc || state.compiled; if (!c) return;
  if (!Array.isArray(state.settings.pre)) {
    const y21 = (state.groups.length ? state.groups.flatMap(g => g.compiled.kept) : c.kept).filter(x => x.v === "v2021").map(x => x.m.tahun).filter(v => v != null);
    state.settings.pre = y21.length ? [Math.max(...y21)] : [];
  }
  // sebelum wisuda: tahun lulus termasuk pilihan di Pengaturan, dan tanggal pengisian tidak melewati wisuda terakhir tahun itu (bila tanggal wisuda diisi)
  c.kept.concat(c.dropped).forEach(x => { const m = x.m || (x.m = model(x)); const y = m.tahun; let pre = state.settings.pre.includes(y), basis = "tahun lulus";
    if (pre && m.tgl) { if (m.tgl.getUTCFullYear() > y) { pre = false; basis = "tanggal pengisian"; } const ds = wisudaDates(y); if (ds.length) { pre = m.tgl <= new Date(Math.max(...ds)); basis = "tanggal wisuda"; } }
    m.pre = pre; m.preBasis = basis; });
}
function renderCompile(){
  const c = state.compiled; $("exampleBanner").hidden = !state.example;
  const nv = v => c.kept.filter(x => x.v === v).length;
  const tiles = [
    { v: fmt(c.kept.length), k: "Responden unik", b: "Versi 2021: " + fmt(nv("v2021")) + " · Versi 2019: " + fmt(nv("v2019")), hero: true },
    { v: fmt(c.all.length), k: "Total baris kuesioner", b: (c.paketCount ? c.paketCount + " paket" : c.fileCount + " file") + (c.period ? " · periode " + periodText(c.period) : " · periode tidak diketahui") },
    { v: fmt(c.dups.length), k: "NIM ganda", b: c.dups.filter(d => d.kind === "Antar versi").length + " antar versi, " + c.dups.filter(d => d.kind !== "Antar versi").length + " dalam versi yang sama" },
    { v: fmt(c.dropped.length), k: "Baris tidak dipakai", b: "Disimpan di sheet NIM Ganda" }
  ];
  $("compileStats").innerHTML = tiles.map(t => '<div class="stat' + (t.hero ? " hero-stat" : "") + '"><span class="v">' + t.v + '</span><span class="k">' + t.k + '</span><span class="b">' + esc(t.b) + "</span></div>").join("");
  if (!c.dups.length) $("dupBody").innerHTML = '<div class="msg ok">Tidak ada NIM ganda. Setiap alumni hanya muncul satu kali.</div>' + (c.noNim ? '<p class="note">' + c.noNim + " baris tanpa NIM tetap diikutkan sebagai baris terpisah.</p>" : "");
  else {
    const rows = c.dups.slice(0, 300).map(d => '<tr><td class="mono">' + esc(d.nim) + "</td><td>" + esc(d.nama) + "</td><td>" + esc(d.kind) + "</td><td>" + d.occ.map(esc).join("<br>") + "</td><td>" + esc(d.used) + "</td><td>" + (d.kind === "Antar versi" ? '<span class="pill ver">Beda versi</span>' : d.identical ? '<span class="pill ok">Identik</span>' : '<span class="pill warn">Berbeda</span>') + "</td></tr>").join("");
    $("dupBody").innerHTML = '<p class="note">' + c.dups.length + " NIM muncul lebih dari sekali." + (c.noNim ? " " + c.noNim + " baris tanpa NIM diikutkan sebagai baris terpisah." : "") + '</p><details' + (c.dups.length <= 15 ? " open" : "") + '><summary>Lihat daftar NIM ganda</summary><div class="tbl-wrap" style="margin-top:10px"><table><thead><tr><th>NIM</th><th>Nama</th><th>Jenis</th><th>Muncul di</th><th>Dipakai</th><th>Jawaban</th></tr></thead><tbody>' + rows + "</tbody></table></div></details>";
  }
  const outL = c.all.filter(x => x.inList === false).length;
  if (c.hasDaftar) $("dupBody").insertAdjacentHTML("beforeend", outL ? '<div class="msg warn" style="margin-top:10px">' + fmt(outL) + " baris kuesioner tidak ada di daftar pengisian periode ini, kemungkinan diisi di luar periode. Baris tetap ikut dihitung dan ditandai di Excel (kolom status_daftar).</div>" : '<div class="msg ok" style="margin-top:10px">Semua baris kuesioner cocok dengan daftar pengisian.</div>');
  else $("dupBody").insertAdjacentHTML("beforeend", '<div class="msg warn" style="margin-top:10px">Daftar pengisian tidak diunggah, sehingga tanggal pengisian dan tahun masuk tidak tersedia.</div>');
  $("dashMsg").innerHTML = "";
}
