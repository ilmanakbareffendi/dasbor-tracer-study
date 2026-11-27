"use strict";
/* ================= BILAH ATAS, NAVIGASI, MENU UNDUH ================= */
const gLabel = g => prodiShortOf(g.compiled);
function renderGroupTabs(){
  const G = state.groups, el = $("groupTabs");
  el.hidden = G.length < 2; if (G.length < 2) { el.innerHTML = ""; return; }
  const items = G.map((g, i) => [i, gLabel(g), g.compiled.kept.length]).concat([[-1, "Perbandingan", null]]);
  if (G.length > 4) el.innerHTML = '<label class="gsel"><span class="sr-only">Program studi</span><select id="groupSelect">' + items.map(([i, l, n]) => '<option value="' + i + '"' + (i === state.gi ? " selected" : "") + ">" + esc(l) + (n != null ? " (" + fmt(n) + ")" : "") + "</option>").join("") + "</select></label>";
  else el.innerHTML = items.map(([i, l, n]) => '<button class="gtab" role="tab" data-g="' + i + '" aria-selected="' + (i === state.gi) + '">' + esc(l) + (n != null ? ' <span class="num">' + fmt(n) + "</span>" : "") + "</button>").join("");
}
function renderBar(){
  const G = state.groups, multi = G.length > 1, c = state.gi >= 0 ? state.compiled : G[0].compiled;
  const fak = c.fakultas || "", per = c.period ? periodText(c.period) : "periode tidak diketahui";
  const prodi = state.gi >= 0 ? prodiShortOf(c) + (c.prodi != null ? " (" + c.prodi + ")" : "") : G.map(gLabel).join(", ");
  $("barTitle").textContent = multi ? (fak || "Beberapa prodi") : prodi + (fak ? " · " + fak : "");
  $("barSub").innerHTML = esc((multi ? (state.gi >= 0 ? prodi + " · " : "Perbandingan " + G.length + " prodi · ") : "") + per + (state.gi >= 0 ? " · " + fmt(c.kept.length) + " alumni" : "")) +
    ' · <button class="btn-link" id="btnDetail">Rincian data</button> · <button class="btn-link" id="btnChange">Ganti file</button> · <button class="btn-link" data-guide>Panduan</button>';
  const cmp = state.gi < 0; $("btnFilter").hidden = cmp; $("btnSettings").hidden = cmp;
  $("btnExcel").innerHTML = '<span class="lb-l">Unduh </span>Excel' + (multi ? " ▾" : ""); $("btnPpt").innerHTML = '<span class="lb-l">Unduh </span>PPT' + (multi ? " ▾" : "");
  $("btnSettings").innerHTML = '<span class="lb-l">Pengaturan</span><span class="lb-s">Atur</span>';
  document.querySelector(".bar-row2").classList.toggle("has-g", multi);
  $("exampleBanner").hidden = !state.example;
  setBarH();
}
const NAVSHORT = { "Seberapa cepat lulusan bekerja?": "Cepat bekerja", "Apakah pekerjaannya sesuai bidang studi?": "Kesesuaian", "Kompetensi apa yang perlu diperkuat?": "Kompetensi", "Lewat jalur apa mereka mendapat kerja?": "Jalur kerja", "Di mana mereka bekerja?": "Tempat kerja", "Bagaimana proses belajar dinilai?": "Proses belajar", "Siapa alumni yang mengisi?": "Profil alumni", "Seberapa andal datanya?": "Kualitas data" };
function renderNav(){
  const secs = []; const sum = $("dashBody").querySelector(".summary"); if (sum) secs.push([sum, "Ringkasan"]);
  $("dashBody").querySelectorAll(".qsec").forEach(q => { const h = q.querySelector("h2"); if (h) secs.push([q, NAVSHORT[h.textContent] || h.textContent]); });
  secs.forEach(([el], i) => { el.id = "dsec-" + i; el.classList.add("navsec"); });
  $("secNav").hidden = secs.length < 2;
  $("secNav").innerHTML = secs.map(([el, l], i) => '<a href="#dsec-' + i + '" data-i="' + i + '" class="navchip' + (i === 0 ? " on" : "") + '">' + esc(l) + "</a>").join("");
  setBarH(); markNav();
}
function setBarH(){ const h = $("dashBar").offsetHeight || 0; document.documentElement.style.setProperty("--barH", h + "px"); }
function markNav(){
  const chips = [...$("secNav").querySelectorAll(".navchip")]; if (!chips.length) return;
  const lim = ($("dashBar").getBoundingClientRect().bottom || 0) + 24; let on = 0;
  chips.forEach((c, i) => { const el = document.getElementById("dsec-" + i); if (el && el.getBoundingClientRect().top <= lim) on = i; });
  chips.forEach((c, i) => c.classList.toggle("on", i === on));
  const act = chips[on]; if (act && act.parentNode.scrollWidth > act.parentNode.clientWidth) { const p = act.parentNode, l = act.offsetLeft - p.offsetLeft; if (l < p.scrollLeft || l + act.offsetWidth > p.scrollLeft + p.clientWidth) p.scrollTo({ left: Math.max(0, l - 24), behavior: "smooth" }); }
}
window.addEventListener("scroll", () => { markNav(); $("toTop").hidden = window.scrollY < 900 || $("sec-dash").hidden; }, { passive: true });
window.addEventListener("resize", setBarH);
$("toTop").addEventListener("click", () => window.scrollTo({ top: $("sec-dash").offsetTop - 8, behavior: "smooth" }));
$("secNav").addEventListener("click", e => { const a = e.target.closest(".navchip"); if (!a) return; e.preventDefault(); const el = document.getElementById("dsec-" + a.dataset.i); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
function switchGroup(i){ useGroup(i); closePanels(); renderCompile(); renderAll(); window.scrollTo({ top: $("sec-dash").offsetTop - 8, behavior: "smooth" }); }
$("groupTabs").addEventListener("click", e => { const b = e.target.closest(".gtab"); if (b) switchGroup(Number(b.dataset.g)); });
$("groupTabs").addEventListener("change", e => { if (e.target.id === "groupSelect") switchGroup(Number(e.target.value)); });
$("barSub").addEventListener("click", e => {
  if (e.target.id === "btnChange") { resetAll(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (e.target.id === "btnDetail") { const sc = $("sec-compile"); sc.hidden = !sc.hidden; if (!sc.hidden) { $("compileProdi").textContent = state.gi >= 0 ? prodiShortOf(state.compiled) : ""; sc.scrollIntoView({ behavior: "smooth", block: "start" }); } }
});
function closePanels(except){ [["filterPanel", "btnFilter"], ["settingsPanel", "btnSettings"]].forEach(([p, b]) => { if (p !== except) { $(p).hidden = true; $(b).setAttribute("aria-expanded", "false"); } }); closeMenus(); setBarH(); }
[["btnFilter", "filterPanel"], ["btnSettings", "settingsPanel"]].forEach(([b, p]) => $(b).addEventListener("click", () => { const open = $(p).hidden; closePanels(p); $(p).hidden = !open; $(b).setAttribute("aria-expanded", String(open)); setBarH(); }));
function closeMenus(){ ["menuExcel", "menuPpt"].forEach(m => { $(m).hidden = true; }); ["btnExcel", "btnPpt"].forEach(b => $(b).setAttribute("aria-expanded", "false")); }
document.addEventListener("click", e => { if (!e.target.closest(".dd")) closeMenus(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeMenus(); closePanels(); } });
function menuItems(kind){
  return state.groups.map((g, i) => { const vs = ["v2021", "v2019"].filter(v => g.compiled.kept.some(x => x.v === v)); const v = i === state.gi ? state.tab : (g.tab && vs.includes(g.tab) ? g.tab : vs[0]);
    return '<button role="menuitem" data-g="' + i + '">' + esc(gLabel(g)) + "<small>" + (kind === "ppt" ? "Kuesioner " + VERSIONS[v].label.toLowerCase() + (i === state.gi ? ", mengikuti filter" : "") : fmt(g.compiled.kept.length) + " alumni, semua versi") + "</small></button>"; }).join("");
}
function openMenu(kind){
  const m = kind === "ppt" ? "menuPpt" : "menuExcel", b = kind === "ppt" ? "btnPpt" : "btnExcel";
  if (state.groups.length < 2) { kind === "ppt" ? doPpt(Math.max(0, state.gi)) : doExcel(Math.max(0, state.gi)); return; }
  const wasOpen = !$(m).hidden; closeMenus(); if (wasOpen) return;
  $(m).innerHTML = menuItems(kind); $(m).hidden = false; $(b).setAttribute("aria-expanded", "true");
}
$("btnExcel").addEventListener("click", () => openMenu("excel"));
$("btnPpt").addEventListener("click", () => openMenu("ppt"));
$("menuExcel").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (b) { closeMenus(); doExcel(Number(b.dataset.g)); } });
$("menuPpt").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (b) { closeMenus(); doPpt(Number(b.dataset.g)); } });
function busy(btn, on, txt){ btn.disabled = on; if (on) { btn.dataset.old = btn.innerHTML; btn.textContent = txt; } else if (btn.dataset.old) btn.innerHTML = btn.dataset.old; }
async function doExcel(i){
  const btn = $("btnExcel"); busy(btn, true, "Menyiapkan..."); const keep = state.compiled;
  try { state.compiled = state.groups[i].compiled; const buf = await buildExcel(); const name = excelFileName(state.compiled);
    const res = await saveFile(name, new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    $("dashMsg").innerHTML = res === "declined" ? '<div class="msg warn">Unduhan dibatalkan.</div>' : '<div class="msg ok">Excel siap: ' + esc(name) + "</div>";
  } catch (e) { $("dashMsg").innerHTML = '<div class="msg bad">Excel gagal dibuat. Muat ulang halaman lalu coba lagi. Detail: ' + esc(e && (e.message || e.code) || e) + "</div>"; }
  finally { state.compiled = keep; busy(btn, false); setBarH(); }
}
async function doPpt(i){
  if (i !== state.gi) switchGroup(i);
  const btn = $("btnPpt"); busy(btn, true, "Menyiapkan...");
  try { const keepTab = state.tab, reps = {};
    ["v2021", "v2019"].forEach(v => { if (tabRows(v).length) { state.tab = v; renderDash(); reps[v] = REP; } });
    state.tab = keepTab; renderDash();
    const main = reps.v2021 || reps.v2019, app = reps.v2021 && reps.v2019 ? reps.v2019 : null;
    if (!main) throw new Error("Tidak ada alumni pada filter tahun lulus ini. Ubah filter lalu unduh lagi.");
    const { pptx, name } = await buildPpt(main, app, { noV21: !reps.v2021 && tabRows("v2021").length > 0 }); const blob = await pptx.write({ outputType: "blob" });
    const res = await saveFile(name, blob);
    $("dashMsg").innerHTML = res === "declined" ? '<div class="msg warn">Unduhan dibatalkan.</div>' : '<div class="msg ok">PPT siap: ' + esc(name) + "</div>";
  } catch (e) { $("dashMsg").innerHTML = '<div class="msg bad">PPT gagal dibuat. Muat ulang halaman lalu coba lagi. Detail: ' + esc(e && (e.message || e.code) || e) + "</div>"; }
  finally { busy(btn, false); setBarH(); }
}
/* ---------- tab perbandingan antarprodi ---------- */
function renderComparison(){
  const rows = state.groups.map(g => { const K = g.compiled.kept, N = K.length, W = K.filter(x => x.m.work), cats = {}; K.forEach(x => { const c = ikuCategory(x.m); cats[c] = (cats[c] || 0) + 1; });
    const cnt = (cats["Kerja ≤6 bulan"] || 0) + (cats["Kerja 7 sampai 12 bulan"] || 0) + (cats["Studi lanjut"] || 0);
    const alt = cnt + W.filter(x => x.m.inconsistent && ikuCategory(x.m) === "Kerja >12 bulan/tanpa data" && (q => q !== null && q >= 0 && q <= 12)(num(x.r.f506))).length;
    const mo = W.map(x => x.m.months).filter(q => q != null).sort((a, b) => a - b), med = mo.length ? mo[Math.floor((mo.length - 1) / 2)] : null;
    const f14 = W.filter(x => [1, 2].includes(n_(x.r, "f14"))).length, f14t = W.filter(x => n_(x.r, "f14") >= 1 && n_(x.r, "f14") <= 5).length;
    return { l: gLabel(g), N, work: pctNum(W.length, N), le6: pctNum(W.filter(x => x.m.le6).length, W.length), iku: pctNum(cnt, N), alt: pctNum(alt, N), med, erat: f14t ? pctNum(f14, f14t) : null, pre: pctNum(K.filter(x => x.m.pre).length, N), small: N < 30 }; });
  const col = (lbl, key, unit) => '<div class="card"><p class="q">' + esc(lbl) + '</p><div class="bars">' + rows.map(r => r[key] == null ? "" : '<div class="bar"><span class="lbl">' + esc(r.l) + (r.small ? ' <span class="tag-pre">jumlah alumni kecil</span>' : "") + '</span><span class="val"><b>' + fdec(r[key]) + (unit || "%") + '</b></span><span class="track"><span class="fill" style="width:' + Math.min(100, unit ? r[key] / Math.max(...rows.map(q => q[key] || 0), 1) * 100 : r[key]).toFixed(1) + '%;background:var(--c2)"></span></span></div>').join("") + "</div></div>";
  const tbl = '<div class="card"><p class="q">Ringkasan per prodi · semua versi kuesioner, tanpa filter</p><div class="tbl-wrap"><table class="cmp-tbl"><thead><tr><th>Prodi</th><th>Alumni</th><th>Bekerja atau berwirausaha</th><th>Kerja ≤6 bulan<br><small>dari yang bekerja</small></th><th>Kerja atau studi ≤12 bulan<br><small>dasar IKU 2</small></th><th>Batas atas</th><th>Median masa tunggu</th><th>Erat dengan bidang studi</th><th>Diisi sebelum wisuda</th></tr></thead><tbody>' +
    rows.map(r => "<tr><td>" + esc(r.l) + '</td><td class="num">' + fmt(r.N) + '</td><td class="num">' + fdec(r.work) + '%</td><td class="num">' + fdec(r.le6) + '%</td><td class="num"><b>' + fdec(r.iku) + '%</b></td><td class="num">' + fdec(r.alt) + '%</td><td class="num">' + (r.med == null ? "-" : r.med + " bulan") + '</td><td class="num">' + (r.erat == null ? "-" : fdec(r.erat) + "%") + '</td><td class="num">' + fdec(r.pre) + "%</td></tr>").join("") + "</tbody></table></div>" +
    '<p class="note">Kerja atau studi dalam 12 bulan dihitung dengan cara IKU 2 tanpa bobot gaji. IKU 2 resmi hanya mengukur lulusan D1 sampai sarjana, jadi untuk magister dan doktor angka ini pembanding. Batas atas: bila jawaban masa tunggu yang bertentangan dihitung dengan isian bulannya. Prodi dengan kurang dari 30 alumni ditandai; satu orang sudah menggeser beberapa poin persen.</p></div>';
  $("dashBody").innerHTML = '<section class="qsec"><h2>Perbandingan antarprodi</h2>' + tbl + '<div class="grid2">' + col("Kerja atau studi dalam 12 bulan (dasar IKU 2)", "iku") + col("Bekerja atau berwirausaha", "work") + col("Kerja dalam 6 bulan, dari yang bekerja", "le6") + col("Pekerjaan erat dengan bidang studi", "erat") + "</div></section>";
  REP = null;
}
