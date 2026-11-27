"use strict";
/* ================= KOMPONEN GRAFIK ================= */
const DARK = ["var(--c1)", "var(--c2)", "var(--neg2)"];
const txtOn = col => DARK.includes(col) ? "#fff" : "var(--ink)";
function barList(items, base, o){
  o = o || {}; let list = items.slice();
  if (o.sort) list.sort((a, b) => b.n - a.n);
  // kategori sisa ("Lainnya", "lain") selalu di bawah, sesuai pedoman urutan ONS
  const rest = x => x.last || /^lainnya|lain$/i.test(x.label);
  list = list.filter(x => !rest(x)).concat(list.filter(rest));
  if (o.hideZero) list = list.filter(x => x.n > 0);
  if (o.top) list = list.slice(0, o.top);
  if (!list.length || !base) return '<p class="note">Belum ada jawaban pada basis ini.</p>';
  return '<div class="bars">' + list.map(x => { const col = x.color || (o.hi ? (o.hi(x) ? "var(--c1)" : "#9CC3A8") : "var(--c2)"); return '<div class="bar"><span class="lbl">' + esc(x.label) + '</span><span class="val"><b>' + fpct(x.n, base) + "</b> · " + fmt(x.n) + " dari " + fmt(base) + ' orang</span><span class="track"><span class="fill" style="width:' + pctNum(x.n, base).toFixed(2) + "%;background:" + col + '"></span></span></div>'; }).join("") + "</div>";
}
const isRest = x => /^lainnya|lain$/i.test(x.label || x.sh || "");
const topReal = arr => arr.filter(x => !isRest(x))[0] || arr[0];
function arcPath(cx, cy, ro, ri, a0, a1){
  if (a1 - a0 >= 2 * Math.PI - 1e-6) a1 = a0 + 2 * Math.PI - 1e-4;
  const p = (rr, a) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)], large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = p(ro, a0), [x1, y1] = p(ro, a1), [x2, y2] = p(ri, a1), [x3, y3] = p(ri, a0);
  return "M" + x0 + " " + y0 + " A" + ro + " " + ro + " 0 " + large + " 1 " + x1 + " " + y1 + " L" + x2 + " " + y2 + " A" + ri + " " + ri + " 0 " + large + " 0 " + x3 + " " + y3 + " Z";
}
function donut(items, N){
  if (!N) return '<p class="note">Belum ada data.</p>';
  let a = -Math.PI / 2, s = ""; const cx = 100, cy = 100;
  items.forEach(d => { if (!d.n || d.header) return; const a1 = a + d.n / N * 2 * Math.PI; s += '<path d="' + arcPath(cx, cy, 92, 58, a, a1) + '" fill="' + d.color + '" stroke="#fff" stroke-width="2"><title>' + esc(d.label) + ": " + fnp(d.n, N) + "</title></path>"; a = a1; });
  s += '<text x="100" y="98" text-anchor="middle" class="b" style="font-size:26px;font-family:var(--f-display)">' + fmt(N) + '</text><text x="100" y="118" text-anchor="middle" class="m">responden</text>';
  return '<div class="donut-wrap"><svg viewBox="0 0 200 200" role="img" aria-label="Komposisi status">' + s + '</svg><div class="bars">' + items.map(d => d.header ? '<div class="bar" style="border-top:1px solid var(--line);padding-top:6px"><span class="lbl"><b>' + esc(d.label) + '</b></span><span class="val"><b>' + fpct(d.n, N) + "</b> · " + fmt(d.n) + " orang</span></div>" : '<div class="bar"' + (d.sub ? ' style="padding-left:14px"' : "") + '><span class="lbl"><i style="display:inline-block;width:11px;height:11px;border-radius:3px;background:' + d.color + ';margin-right:7px;vertical-align:-1px"></i>' + esc(d.label) + '</span><span class="val"><b>' + fpct(d.n, N) + "</b> · " + fmt(d.n) + " orang</span></div>").join("") + "</div></div>";
}
function stackRows(rows, cats, note, right){
  const legend = '<div class="legend">' + cats.map(c => '<span><i style="background:' + c.color + '"></i>' + esc(c.label) + "</span>").join("") + "</div>";
  return legend + '<div class="bars">' + rows.map(r => { const tot = r.counts.reduce((s, v) => s + v, 0); if (!tot) return ""; return '<div class="stack-row' + (right ? " has-right" : "") + '"><span class="rl">' + esc(r.label) + (r.pre ? '<span class="tag-pre">sebelum wisuda</span>' : "") + "<small>" + fmt(tot) + ' orang</small></span><span class="stack' + (r.pre ? " pre" : "") + '">' + r.counts.map((v, i) => { const p = pctNum(v, tot); return v ? '<span style="width:' + p.toFixed(2) + "%;background:" + cats[i].color + ";color:" + txtOn(cats[i].color) + '" title="' + esc(cats[i].label + ": " + fnp(v, tot)) + '">' + (p >= 9 ? Math.round(p) + "%" : "") + "</span>" : ""; }).join("") + "</span>" + (right ? '<span class="rr">' + right(r, tot) + "</span>" : "") + "</div>"; }).join("") + "</div>" + (note ? '<p class="note">' + note + "</p>" : "");
}
function histogram(bins, markAfter){
  const W = 520, H = 210, L = 30, B = H - 34, T = 14, bw = (W - L - 10) / bins.length, mx = Math.max(1, ...bins.map(b => b.n));
  let s = '<line x1="' + L + '" y1="' + B + '" x2="' + (W - 6) + '" y2="' + B + '" stroke="var(--line)"/>';
  bins.forEach((b, i) => { const h = b.n / mx * (B - T - 14), x = L + i * bw; s += '<rect x="' + (x + 2) + '" y="' + (B - h) + '" width="' + (bw - 4) + '" height="' + h + '" rx="3" fill="' + (b.color || "var(--c2)") + '"><title>' + esc(b.label + ": " + b.n + " orang") + '</title></rect><text x="' + (x + bw / 2) + '" y="' + (B - h - 5) + '" text-anchor="middle" class="b">' + (b.n || "") + '</text><text x="' + (x + bw / 2) + '" y="' + (B + 15) + '" text-anchor="middle" class="m">' + esc(b.label) + "</text>"; });
  if (markAfter != null) { const x = L + markAfter * bw; s += '<line x1="' + x + '" y1="' + T + '" x2="' + x + '" y2="' + B + '" stroke="var(--ink)" stroke-dasharray="4 3"/><text x="' + (x - 6) + '" y="' + (T + 10) + '" text-anchor="end" class="m">batas 6 bulan</text>'; }
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Histogram">' + s + "</svg>";
}
function matrix(points){
  if (points.length < 2) return '<p class="note">Belum cukup data kompetensi.</p>';
  const W = 900, H = 450, L = 64, R = W - 16, T = 14, B = H - 48;
  const xs = points.map(p => p.a), ys = points.map(p => p.b), mxA = xs.reduce((a, b) => a + b, 0) / xs.length, mxB = ys.reduce((a, b) => a + b, 0) / ys.length;
  // kedua sumbu memakai skala yang sama (1 sampai 5) agar garis "dikuasai = dibutuhkan" bermakna
  const all = xs.concat(ys), lo = Math.floor((Math.min(...all) - 0.05) * 10) / 10, hi = Math.ceil((Math.max(...all) + 0.05) * 10) / 10;
  const X = v => L + (v - lo) / (hi - lo) * (R - L), Y = v => B - (v - lo) / (hi - lo) * (B - T);
  const mx = X(mxA), my = Y(mxB), step = (hi - lo) > 1.2 ? 0.5 : (hi - lo) > 0.6 ? 0.2 : 0.1;
  let s = '<rect x="' + L + '" y="' + T + '" width="' + (mx - L) + '" height="' + (my - T) + '" fill="#FFFBEB"/>';
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) { s += '<line x1="' + X(t) + '" y1="' + B + '" x2="' + X(t) + '" y2="' + (B + 5) + '" stroke="var(--muted2)"/><text x="' + X(t) + '" y="' + (B + 17) + '" text-anchor="middle" class="m">' + fdec(t, 1) + '</text><line x1="' + (L - 5) + '" y1="' + Y(t) + '" x2="' + L + '" y2="' + Y(t) + '" stroke="var(--muted2)"/><text x="' + (L - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end" class="m">' + fdec(t, 1) + "</text>"; }
  s += '<line x1="' + L + '" y1="' + B + '" x2="' + R + '" y2="' + B + '" stroke="var(--line)"/><line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + B + '" stroke="var(--line)"/>';
  // garis diagonal: di atas garis berarti dibutuhkan lebih tinggi dari yang dikuasai
  s += '<line x1="' + X(lo) + '" y1="' + Y(lo) + '" x2="' + X(hi) + '" y2="' + Y(hi) + '" stroke="var(--neg)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="' + (X(hi) - 6) + '" y="' + (Y(hi) + 16) + '" text-anchor="end" class="halo" style="fill:var(--neg);font-weight:700">dikuasai = dibutuhkan</text>';
  s += '<line x1="' + mx + '" y1="' + T + '" x2="' + mx + '" y2="' + B + '" stroke="var(--muted2)" stroke-dasharray="3 3"/><line x1="' + L + '" y1="' + my + '" x2="' + R + '" y2="' + my + '" stroke="var(--muted2)" stroke-dasharray="3 3"/>';
  s += '<text x="' + (L + 8) + '" y="' + (T + 16) + '" class="b" style="fill:var(--warn-fg)">Prioritas perbaikan</text><text x="' + (L + 8) + '" y="' + (B - 8) + '" class="m halo">Prioritas rendah</text><text x="' + (R - 6) + '" y="' + (B - 8) + '" class="m" text-anchor="end">Kekuatan</text>';
  const many = points.length > 10, boxes = [];
  points.forEach(p => { p.prio = p.a < mxA && p.b >= mxB && p.b - p.a > 0.005; p.x = X(p.a); p.y = Y(p.b); boxes.push({ x0: p.x - 7, x1: p.x + 7, y0: p.y - 7, y1: p.y + 7 }); });
  const hit = bx => bx.x0 < L || bx.x1 > R || bx.y0 < T || bx.y1 > B || boxes.some(q => !(bx.x1 < q.x0 || bx.x0 > q.x1 || bx.y1 < q.y0 || bx.y0 > q.y1));
  points.slice().sort((a, b) => (b.prio - a.prio) || ((b.b - b.a) - (a.b - a.a))).forEach(p => {
    s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="6" fill="' + (p.prio ? "var(--neg2)" : "var(--c2)") + '" stroke="#fff" stroke-width="1.5"><title>' + esc(p.label + ": dikuasai " + fdec(p.a, 2) + ", dibutuhkan " + fdec(p.b, 2)) + "</title></circle>";
    if (many && !p.prio) return;
    const w = p.short.length * 6.4 + 4, cands = [[10, 4, "start"], [-10, 4, "end"], [10, -10, "start"], [10, 18, "start"], [-10, -10, "end"], [-10, 18, "end"], [0, -14, "middle"], [0, 24, "middle"]];
    for (const [dx, dy, an] of cands) { const x0 = an === "start" ? p.x + dx : an === "end" ? p.x + dx - w : p.x - w / 2; const bx = { x0, x1: x0 + w, y0: p.y + dy - 11, y1: p.y + dy + 2 }; if (!hit(bx)) { boxes.push(bx); s += '<text x="' + (p.x + dx) + '" y="' + (p.y + dy) + '" text-anchor="' + an + '" class="halo' + (p.prio ? " b" : "") + '">' + esc(p.short) + "</text>"; return; } }
  });
  s += '<text x="' + R + '" y="' + (B + 38) + '" text-anchor="end" class="m">Dikuasai saat lulus, rata-rata skala 1 sampai 5 →</text><text class="m" text-anchor="middle" transform="rotate(-90 14 ' + ((T + B) / 2) + ')" x="14" y="' + ((T + B) / 2) + '">Dibutuhkan pekerjaan, rata-rata skala 1 sampai 5 →</text>';
  const pr = points.filter(p => p.prio).sort((a, b) => (b.b - b.a) - (a.b - a.a));
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Matriks kompetensi">' + s + "</svg>" + (pr.length ? '<div><p class="note" style="margin-bottom:6px">Prioritas perbaikan (dibutuhkan di atas rata-rata, dikuasai di bawah rata-rata, dan kebutuhannya lebih tinggi dari penguasaan):</p><ol class="plist">' + pr.map(p => "<li><b>" + esc(p.label) + "</b>: dikuasai " + fdec(p.a, 2) + ", dibutuhkan " + fdec(p.b, 2) + "</li>").join("") + "</ol></div>" : "") + '<p class="note">Titik di atas garis jingga berarti kebutuhan pekerjaan lebih tinggi dari yang dikuasai saat lulus. Garis abu-abu putus-putus adalah rata-rata seluruh kompetensi dan membagi empat kuadran.' + (many ? " Hanya kompetensi prioritas yang diberi nama; arahkan kursor ke titik lain untuk melihat nama dan angkanya." : "") + "</p>";
}
function dumbbell(points){
  const vals = points.flatMap(p => [p.a, p.b]); if (!vals.length) return '<p class="note">Belum ada data.</p>';
  const lo = Math.max(1, Math.floor((Math.min(...vals) - 0.1) * 2) / 2), hi = 5, ticks = [];
  for (let t = lo; t <= hi + 1e-9; t += 0.5) ticks.push(t);
  const pos = v => ((v - lo) / (hi - lo) * 100).toFixed(2) + "%";
  const grid = ticks.map(t => '<span class="tick" style="left:' + pos(t) + '"></span>').join("");
  const head = '<div class="db-row db-head"><span></span><span class="db-scale">' + ticks.map((t, i) => '<span style="left:' + pos(t) + '">' + fdec(t, 1) + "</span>").join("") + '</span><span class="gap-h">Selisih</span></div>';
  return '<p class="note howto">Titik kosong: rata-rata kemampuan alumni saat lulus. Titik penuh: rata-rata tingkat yang dibutuhkan di pekerjaan. Makin jauh kedua titik, makin besar selisihnya.</p>' +
    '<div class="legend"><span><i style="background:var(--card);border:3px solid var(--c2)"></i>Dikuasai saat lulus</span><span><i style="background:var(--c1)"></i>Dibutuhkan pekerjaan</span></div>' + head +
    points.slice().sort((a, b) => (a.a - a.b) - (b.a - b.b)).map(x => { const l = Math.min(x.a, x.b), h = Math.max(x.a, x.b), g = x.a - x.b;
      const word = g < -0.005 ? "kurang " + fdec(-g, 2) : g > 0.005 ? "lebih " + fdec(g, 2) : "sama";
      return '<div class="db-row"><span>' + esc(x.label) + '</span><span class="db-track">' + grid + '<span class="seg" style="left:' + pos(l) + ";width:calc(" + pos(h) + " - " + pos(l) + ')"></span><span class="dot b" style="left:' + pos(x.b) + '" title="Dibutuhkan ' + fdec(x.b, 2) + '"></span><span class="dot a" style="left:' + pos(x.a) + '" title="Dikuasai ' + fdec(x.a, 2) + '"></span></span><span class="gap ' + (g < -0.005 ? "neg" : g > 0.005 ? "pos" : "") + '"><b>' + word + "</b><small>" + fdec(x.a, 2) + " → " + fdec(x.b, 2) + "</small></span></div>"; }).join("") +
    '<p class="note">Skala kuesioner 1 (sangat rendah) sampai 5 (sangat tinggi); penggaris dimulai dari ' + fdec(lo, 1) + " agar selisih terlihat. Angka di kanan: dikuasai → dibutuhkan.</p>";
}
function funnel(steps){
  const mx = Math.max(1, steps[0].v || 1); const cols = ["var(--c1)", "var(--c2)", "#1E9C4E"];
  return '<div class="funnel">' + steps.map((s, i) => '<div class="st"><div style="width:' + Math.max(30, (s.v || 0) / mx * 100) + "%;background:" + cols[i] + '">' + fmt(s.v) + " " + esc(s.label) + "</div><small>" + (i ? fpct(s.v, steps[0].v) + " dari lamaran" : esc(s.sub || "")) + "</small></div>").join("") + "</div>";
}
function waterfall(steps){
  const W = 900, H = 250, L = 20, B = H - 40, T = 24, mx = Math.max(1, ...steps.map(s => s.total || 0)), cw = (W - L - 10) / steps.length; let s = '<line x1="' + L + '" y1="' + B + '" x2="' + (W - 6) + '" y2="' + B + '" stroke="var(--line)"/>', run = 0;
  const Y = v => B - v / mx * (B - T);
  steps.forEach((st, i) => {
    const x = L + i * cw + cw * .2, w = cw * .6; let y0, h, col;
    if (st.total != null) { run = st.total; y0 = Y(run); h = B - y0; col = st.color || "var(--c1)"; }
    else { const top = Y(run); run -= st.minus; y0 = top; h = Y(run) - top; col = "var(--neg)"; }
    s += '<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + Math.max(h, 1.5) + '" rx="3" fill="' + col + '"/><text x="' + (x + w / 2) + '" y="' + (y0 - 6) + '" text-anchor="middle" class="b">' + (st.total != null ? fmt(st.total) : "−" + fmt(st.minus)) + '</text><text x="' + (x + w / 2) + '" y="' + (B + 15) + '" text-anchor="middle" class="m">' + esc(st.label[0]) + '</text><text x="' + (x + w / 2) + '" y="' + (B + 28) + '" text-anchor="middle" class="m">' + esc(st.label[1] || "") + "</text>";
    if (i < steps.length - 1) s += '<line x1="' + (x + w) + '" y1="' + Y(run) + '" x2="' + (x + cw) + '" y2="' + Y(run) + '" stroke="var(--muted2)" stroke-dasharray="2 2"/>';
  });
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + (steps.aria || "Alur data") + '">' + s + "</svg>";
}
function sankey(links, leftOrder, rightOrder, colorsL, colorsR){
  const W = 900, H0 = 340, nodeW = 14, gap = 10, lx = 230, rx = W - 270, T = 10, slot = 34;
  const tot = links.reduce((s, l) => s + l.n, 0); if (!tot) return '<p class="note">Belum ada data.</p>';
  const sumBy = (k, name) => links.filter(l => l[k] === name).reduce((s, l) => s + l.n, 0);
  const Ls = leftOrder.filter(n => sumBy("from", n) > 0), Rs = rightOrder.filter(n => sumBy("to", n) > 0);
  const sc = (H0 - T * 2 - slot * (Math.max(Ls.length, Rs.length) - 1)) / tot;
  // simpul ditempatkan agar setiap label tepat sejajar dengan simpulnya (jarak minimum antarlabel = slot)
  const pos = (names, k) => { let y = T, lastC = -1e9; const o = {}; names.forEach(n => { const h = Math.max(sumBy(k, n) * sc, 2); let c = y + h / 2; if (c - lastC < slot) c = lastC + slot; o[n] = { y: c - h / 2, h, c, off: 0 }; lastC = c; y = c + h / 2 + gap; }); return o; };
  const PL = pos(Ls, "from"), PR = pos(Rs, "to");
  const H = Math.max(200, ...Object.values(PL).concat(Object.values(PR)).map(p => Math.max(p.y + p.h, p.c + 16) + T));
  let s = "";
  rightOrder.forEach(rn => Ls.forEach(ln => { const l = links.find(q => q.from === ln && q.to === rn); if (!l || !l.n || !PR[rn]) return; const h = l.n * sc, a = PL[ln], b = PR[rn]; const y1 = a.y + a.off + h / 2, y2 = b.y + b.off + h / 2; a.off += h; b.off += h; const xm = (lx + nodeW + rx) / 2; s += '<path d="M' + (lx + nodeW) + " " + y1 + " C" + xm + " " + y1 + " " + xm + " " + y2 + " " + rx + " " + y2 + '" stroke="' + (colorsR[rn] || "var(--c3)") + '" stroke-width="' + Math.max(h, 1.2) + '" fill="none" opacity=".42"><title>' + esc(ln + " ke " + rn + ": " + fnp(l.n, tot)) + "</title></path>"; }));
  Ls.forEach(n => { const p = PL[n]; s += '<rect x="' + lx + '" y="' + p.y + '" width="' + nodeW + '" height="' + p.h + '" fill="' + (colorsL[n] || "var(--c2)") + '"/><text x="' + (lx - 10) + '" y="' + (p.c - 2) + '" text-anchor="end">' + esc(n) + '</text><text x="' + (lx - 10) + '" y="' + (p.c + 12) + '" text-anchor="end" class="m">' + fpct(sumBy("from", n), tot) + " · " + fmt(sumBy("from", n)) + " orang</text>"; });
  Rs.forEach(n => { const p = PR[n]; s += '<rect x="' + rx + '" y="' + p.y + '" width="' + nodeW + '" height="' + p.h + '" fill="' + (colorsR[n] || "var(--c2)") + '"/><text x="' + (rx + nodeW + 10) + '" y="' + (p.c - 2) + '" class="b">' + esc(n) + '</text><text x="' + (rx + nodeW + 10) + '" y="' + (p.c + 12) + '" class="m">' + fpct(sumBy("to", n), tot) + " · " + fmt(sumBy("to", n)) + " orang</text>"; });
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Aliran status ke kategori IKU 2">' + s + "</svg>";
}
function columns(items, unit){
  const W = 900, H = 250, L = 10, R = W - 10, T = 34, B = H - 40, tot = items.reduce((s, c) => s + c.n, 0); if (!tot) return '<p class="note">Belum ada data.</p>';
  const mx = Math.max(...items.map(c => c.n)), cw = (R - L) / items.length;
  let s = '<defs><pattern id="hatchc" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="7" fill="rgba(255,255,255,.45)"/></pattern></defs><line x1="' + L + '" y1="' + B + '" x2="' + R + '" y2="' + B + '" stroke="var(--line)"/>';
  items.forEach((c, i) => { const h = c.n / mx * (B - T), x = L + i * cw + cw * .18, w = cw * .64;
    s += '<rect x="' + x + '" y="' + (B - h) + '" width="' + w + '" height="' + Math.max(h, 1.5) + '" rx="3" fill="var(--c2)"><title>' + esc(c.label + ": " + fnp(c.n, tot)) + "</title></rect>" + (c.pre ? '<rect x="' + x + '" y="' + (B - h) + '" width="' + w + '" height="' + Math.max(h, 1.5) + '" fill="url(#hatchc)" pointer-events="none"/>' : "") +
      '<text x="' + (x + w / 2) + '" y="' + (B - h - 18) + '" text-anchor="middle" class="b">' + fmt(c.n) + '</text><text x="' + (x + w / 2) + '" y="' + (B - h - 5) + '" text-anchor="middle" class="m">' + fpct(c.n, tot) + '</text><text x="' + (x + w / 2) + '" y="' + (B + 15) + '" text-anchor="middle" class="b">' + esc(c.label) + "</text>" + (c.pre ? '<text x="' + (x + w / 2) + '" y="' + (B + 28) + '" text-anchor="middle" class="m">sebelum wisuda</text>' : ""); });
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Jumlah ' + esc(unit || "alumni") + ' per tahun lulus">' + s + "</svg>";
}
function sparkline(pts){
  if (pts.length < 2) return "";
  const W = 220, H = 54, mn = Math.min(...pts.map(p => p.v)) - 5, mxv = Math.max(...pts.map(p => p.v)) + 5, X = i => 8 + i * (W - 16) / (pts.length - 1), Y = v => H - 14 - (v - mn) / (mxv - mn || 1) * (H - 24);
  let s = '<path d="' + pts.map((p, i) => (i ? "L" : "M") + X(i) + " " + Y(p.v)).join(" ") + '" stroke="var(--c2)" stroke-width="2.5" fill="none"/>';
  pts.forEach((p, i) => { s += '<circle cx="' + X(i) + '" cy="' + Y(p.v) + '" r="3.5" fill="' + (p.pre ? "#fff" : "var(--c1)") + '" stroke="' + (p.pre ? "var(--neg)" : "var(--c1)") + '" stroke-width="2"><title>' + esc(p.label + ": " + fdec(p.v) + "%" + (p.pre ? " (pra-wisuda)" : "")) + "</title></circle>"; });
  s += '<text x="8" y="' + (H - 1) + '" class="m">' + esc(pts[0].label) + '</text><text x="' + (W - 8) + '" y="' + (H - 1) + '" class="m" text-anchor="end">' + esc(pts[pts.length - 1].label) + "</text>";
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Tren per tahun lulus">' + s + "</svg>";
}
function bulletBar(val, target){
  return '<div class="mini-bullet" title="' + (target != null ? "Target " + fdec(target) + "%" : "Target belum diisi") + '"><span style="width:' + Math.min(100, val).toFixed(1) + '%"></span>' + (target != null ? '<i style="left:' + Math.min(100, target) + '%"></i>' : "") + "</div>";
}
function miniCols(pts, dark){
  if (pts.length < 2) return "";
  const W = 260, H = 96, top = 18, base = H - 30, cw = W / pts.length;
  let s = '<defs><pattern id="hatchm" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.5" height="6" fill="rgba(255,255,255,.55)"/></pattern></defs>';
  pts.forEach((p, i) => { const h = Math.max(2, p.v / 100 * (base - top)), x = i * cw + cw * .2, w = cw * .6;
    s += '<rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" rx="3" fill="' + (dark ? "var(--c3)" : "var(--c2)") + '"/>' + (p.pre ? '<rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" fill="url(#hatchm)"/>' : "") +
      '<text x="' + (x + w / 2) + '" y="' + (base - h - 5) + '" text-anchor="middle" class="b"' + (dark ? ' style="fill:#fff"' : "") + '>' + Math.round(p.v) + '%</text>' +
      '<text x="' + (x + w / 2) + '" y="' + (base + 13) + '" text-anchor="middle" class="m"' + (dark ? ' style="fill:#C9F5D8"' : "") + '>' + esc(p.label) + '</text>' +
      '<text x="' + (x + w / 2) + '" y="' + (base + 25) + '" text-anchor="middle" class="m" style="font-size:9px' + (dark ? ";fill:#C9F5D8" : "") + '">' + "n=" + fmt(p.n) + "</text>"; });
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Perbandingan per tahun lulus">' + s + "</svg>";
}
/* Kartu berputar: depan untuk pimpinan, belakang untuk detail teknis */
function tech(items){ return '<div class="tech"><span class="eyebrow">Detail teknis</span><dl>' + items.filter(Boolean).map(([k, v]) => "<dt>" + esc(k) + "</dt><dd>" + v + "</dd>").join("") + '</dl><span class="flip-hint">Klik kartu lagi untuk kembali</span></div>'; }
function flipWrap(cls, front, back){
  return '<div class="' + cls + ' flip" tabindex="0" role="button" aria-pressed="false" aria-label="Kartu: klik untuk detail teknis"><div class="flip-inner"><div class="face front">' + front + '</div><div class="face back">' + back + "</div></div></div>";
}
let REP = null;
function card(o){
  if (REP) REP.cards.push({ key: o.key || null, q: o.q, title: o.title, back: o.back || [], ppt: o.ppt, wide: !!o.wide });
  const front = '<div class="card-top"><p class="q">' + o.q + '</p><span class="info-chip">i&nbsp;Cara hitung</span></div><h3 class="insight">' + o.title + "</h3>" + o.body;
  return flipWrap("card chart-card" + (o.wide ? " wide" : ""), front, tech(o.back || []));
}
function statCard(o){
  if (REP) REP.stats.push({ v: o.v, k: o.k, sub: o.pptSub || "", track: o.pptTrack || null, back: o.back || [] });
  const front = '<span class="info-chip' + (o.hero ? " on-dark" : "") + '">i</span><span class="v">' + o.v + '</span><span class="k">' + o.k + "</span>" + (o.body || "");
  return flipWrap("stat" + (o.hero ? " hero-stat" : ""), front, tech(o.back || []));
}
function qsec(title, cards){ if (REP) REP.cards.forEach(c => { if (!c.sec) c.sec = title; }); return cards.filter(Boolean).length ? '<section class="qsec"><h2>' + esc(title) + '</h2><div class="grid2">' + cards.filter(Boolean).join("") + "</div></section>" : ""; }
