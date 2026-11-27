"use strict";
/* ================= EXPORT PPT ================= */
// Palet laporan: Ungu UNPRI (struktur) dengan aksen Anggur (sorotan), mengikuti tata letak CEDC Green System
const PP = { deep: "3D107A", acc: "6A2BC2", ang: "8A2F7C", light: "B794F6", angL: "E59CD6", soft: "F4EFFC", line: "DCCFF5", soft2: "FBF0F8", line2: "F0D2E8", paper: "F7F5FB", card: "FFFFFF", cardLine: "E7E3EF", ink: "16112A", ink2: "3A3350", muted: "625A78", muted2: "8E87A0", neu: "C9C6D3", run: "92400E", runBg: "FFFBEB", runLine: "FDE68A" };
// warna grafik dibedakan menurut terang-gelap, bukan hanya rona: ungu tua, ungu, lavender, merah muda, anggur, abu
const PCOL = { "var(--c1)": PP.deep, "var(--c2)": PP.acc, "var(--c3)": PP.light, "var(--neg)": PP.angL, "var(--neg2)": PP.ang, "var(--neu)": PP.neu, hi: PP.angL };
const PAL = { likert: [PP.deep, PP.light, PP.neu, PP.angL, PP.ang], f15: [PP.light, PP.deep, PP.angL, PP.ang] };
const lum = hex => { const c = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const colOf = c => { if (!c) return null; if (PCOL[c]) return PCOL[c]; const h = String(c).replace("#", ""); return /^[0-9A-F]{6}$/i.test(h) ? h.toUpperCase() : null; };
const FD = "Plus Jakarta Sans", FB = "Manrope", FM = "IBM Plex Mono";
const SH = { type: "outer", color: "16112A", opacity: 0.13, blur: 8, offset: 2, angle: 90 };
const plain = h => { const d = document.createElement("div"); d.innerHTML = String(h == null ? "" : h).replace(/<span class="tag-pre">([^<]*)<\/span>/g, " ($1)"); return d.textContent.replace(/\s+/g, " ").trim(); };
function loadScript(src, integrity){ return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; if (integrity) { s.integrity = integrity; s.crossOrigin = "anonymous"; } s.onload = ok; s.onerror = () => no(new Error("Pustaka pendukung gagal dimuat. Periksa koneksi internet lalu coba lagi.")); document.head.appendChild(s); }); }
async function gradText(text, from, to, px, maxW){
  try { await document.fonts.load("800 " + px + 'px "Plus Jakarta Sans"'); } catch (e) {}
  const scale = 2, font = "800 " + px * scale + 'px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  const m = document.createElement("canvas").getContext("2d"); m.font = font;
  const lines = []; String(text).split("\n").forEach(par => { let cur = ""; par.split(" ").forEach(w => { const t = cur ? cur + " " + w : w; if (m.measureText(t).width > maxW * scale && cur) { lines.push(cur); cur = w; } else cur = t; }); lines.push(cur); });
  const lh = px * scale * 1.12, pad = px * scale * 0.12, W = Math.ceil(Math.max(...lines.map(l => m.measureText(l).width)) + pad * 2), H = Math.ceil(lh * lines.length + pad * 2);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d"); c.font = font; c.textBaseline = "top";
  const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#" + from); g.addColorStop(1, "#" + to); c.fillStyle = g;
  lines.forEach((l, i) => c.fillText(l, pad, pad + i * lh));
  return { data: cv.toDataURL("image/png"), w: W / scale / 96, h: H / scale / 96 };
}
// teks filter untuk judul, cover, dan nama file: "Semua lulusan", "Lulusan 2023 dan 2024", "Lulusan 2016 sampai 2020"
function lulusanText(f){
  const ys = f && f.tahun ? [...f.tahun].filter(y => y !== "Kosong").map(Number) : [];
  if (!ys.length) return "Semua lulusan";
  const t = yrList(ys), i = t.lastIndexOf(", ");
  return "Lulusan " + (i > 0 ? t.slice(0, i) + " dan " + t.slice(i + 2) : t);
}
function jenisText(f){ return f && f.jenis === "pre" ? "Diisi sebelum wisuda" : f && f.jenis === "post" ? "Diisi setelah lulus" : ""; }
function pptFileName(c, f){
  const per = c.period ? fmtTgl(c.period.from) + " sd " + fmtTgl(c.period.to) : "";
  return [(state.example ? "CONTOH " : "") + "Laporan Tracer Study", prodiShortOf(c), lulusanText(f), jenisText(f), per ? "Periode isi " + per : ""].filter(Boolean).join("_").replace(/[\\/:*?"<>|]/g, "") + ".pptx";
}
// R = hasil dasbor kuesioner utama (versi 2021 bila ada), A = hasil versi 2019 untuk lampiran (boleh null)
async function buildPpt(R, A, opt){
  if (!window.PptxGenJS) await loadScript("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js", "sha384-Cck14aA9cifjYolcnjebXRfWGkz5ltHMBiG4px/j8GS+xQcb7OhNQWZYyWjQ+UwQ");
  opt = opt || {}; const REP = R;
  if (!REP) throw new Error("Tidak ada alumni pada filter ini.");
  const c = state.compiled, v = REP.v, prodi = prodiShortOf(c), per = c.period ? periodText(c.period) : "", N = REP.N;
  const f = REP.filt || {}, lulTxt = lulusanText(f), jnsTxt = jenisText(f), filtTxt = [f.tahun && f.tahun.size ? lulTxt.toLowerCase() : "", jnsTxt.toLowerCase()].filter(Boolean).join("; ");
  const pptx = new PptxGenJS(); pptx.layout = "LAYOUT_WIDE"; pptx.author = "CARU CEDC UNPRI"; pptx.company = "Universitas Prima Indonesia"; pptx.title = "Laporan Tracer Study " + prodi;
  const footTxt = "Tracer Study " + prodi + (per ? " · " + per : "") + " · CARU CEDC UNPRI";
  let page = 0;
  const notes = (s, parts) => s.addNotes(parts.filter(Boolean).join("\n\n"));
  const backTxt = back => (back || []).filter(Boolean).map(([k, t]) => k + ": " + plain(t)).join("\n");
  const base = () => { const s = pptx.addSlide(); s.background = { color: PP.paper }; page++; return s; };
  const foot = s => { s.addText(footTxt, { x: 0.6, y: 7.02, w: 10.5, h: 0.3, fontFace: FM, fontSize: 9, color: PP.muted2, margin: 0 }); s.addText(String(page), { x: 11.9, y: 7.02, w: 0.83, h: 0.3, fontFace: FM, fontSize: 9, color: PP.muted2, align: "right", margin: 0 }); };
  const pill = (s, text, x, y, o) => { o = o || {}; const w = Math.min(7, 0.42 + text.length * 0.095); s.addText(text.toUpperCase(), { shape: pptx.ShapeType.roundRect, rectRadius: 0.19, x, y, w, h: 0.34, fill: { color: o.bg || PP.soft }, line: { color: o.line || PP.line, width: 0.75 }, fontFace: FB, fontSize: 10, bold: true, color: o.color || PP.acc, charSpacing: 1.5, align: "center", valign: "middle", margin: 0 }); return w; };
  const header = (s, eyebrow, title, sub) => { pill(s, eyebrow, 0.6, 0.45); s.addText(title, { x: 0.6, y: 0.9, w: 12.1, h: 0.95, fontFace: FD, fontSize: title.length > 150 ? 18 : title.length > 105 ? 20 : 24, bold: true, color: PP.ink, valign: "top", margin: 0, fit: "shrink" }); if (sub) s.addText(sub, { x: 0.6, y: 1.82, w: 12.1, h: 0.36, fontFace: FB, fontSize: 12.5, color: PP.muted, margin: 0, fit: "shrink" }); };
  const cardBox = (s, x, y, w, h, o) => { o = o || {}; s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.14, fill: { color: o.fill || PP.card }, line: { color: o.line || PP.cardLine, width: 0.75 }, shadow: Object.assign({}, SH) }); };
  const logo = (s, x, y, w) => s.addImage({ data: LOGO_PNG, x, y, w, h: w * 304 / 360 });
  const kop = (s, x, y, dark) => { logo(s, x, y, 0.95); s.addText([{ text: "CEDC UNPRI", options: { fontFace: FD, fontSize: 20, bold: true, color: dark ? "FFFFFF" : PP.deep, breakLine: true } }, { text: "Career and Alumni Relations Unit", options: { fontFace: FB, fontSize: 13, bold: true, color: dark ? PP.angL : PP.acc, breakLine: true } }, { text: "Career, Entrepreneurship, and Development Center", options: { fontFace: FB, fontSize: 9.5, color: dark ? "E9E3F5" : PP.muted } }], { x: x + 1.15, y: y + 0.02, w: 5.6, h: 0.8, margin: 0, valign: "middle" }); };

  /* ---------- grafik ---------- */
  const sortRest = items => items.filter(q => !isRest(q)).concat(items.filter(q => isRest(q)));
  function chartBar(s, spec, x, y, w, h, dir){
    const items = spec.items.filter(q => q && q.label != null), base = spec.base || items.reduce((t, q) => t + q.n, 0) || 1, pct = dir === "bar" || spec.base;
    if (!items.length) { s.addText("Belum ada jawaban pada basis ini.", { x, y, w, h: 0.4, fontFace: FB, fontSize: 12, color: PP.muted }); return; }
    const colors = items.map(q => colOf(q.color) || PP.acc);
    if (colors.length === 1) colors.push(colors[0]);
    const data = [{ name: spec.name || "Alumni", labels: items.map(q => q.label), values: items.map(q => pct ? q.n / base : q.n) }];
    const n = items.length, fs = n > 9 ? 9.5 : n > 6 ? 10.5 : 11.5, mxv = Math.max(...data[0].values);
    s.addChart(pptx.ChartType.bar, data, { x, y, w, h, barDir: dir, barGrouping: "clustered", chartColors: colors, barGapWidthPct: dir === "bar" ? 40 : 55,
      catAxisOrientation: dir === "bar" ? "maxMin" : "minMax", catAxisLabelFontFace: FB, catAxisLabelFontSize: fs, catAxisLabelColor: PP.ink2, catAxisLineShow: false,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: mxv * (dir === "bar" ? 1.22 : 1.15) || 1,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: pct ? "0.0%" : "#,##0", dataLabelFontFace: FB, dataLabelFontSize: fs, dataLabelFontBold: true, dataLabelColor: PP.ink, showLegend: false,
      showCatAxisTitle: !!spec.xTitle, catAxisTitle: spec.xTitle || "", catAxisTitleFontSize: 10, catAxisTitleColor: PP.muted });
  }
  function chartStack(s, spec, x, y, w, h){
    const rows = spec.rows.filter(r => r.counts.reduce((a, b) => a + b, 0) > 0); if (!rows.length) return;
    const labW = Math.min(2.8, w * 0.28), rightW = spec.right ? 0.9 : 0, bw = w - labW - rightW - 0.1;
    const cols = spec.pal ? PAL[spec.pal] : (spec.colors || []).map(c => colOf(c) || PP.acc);
    let lx = x + labW, ly = y; spec.series.forEach((nm, i) => { const col = cols[i] || PP.acc, tw = 0.3 + nm.length * 0.075; if (lx > x + labW && lx + tw + 0.2 > x + w) { lx = x + labW; ly += 0.28; }
      s.addShape(pptx.ShapeType.roundRect, { x: lx, y: ly + 0.08, w: 0.16, h: 0.16, rectRadius: 0.03, fill: { color: col }, line: { color: col, width: 0.5 } }); s.addText(nm, { x: lx + 0.2, y: ly, w: tw, h: 0.32, fontFace: FB, fontSize: 9.5, color: PP.ink2, margin: 0, valign: "middle" }); lx += tw + 0.35; });
    const legH = ly - y + 0.32;
    const rh = Math.min(0.62, (h - legH - 0.1) / rows.length), bh = rh * 0.62;
    rows.forEach((r, i) => { const ry = y + legH + 0.12 + i * rh, tot = r.counts.reduce((a, b) => a + b, 0);
      s.addText(r.label + (r.pre ? " (sebelum wisuda)" : "") + "\n" + fmt(tot) + " alumni", { x, y: ry, w: labW - 0.1, h: bh, fontFace: FB, fontSize: 10, color: PP.ink2, margin: 0, valign: "middle", fit: "shrink" });
      let cx = x + labW; r.counts.forEach((q, k) => { if (!q) return; const ww = bw * q / tot, col = cols[k] || PP.acc, dark = lum(col) < 0.2;
        s.addShape(pptx.ShapeType.rect, { x: cx, y: ry, w: ww, h: bh, fill: { color: col }, line: { color: "FFFFFF", width: 0.75 } });
        if (q / tot >= 0.07 && ww > 0.45) s.addText(fpct(q, tot), { x: cx, y: ry, w: ww, h: bh, fontFace: FB, fontSize: 9.5, bold: true, color: dark ? "FFFFFF" : PP.ink, align: "center", valign: "middle", margin: 0 });
        cx += ww; });
      if (spec.right) s.addText(fpct(r.counts[0] + r.counts[1], tot) + "\n" + spec.right, { x: x + w - rightW, y: ry, w: rightW, h: bh, fontFace: FB, fontSize: 10, bold: true, color: PP.deep, align: "right", valign: "middle", margin: 0 });
    });
  }
  function chartMatrix(s, spec, x, y, w, h){
    const pts = spec.pts; if (!pts.length) return;
    const all = pts.flatMap(p => [p.a, p.b]); let lo = Math.floor(Math.min(...all) * 10 - 0.5) / 10, hi = Math.ceil(Math.max(...all) * 10 + 0.5) / 10; lo = Math.max(1, lo); hi = Math.min(5, hi);
    const L = x + 0.75, B = y + h - 0.6, side = Math.min(w * 0.55, h - 0.75), R = L + side, T = B - side;
    const X = vv => L + (vv - lo) / (hi - lo) * side, Y = vv => B - (vv - lo) / (hi - lo) * side;
    s.addShape(pptx.ShapeType.rect, { x: L, y: T, w: X(spec.meanA) - L, h: Y(spec.meanB) - T, fill: { color: PP.soft2 }, line: { color: PP.soft2, width: 0 } });
    s.addText("Prioritas perbaikan", { x: L + 0.08, y: T + 0.06, w: 2.4, h: 0.3, fontFace: FD, fontSize: 11, bold: true, color: PP.ang, margin: 0 });
    s.addShape(pptx.ShapeType.line, { x: L, y: B, w: side, h: 0, line: { color: PP.neu, width: 1 } });
    s.addShape(pptx.ShapeType.line, { x: L, y: T, w: 0, h: side, line: { color: PP.neu, width: 1 } });
    s.addShape(pptx.ShapeType.line, { x: X(spec.meanA), y: T, w: 0, h: side, line: { color: PP.muted2, width: 0.75, dashType: "dash" } });
    s.addShape(pptx.ShapeType.line, { x: L, y: Y(spec.meanB), w: side, h: 0, line: { color: PP.muted2, width: 0.75, dashType: "dash" } });
    s.addShape(pptx.ShapeType.line, { x: L, y: T, w: side, h: side, flipV: true, line: { color: PP.ang, width: 1.5, dashType: "dash" } });
    const step = (hi - lo) > 1.2 ? 0.5 : 0.2;
    for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) { const tv = Math.round(t * 10) / 10;
      s.addText(fdec(tv, 1), { x: X(tv) - 0.3, y: B + 0.04, w: 0.6, h: 0.22, fontFace: FB, fontSize: 9, color: PP.muted, align: "center", margin: 0 });
      s.addText(fdec(tv, 1), { x: L - 0.5, y: Y(tv) - 0.11, w: 0.42, h: 0.22, fontFace: FB, fontSize: 9, color: PP.muted, align: "right", margin: 0 }); }
    s.addText("Dikuasai saat lulus →", { x: R - 3, y: B + 0.28, w: 3, h: 0.25, fontFace: FB, fontSize: 9.5, color: PP.muted, align: "right", margin: 0 });
    s.addText("Dibutuhkan pekerjaan →", { x: L - 0.75 - 1.05, y: T + side / 2 - 0.13, w: 2.4, h: 0.26, rotate: 270, fontFace: FB, fontSize: 9.5, color: PP.muted, align: "center", margin: 0 });
    s.addText("Garis anggur: dikuasai = dibutuhkan", { x: R - 3.4, y: B - 0.34, w: 3.3, h: 0.26, fontFace: FD, fontSize: 9.5, bold: true, color: PP.ang, align: "right", margin: 0 });
    const ord = pts.slice().sort((p, q) => (q.b - q.a) - (p.b - p.a));
    const TOPN = 10, more = ord.length - TOPN;
    ord.slice(TOPN).forEach(p => s.addShape(pptx.ShapeType.ellipse, { x: X(p.a) - 0.05, y: Y(p.b) - 0.05, w: 0.1, h: 0.1, fill: { color: PP.light }, line: { color: "FFFFFF", width: 0.5 } }));
    ord.slice(0, TOPN).forEach((p, n) => { const px = X(p.a), py = Y(p.b);
      s.addText(String(n + 1), { shape: pptx.ShapeType.ellipse, x: px - 0.11, y: py - 0.11, w: 0.22, h: 0.22, fill: { color: PP.deep }, line: { color: "FFFFFF", width: 1 }, fontFace: FD, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 }); });
    const lx = R + 0.5, lw = x + w - lx; if (lw < 2) return;
    s.addText(more > 0 ? TOPN + " selisih terbesar dari " + ord.length + " kompetensi (titik kecil: " + more + " kompetensi lain)" : "Urut dari selisih terbesar", { x: lx, y: T, w: lw, h: 0.3, fontFace: FB, fontSize: 10, bold: true, color: PP.muted, margin: 0 });
    const shown = ord.slice(0, TOPN), rh = Math.min(0.5, (side - 0.4) / shown.length);
    shown.forEach((p, n) => { const yy = T + 0.4 + n * rh, gap = p.b - p.a, inPrio = p.a < spec.meanA && p.b >= spec.meanB && gap > (spec.gapMin || 0.05);
      s.addText(String(n + 1), { shape: pptx.ShapeType.ellipse, x: lx, y: yy + 0.04, w: 0.28, h: 0.28, fill: { color: PP.deep }, line: { color: PP.deep, width: 0 }, fontFace: FD, fontSize: 9.5, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      s.addText([{ text: p.label, options: { bold: true, color: PP.ink, breakLine: true } }, { text: "Dikuasai " + fdec(p.a, 2) + " · dibutuhkan " + fdec(p.b, 2) + (inPrio ? " · prioritas" : ""), options: { fontSize: 9, color: inPrio ? PP.ang : PP.muted } }], { x: lx + 0.38, y: yy, w: lw - 0.4, h: rh, fontFace: FB, fontSize: 10.5, margin: 0, valign: "top", fit: "shrink" }); });
  }
  function chartDumb(s, spec, x, y, w, h){
    const LIM = 12, pts = spec.pts.slice(0, LIM); if (!pts.length) return;
    if (spec.pts.length > LIM) { s.addText(LIM + " selisih terbesar dari " + spec.pts.length + " kompetensi. Daftar lengkap ada di dasbor.", { x, y: y + h - 0.28, w, h: 0.26, fontFace: FB, fontSize: 9.5, color: PP.muted, margin: 0 }); h -= 0.32; }
    const all = pts.flatMap(p => [p.a, p.b]); const lo = Math.max(1, Math.floor(Math.min(...all) * 5 - 0.5) / 5), hi = Math.min(5, Math.ceil(Math.max(...all) * 5 + 0.5) / 5);
    const labW = 2.9, rW = 1.5, L = x + labW, Wd = w - labW - rW, X = vv => L + (vv - lo) / (hi - lo) * Wd;
    s.addShape(pptx.ShapeType.ellipse, { x: L, y: y + 0.07, w: 0.15, h: 0.15, fill: { color: "FFFFFF" }, line: { color: PP.acc, width: 1.5 } });
    s.addText("Dikuasai saat lulus", { x: L + 0.2, y: y, w: 1.8, h: 0.3, fontFace: FB, fontSize: 9.5, color: PP.ink2, margin: 0, valign: "middle" });
    s.addShape(pptx.ShapeType.ellipse, { x: L + 2.1, y: y + 0.07, w: 0.15, h: 0.15, fill: { color: PP.deep }, line: { color: PP.deep, width: 1 } });
    s.addText("Dibutuhkan pekerjaan", { x: L + 2.3, y: y, w: 2, h: 0.3, fontFace: FB, fontSize: 9.5, color: PP.ink2, margin: 0, valign: "middle" });
    const rh = Math.min(0.55, (h - 0.5) / pts.length);
    pts.forEach((p, i) => { const cy = y + 0.5 + i * rh + rh / 2, xa = X(p.a), xb = X(p.b), gap = p.b - p.a;
      s.addText(p.label, { x, y: cy - rh / 2, w: labW - 0.15, h: rh, fontFace: FB, fontSize: 10.5, color: PP.ink2, align: "right", valign: "middle", margin: 0, fit: "shrink" });
      s.addShape(pptx.ShapeType.line, { x: L, y: cy, w: Wd, h: 0, line: { color: PP.cardLine, width: 0.75 } });
      s.addShape(pptx.ShapeType.line, { x: Math.min(xa, xb), y: cy, w: Math.abs(xb - xa), h: 0, line: { color: gap > 0 ? PP.angL : PP.light, width: 3 } });
      s.addShape(pptx.ShapeType.ellipse, { x: xa - 0.08, y: cy - 0.08, w: 0.16, h: 0.16, fill: { color: "FFFFFF" }, line: { color: PP.acc, width: 1.5 } });
      s.addShape(pptx.ShapeType.ellipse, { x: xb - 0.08, y: cy - 0.08, w: 0.16, h: 0.16, fill: { color: PP.deep }, line: { color: PP.deep, width: 1 } });
      s.addText([{ text: Math.abs(gap) < 0.005 ? "Sama" : (gap > 0 ? "Kurang " : "Lebih ") + fdec(Math.abs(gap), 2), options: { bold: true, color: gap > 0.005 ? PP.ang : PP.deep, breakLine: true } }, { text: fdec(p.a, 2) + " → " + fdec(p.b, 2), options: { color: PP.muted, fontSize: 8.5 } }], { x: x + w - rW + 0.1, y: cy - rh / 2, w: rW - 0.1, h: rh, fontFace: FB, fontSize: 10, valign: "middle", margin: 0 }); });
  }
  function chartTable(s, spec, x, y, w, h){
    const head = spec.head.map(t => ({ text: t, options: { bold: true, color: PP.deep, fill: { color: PP.soft }, fontSize: 9.5, valign: "middle" } }));
    const baseRgb = [[61, 16, 122], [106, 43, 194], [138, 47, 124], [142, 135, 160]];
    const body = spec.rows.map((r, ri) => r.cells.map((t, k) => { const gi = k - 2, o = { fontSize: 9.5, color: PP.ink2, valign: "middle", fill: { color: ri % 2 ? "FBFAFD" : "FFFFFF" } };
      if (gi >= 0 && gi < r.pcts.length && !r.small) { const a = 0.08 + r.pcts[gi] / 100 * 0.8, b = baseRgb[gi] || baseRgb[3]; const mix = b.map(v => Math.round(255 - (255 - v) * a)); o.fill = { color: mix.map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase() }; if (a > 0.5) o.color = "FFFFFF"; o.align = "center"; }
      else if (k > 0) o.align = "center";
      return { text: t, options: o }; }));
    const colW = [2.2, 0.9].concat(Array(spec.head.length - 3).fill((w - 3.1 - 1.6) / (spec.head.length - 3))).concat([1.6]);
    s.addTable([head].concat(body), { x, y, w, colW, fontFace: FB, border: { type: "solid", pt: 0.5, color: PP.cardLine }, rowH: Math.min(0.4, h / (body.length + 1)), autoPage: false });
  }
  function chartFacts(s, spec, x, y, w, h){
    const items = spec.items.slice(0, 10), rh = Math.min(0.62, h / items.length);
    items.forEach(([n, t], i) => { const cy = y + i * rh, txt = plain(t), lv = /^Kuning/.test(txt) ? "Kuning" : /^Jingga/.test(txt) ? "Jingga" : /^Catatan/.test(txt) ? "Catatan" : "";
      const col = lv === "Kuning" ? PP.run : lv === "Jingga" ? PP.ang : PP.deep;
      s.addText(String(n), { x, y: cy, w: 1.3, h: rh - 0.08, fontFace: FD, fontSize: 15, bold: true, color: col, valign: "middle", margin: 0, fit: "shrink" });
      s.addText(txt.replace(/^(Kuning|Jingga|Catatan)\s*/, ""), { x: x + 1.4, y: cy, w: w - 2.95, h: rh - 0.04, fontFace: FB, fontSize: items.length > 7 ? 9.5 : 10.5, color: PP.ink2, valign: "middle", margin: 0, fit: "shrink" });
      if (lv) s.addText(lv === "Jingga" ? "Terisi paksa" : lv === "Kuning" ? "Bertentangan" : "Catatan", { x: x + w - 1.35, y: cy + (rh - 0.08) / 2 - 0.13, w: 1.3, h: 0.26, shape: pptx.ShapeType.roundRect, rectRadius: 0.13, fill: { color: lv === "Kuning" ? PP.runBg : lv === "Jingga" ? PP.soft2 : PP.soft }, line: { color: lv === "Kuning" ? PP.runLine : lv === "Jingga" ? PP.line2 : PP.line, width: 0.5 }, fontFace: FB, fontSize: 8.5, bold: true, color: col, align: "center", valign: "middle", margin: 0 }); });
  }
  function chartMethod(s, spec, x, y, w, h){
    const items = spec.items.slice(0, 12), rh = h / items.length;
    items.forEach(([l, t], i) => { const cy = y + i * rh;
      if (i) s.addShape(pptx.ShapeType.line, { x, y: cy, w, h: 0, line: { color: PP.cardLine, width: 0.75 } });
      s.addText(plain(l), { x, y: cy, w: 1.9, h: rh, fontFace: FD, fontSize: 11, bold: true, color: PP.deep, valign: "middle", margin: 0 });
      s.addText(plain(t), { x: x + 2.0, y: cy, w: w - 2.0, h: rh, fontFace: FB, fontSize: items.length > 8 ? 9 : 10, color: PP.ink2, valign: "middle", margin: 0, fit: "shrink" }); });
  }
  function chartWf(s, spec, x, y, w, h){
    const st = spec.steps, mx = Math.max(1, ...st.map(q => q.total || 0)), B = y + h - 0.62, T = y + 0.42, cw = w / st.length, Y = v => B - v / mx * (B - T);
    s.addShape(pptx.ShapeType.line, { x, y: B, w, h: 0, line: { color: PP.neu, width: 1 } });
    let run = 0;
    st.forEach((q, i) => { const bx = x + i * cw + cw * 0.18, bw = cw * 0.64; let y0, hh, col;
      if (q.total != null) { run = q.total; y0 = Y(run); hh = B - y0; col = i === st.length - 1 ? PP.ang : PP.deep; }
      else { const top = Y(run); run -= q.minus; y0 = top; hh = Y(run) - top; col = PP.angL; }
      s.addShape(pptx.ShapeType.rect, { x: bx, y: y0, w: bw, h: Math.max(hh, 0.03), fill: { color: col }, line: { color: col, width: 0 } });
      const val = q.total != null ? fmt(q.total) + (i === st.length - 1 && st[0].total ? " · " + fpct(q.total, st[0].total) : "") : "−" + fmt(q.minus);
      s.addText(val, { x: bx - 0.3, y: y0 - 0.36, w: bw + 0.6, h: 0.32, fontFace: FD, fontSize: 14, bold: true, color: q.total != null ? (i === st.length - 1 ? PP.ang : PP.ink) : PP.ang, align: "center", margin: 0 });
      s.addText(q.label.join("\n"), { x: bx - 0.35, y: B + 0.06, w: bw + 0.7, h: 0.5, fontFace: FB, fontSize: 10.5, color: PP.ink2, align: "center", valign: "top", margin: 0 });
      if (i < st.length - 1) s.addShape(pptx.ShapeType.line, { x: bx + bw, y: Y(run), w: cw - bw, h: 0, line: { color: PP.muted2, width: 0.75, dashType: "dash" } }); });
  }
  function drawSpec(s, spec, x, y, w, h){
    if (spec.note) { const nh = spec.note.length > 160 ? 0.5 : 0.3; s.addText(plain(spec.note), { x, y: y + h - nh, w, h: nh, fontFace: FB, fontSize: 9.5, color: PP.muted, margin: 0, valign: "top", fit: "shrink" }); h -= nh + 0.08; }
    if (spec.t === "bar") chartBar(s, spec, x, y, w, h, "bar");
    else if (spec.t === "col") chartBar(s, spec, x, y, w, h, "col");
    else if (spec.t === "stack") chartStack(s, spec, x, y, w, h);
    else if (spec.t === "matrix") chartMatrix(s, spec, x, y, w, h);
    else if (spec.t === "dumb") chartDumb(s, spec, x, y, w, h);
    else if (spec.t === "table") chartTable(s, spec, x, y, w, h);
    else if (spec.t === "facts") chartFacts(s, spec, x, y, w, h);
    else if (spec.t === "method") chartMethod(s, spec, x, y, w, h);
    else if (spec.t === "wf") chartWf(s, spec, x, y, w, h);
  }

  /* ---------- 1. cover ---------- */
  let s = base();
  s.addShape(pptx.ShapeType.ellipse, { x: 9.6, y: -1.6, w: 5.4, h: 5.4, fill: { color: PP.soft }, line: { color: PP.soft, width: 0 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 10.6, y: -0.9, w: 3.2, h: 3.2, fill: { color: PP.soft2 }, line: { color: PP.soft2, width: 0 } });
  kop(s, 0.75, 0.6, false);
  pill(s, "Laporan Tracer Study", 0.75, 2.35);
  const ct = await gradText("Tracer Study\n" + prodi, PP.deep, PP.angL, 54, 900);
  const cw = Math.min(ct.w, 10.5), ch = ct.h * cw / ct.w; s.addImage({ data: ct.data, x: 0.68, y: 2.85, w: cw, h: ch, altText: "Tracer Study " + prodi });
  s.addText((c.fakultas ? c.fakultas + ". " : "") + "Status kerja, masa tunggu, keselarasan, dan kompetensi alumni berdasarkan kuesioner tracer study " + VERSIONS[v].label.toLowerCase() + (A ? ", dengan lampiran kuesioner versi 2019" : "") + " (format Kemdikbud)." + (opt.noV21 ? " Tidak ada alumni kuesioner versi 2021 pada lulusan yang dipilih." : ""), { x: 0.75, y: 2.95 + ch, w: 9.2, h: 0.75, fontFace: FB, fontSize: 14, color: PP.muted, margin: 0, valign: "top" });
  let mx = 0.75; [[per ? "Periode isi " + per : "", true], [lulTxt + (jnsTxt ? ", " + jnsTxt.toLowerCase() : ""), true], [fmt(N) + " alumni" + (A ? " versi 2021, " + fmt(A.N) + " versi 2019" : ""), false], [state.example ? "Contoh fiktif" : "", false]].filter(q => q[0]).forEach(([t, a]) => { const w = 0.45 + t.length * 0.088; s.addText(t, { shape: pptx.ShapeType.roundRect, rectRadius: 0.19, x: mx, y: 6.3, w, h: 0.4, fill: { color: a ? PP.soft2 : "FFFFFF" }, line: { color: a ? PP.line2 : PP.cardLine, width: 0.75 }, fontFace: FB, fontSize: 11, bold: true, color: a ? PP.ang : PP.ink2, align: "center", valign: "middle", margin: 0 }); mx += w + 0.15; });
  notes(s, ["Laporan ini dibuat otomatis dari Dasbor Tracer Study CARU CEDC UNPRI.", "Sumber: kuesioner tracer study " + VERSIONS[v].label.toLowerCase() + ", " + fmt(N) + " alumni" + (per ? ", periode pengisian " + per : "") + ".", filtTxt ? "Filter dasbor saat ekspor: " + filtTxt + "." : ""]);

  /* ---------- 2. ringkasan ---------- */
  s = base(); header(s, "Ringkasan", "Ringkasan temuan " + prodi);
  const sumList = REP.sum.concat(A ? ["Lampiran di bagian akhir membahas " + fmt(A.N) + " alumni yang mengisi kuesioner versi 2019 (lulusan " + yrText(A.years) + "). Angkanya dipisah karena pertanyaan kedua kuesioner berbeda."] : []);
  const sumY0 = 1.75, sumH = REP.pre ? 4.15 : 4.95, sh = sumH / Math.max(sumList.length, 1);
  sumList.forEach((t, i) => { const yy = sumY0 + i * sh;
    s.addText(String(i + 1), { shape: pptx.ShapeType.roundRect, rectRadius: 0.08, x: 0.6, y: yy + 0.06, w: 0.42, h: 0.42, fill: { color: PP.soft }, line: { color: PP.line, width: 0.75 }, fontFace: FD, fontSize: 14, bold: true, color: PP.deep, align: "center", valign: "middle", margin: 0 });
    s.addText(plain(t), { x: 1.2, y: yy, w: 11.5, h: sh - 0.08, fontFace: FB, fontSize: 14, color: PP.ink2, valign: "top", margin: 0, fit: "shrink" }); });
  if (REP.pre) s.addText([{ text: "Catatan data  ", options: { bold: true } }, { text: fmt(REP.pre.n) + " dari " + fmt(REP.pre.N) + " alumni adalah " + REP.pre.lbl + ". Angka mereka menggambarkan kondisi menjelang lulus, bukan hasil tracer study satu tahun setelah lulus." }], { shape: pptx.ShapeType.roundRect, rectRadius: 0.1, x: 0.6, y: 6.05, w: 12.1, h: 0.75, fill: { color: PP.runBg }, line: { color: PP.runLine, width: 0.75 }, fontFace: FB, fontSize: 11.5, color: PP.run, valign: "middle", margin: 0.15 });
  foot(s); notes(s, ["Ringkasan dihitung otomatis dari data yang sama dengan dasbor.", REP.pre ? "Sebagian besar alumni mengisi sebelum wisuda; sampaikan ini setiap kali angka kerja dibacakan." : ""]);

  /* ---------- 3. angka utama ---------- */
  const statCards = (s, st, y, h, cmp) => { const kw = (12.1 - 3 * 0.25) / 4;
  if (cmp) { st.forEach((k, i) => { const x = 0.6 + i * (kw + 0.25), hl = i === 3; cardBox(s, x, y, kw, h, hl ? { fill: PP.soft2, line: PP.line2 } : {});
      s.addText(plain(k.v), { x: x + 0.22, y: y + 0.18, w: kw - 0.44, h: 0.7, fontFace: FD, fontSize: 30, bold: true, color: hl ? PP.ang : PP.deep, margin: 0, fit: "shrink" });
      s.addText(plain(k.k), { x: x + 0.22, y: y + 0.92, w: kw - 0.44, h: 0.5, fontFace: FB, fontSize: 12, bold: true, color: PP.ink, margin: 0, valign: "top" });
      s.addText(plain(k.sub), { x: x + 0.22, y: y + 1.45, w: kw - 0.44, h: h - 1.55, fontFace: FB, fontSize: 9.5, color: PP.muted, margin: 0, valign: "top", fit: "shrink" }); }); return; }
  st.forEach((k, i) => { const x = 0.6 + i * (kw + 0.25), hl = i === 3;
    cardBox(s, x, y, kw, h, hl ? { fill: PP.soft2, line: PP.line2 } : {});
    s.addText(plain(k.v), { x: x + 0.25, y: y + 0.3, w: kw - 0.5, h: 0.95, fontFace: FD, fontSize: 40, bold: true, color: hl ? PP.ang : PP.deep, margin: 0, fit: "shrink" });
    s.addText(plain(k.k), { x: x + 0.25, y: y + 1.3, w: kw - 0.5, h: 0.6, fontFace: FB, fontSize: 14, bold: true, color: PP.ink, margin: 0, valign: "top" });
    s.addText(plain(k.sub), { x: x + 0.25, y: y + 1.95, w: kw - 0.5, h: 0.95, fontFace: FB, fontSize: 11, color: PP.muted, margin: 0, valign: "top", fit: "shrink" });
    if (k.track) { const tx = x + 0.25, tw = kw - 0.5, ty = y + h - 0.6;
      s.addShape(pptx.ShapeType.roundRect, { x: tx, y: ty, w: tw, h: 0.13, rectRadius: 0.06, fill: { color: PP.cardLine }, line: { color: PP.cardLine, width: 0 } });
      s.addShape(pptx.ShapeType.roundRect, { x: tx, y: ty, w: Math.max(0.05, tw * Math.min(100, k.track.val) / 100), h: 0.13, rectRadius: 0.06, fill: { color: hl ? PP.ang : PP.acc }, line: { color: hl ? PP.ang : PP.acc, width: 0 } });
      if (k.track.target != null) s.addShape(pptx.ShapeType.rect, { x: tx + tw * Math.min(100, k.track.target) / 100 - 0.02, y: ty - 0.07, w: 0.04, h: 0.27, fill: { color: PP.ink }, line: { color: PP.ink, width: 0 } });
      s.addText(k.track.target != null ? "Target " + fdec(k.track.target) + "%" : "Target belum diisi", { x: tx, y: ty + 0.18, w: tw, h: 0.25, fontFace: FM, fontSize: 9, color: PP.muted, margin: 0 }); } }); };
  s = base(); const st = REP.stats; const iku = st[3];
  const sv = k => N < 30 ? plain(String(k.sub).split(";")[0]).replace(/ alumni$/, "") : plain(k.v);
  header(s, "Angka utama", sv(st[1]) + " alumni sudah bekerja atau berwirausaha; " + (iku && /IKU 2/.test(iku.k) ? "perkiraan awal IKU 2: " : "kerja atau studi dalam 12 bulan: ") + (iku ? sv(iku) : "-"), "Basis: " + fmt(N) + " alumni kuesioner " + VERSIONS[v].label.toLowerCase() + " · " + lulTxt.toLowerCase() + (jnsTxt ? " · " + jnsTxt.toLowerCase() : ""));
  statCards(s, st, 2.4, 3.6);
  if (REP.pre) s.addText("Catatan: " + fmt(REP.pre.n) + " dari " + fmt(REP.pre.N) + " alumni mengisi sebelum wisuda.", { x: 0.6, y: 6.25, w: 12.1, h: 0.35, fontFace: FB, fontSize: 11, color: PP.run, margin: 0 });
  foot(s); notes(s, st.map(k => plain(k.k) + " (" + plain(k.v) + ")\n" + backTxt(k.back)));

  /* ---------- 4. slide per kartu ---------- */
  const slideOne = (k, eb) => { s = base();
    header(s, eb || k.sec || "Temuan", plain(k.title), plain(k.q));
    cardBox(s, 0.6, 2.35, 12.1, 4.45);
    drawSpec(s, k.ppt, 0.9, 2.6, 11.5, 4.0);
    foot(s); notes(s, [plain(k.title), plain(k.q), backTxt(k.back)]); };
  const slidePair = (k, nx, title, eb) => { s = base();
    header(s, eb || k.sec || "Temuan", plain(title || k.sec || k.title));
    [k, nx].forEach((q, j) => { const x = 0.6 + j * 6.175;
      cardBox(s, x, 1.95, 5.925, 4.85);
      s.addText(plain(q.q), { x: x + 0.25, y: 2.1, w: 5.4, h: 0.4, fontFace: FB, fontSize: 9.5, color: PP.muted, margin: 0, fit: "shrink" });
      s.addText(plain(q.title), { x: x + 0.25, y: 2.5, w: 5.4, h: 0.8, fontFace: FD, fontSize: 14, bold: true, color: PP.ink, margin: 0, valign: "top", fit: "shrink" });
      drawSpec(s, q.ppt, x + 0.2, 3.35, 5.5, 3.3); });
    foot(s); notes(s, [k, nx].map(q => plain(q.title) + "\n" + plain(q.q) + "\n" + backTxt(q.back))); };
  const slideCards = (cards, eb) => { for (let i = 0; i < cards.length; i++) {
    const k = cards[i], nx = cards[i + 1];
    const small = q => ["bar", "col"].includes(q.ppt.t) && q.ppt.items.filter(z => z && z.label != null).length <= 7;
    if (!k.wide && nx && !nx.wide && nx.sec === k.sec && small(k) && small(nx)) { slidePair(k, nx, null, eb); i++; } else slideOne(k, eb); } };
  const NOTE19 = ["Lampiran versi 2019", "Memakai filter tahun lulus yang sama dengan laporan utama. Status kerja diambil dari F8 dan F9, masa tunggu dari F5, dan kompetensi memakai butir versi 2019, sehingga angkanya tidak digabung dengan versi 2021."];
  slideCards(REP.cards.filter(k => k.ppt).map(k => A && k.ppt.t === "method" ? Object.assign({}, k, { ppt: Object.assign({}, k.ppt, { items: k.ppt.items.concat([NOTE19]) }) }) : k));

  /* ---------- 5. tindak lanjut ---------- */
  s = base(); header(s, "Tindak lanjut", "Rencana tindak lanjut " + prodi, "Diisi oleh pimpinan fakultas atau prodi berdasarkan temuan pada slide sebelumnya.");
  [["Temuan yang ditindaklanjuti", "Contoh: kompetensi dengan selisih terbesar, masa tunggu lebih dari 6 bulan."], ["Rencana tindakan", "Program, mata kuliah, atau layanan karier yang akan disesuaikan."], ["Penanggung jawab dan waktu", "Unit pelaksana, target capaian, dan tenggat."]].forEach(([t, d], j) => { const x = 0.6 + j * 4.1;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.4, w: 3.9, h: 4.3, rectRadius: 0.14, fill: { color: PP.soft }, line: { color: PP.light, width: 1, dashType: "dash" } });
    s.addText(String(j + 1), { shape: pptx.ShapeType.roundRect, rectRadius: 0.08, x: x + 0.25, y: 2.65, w: 0.42, h: 0.42, fill: { color: PP.deep }, line: { color: PP.deep, width: 0 }, fontFace: FD, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    s.addText(t, { x: x + 0.25, y: 3.2, w: 3.4, h: 0.5, fontFace: FD, fontSize: 15, bold: true, color: PP.ink, margin: 0 });
    s.addText(d, { x: x + 0.25, y: 3.75, w: 3.4, h: 0.8, fontFace: FB, fontSize: 11, color: PP.muted, margin: 0, valign: "top" }); });
  foot(s);

  /* ---------- 6. lampiran kuesioner versi 2019 ---------- */
  if (A) {
    const EB = "Lampiran versi 2019", ak = key => A.cards.find(k => k.key === key && k.ppt);
    s = base();
    pill(s, "Lampiran", 0.6, 0.75);
    s.addText("Kuesioner versi 2019", { x: 0.6, y: 1.25, w: 12.1, h: 0.9, fontFace: FD, fontSize: 36, bold: true, color: PP.deep, margin: 0 });
    s.addText("Sebagian alumni mengisi kuesioner tracer study versi 2019. Pertanyaannya berbeda dari versi 2021, sehingga angkanya disajikan terpisah di bagian ini dan tidak digabung dengan temuan utama.", { x: 0.6, y: 2.2, w: 10.5, h: 0.8, fontFace: FB, fontSize: 14, color: PP.ink2, margin: 0, valign: "top" });
    [[fmt(A.N) + " alumni", "mengisi kuesioner versi 2019 pada filter ini"], ["Lulusan " + yrText(A.years), "tahun lulus responden versi 2019"], A.outL ? [fmt(A.outL) + " alumni", "tidak ada di daftar pengisian periode ini; kemungkinan mengisi sebelum periode dimulai"] : ["Semua", "ada di daftar pengisian periode ini"]].forEach(([a, b], j) => { const x = 0.6 + j * 4.1;
      cardBox(s, x, 3.3, 3.9, 1.45);
      s.addText(a, { x: x + 0.25, y: 3.45, w: 3.4, h: 0.6, fontFace: FD, fontSize: 22, bold: true, color: j === 2 && A.outL ? PP.ang : PP.deep, margin: 0, fit: "shrink" });
      s.addText(b, { x: x + 0.25, y: 4.05, w: 3.4, h: 0.6, fontFace: FB, fontSize: 11, color: PP.muted, margin: 0, valign: "top" }); });
    s.addText([{ text: "Cara membaca  ", options: { bold: true, color: PP.deep } }, { text: "Filter tahun lulus sama dengan laporan utama (" + lulTxt.toLowerCase() + "). " + (A.N < 30 ? "Jumlah alumni di bawah 30 orang, jadi judul memakai jumlah orang, bukan persen, dan lampiran hanya memuat topik utama. " : "") + "Rincian lengkap ada di dasbor tab Versi 2019 dan di Excel kompilasi." }], { shape: pptx.ShapeType.roundRect, rectRadius: 0.1, x: 0.6, y: 5.15, w: 12.1, h: 0.95, fill: { color: PP.soft }, line: { color: PP.line, width: 0.75 }, fontFace: FB, fontSize: 12, color: PP.ink2, valign: "middle", margin: 0.18 });
    foot(s); notes(s, ["Lampiran ini memuat alumni yang mengisi kuesioner versi 2019.", A.outL ? A.outL + " alumni tidak ada di daftar pengisian periode tarikan; mereka tetap dihitung." : ""]);
    // angka utama versi 2019 dan perbandingan dengan versi 2021
    s = base(); const sa = A.stats;
    header(s, EB, "Angka utama versi 2019: " + (A.N < 30 ? plain(String(sa[1].sub).split(";")[0]).replace(/ alumni$/, "") : plain(sa[1].v)) + " alumni bekerja atau berwirausaha", "Basis: " + fmt(A.N) + " alumni kuesioner versi 2019 · " + lulTxt.toLowerCase());
    const cmp = REP.v === "v2021";
    statCards(s, sa, 2.35, cmp ? 2.2 : 3.6, cmp);
    if (cmp) { const pick = k => plain(k.v) + "\n" + plain(String(k.sub).split(";")[0]);
      const head = ["Indikator", "Versi 2021", "Versi 2019", "Perbedaan cara bertanya"].map(t => ({ text: t, options: { bold: true, color: PP.deep, fill: { color: PP.soft }, fontSize: 10 } }));
      const rows = [[1, "Bekerja atau berwirausaha", "2021: status F8 Bekerja atau Wiraswasta. 2019: F8 bekerja Ya."], [2, "Kerja dalam 6 bulan, dari yang bekerja", "2021: F504 Ya. 2019: F5 sebelum lulus, atau jumlah bulan 6 atau kurang."], [3, "Kerja atau studi dalam 12 bulan", "Cara hitung sama; studi lanjut versi 2019 diambil dari F9."]]
        .map(([i, l, d]) => [l, pick(REP.stats[i]), pick(sa[i]), d].map((t, k) => ({ text: t, options: { fontSize: 10, color: k === 3 ? PP.muted : PP.ink2, bold: k === 1 || k === 2, valign: "middle" } })));
      s.addTable([head].concat(rows), { x: 0.6, y: 4.75, w: 12.1, colW: [3.0, 2.0, 2.0, 5.1], fontFace: FB, border: { type: "solid", pt: 0.5, color: PP.cardLine }, rowH: 0.42, autoPage: false }); }
    foot(s); notes(s, sa.map(k => plain(k.k) + " (" + plain(k.v) + ")\n" + backTxt(k.back)));
    if (A.N >= 30) slideCards(A.cards.filter(k => k.ppt && !["facts", "method"].includes(k.ppt.t)), EB);
    else {
      const inc = ak("income"); if (inc) slideOne(Object.assign({}, inc, { q: inc.q + (A.weighted != null ? " · IKU 2 dengan bobot gaji resmi: " + fdec(A.weighted) + "%" : "") }), EB);
      const a14 = ak("f14"), a15 = ak("f15"); if (a14 && a15) slidePair(a14, a15, "Keselarasan pekerjaan dengan bidang dan jenjang studi", EB); else [a14, a15].filter(Boolean).forEach(k => slideOne(k, EB));
      const dm = ak("dumb"); if (dm) slideOne(Object.assign({}, dm, { q: "Lima selisih terbesar dari " + dm.ppt.pts.length + " kompetensi versi 2019 · " + fmt(A.N) + " alumni", ppt: Object.assign({}, dm.ppt, { pts: dm.ppt.pts.slice(0, 5) }) }), EB);
      const aj = ak("jalur"), at = ak("f11"); if (aj && at) slidePair(aj, at, "Jalur mencari kerja dan tempat kerja", EB); else [aj, at].filter(Boolean).forEach(k => slideOne(k, EB));
    }
  }

  /* ---------- 7. closing ---------- */
  s = pptx.addSlide(); page++; s.background = { color: PP.deep };
  // motif latar: batang naik seperti grafik capaian, warna ungu terang tembus pandang
  [[9.0, 3.3, 1.7], [10.05, 2.5, 2.5], [11.1, 1.6, 3.4], [12.15, 0.6, 4.4]].forEach(([bx, by, bh], k) => s.addShape(pptx.ShapeType.roundRect, { x: bx, y: by, w: 0.8, h: bh, rectRadius: 0.12, fill: { color: k === 3 ? PP.angL : PP.light, transparency: k === 3 ? 72 : 82 }, line: { color: PP.light, width: 0, transparency: 100 } }));
  s.addShape(pptx.ShapeType.ellipse, { x: 12.25, y: 0.05, w: 0.6, h: 0.6, fill: { color: PP.angL, transparency: 60 }, line: { color: PP.angL, width: 0, transparency: 100 } });
  kop(s, 0.75, 0.6, true);
  const cl = await gradText("Terima kasih", "FFFFFF", PP.angL, 66, 900); const clw = Math.min(cl.w, 8); s.addImage({ data: cl.data, x: 0.68, y: 2.7, w: clw, h: cl.h * clw / cl.w, altText: "Terima kasih" });
  s.addText("Data diolah dari tarikan sistem tracer study dan dapat ditelusuri per alumni di Excel kompilasi.", { x: 0.75, y: 2.85 + cl.h * clw / cl.w, w: 7.6, h: 0.75, fontFace: FB, fontSize: 14, color: "E9E3F5", margin: 0 });
  [["DASBOR", "ilmanakbareffendi.github.io/dasbor-tracer-study"], ["DISUSUN OLEH", "CARU CEDC UNPRI"], ["PERIODE PENGISIAN", per || "-"]].forEach(([a, b], j) => { const x = 0.75 + j * 4.0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 5.55, w: 3.8, h: 1.0, rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 0.75 } });
    s.addText([{ text: a, options: { fontFace: FM, fontSize: 9.5, bold: true, color: PP.ang, breakLine: true } }, { text: b, options: { fontFace: FB, fontSize: 13, bold: true, color: PP.ink } }], { x: x + 0.22, y: 5.6, w: 3.4, h: 0.9, margin: 0, valign: "middle", fit: "shrink" }); });

  return { pptx, name: pptFileName(c, f) };
}
