"use strict";
/* ================= ALUR ================= */
function renderAll(){ applyPre(); renderGroupTabs(); renderBar();
  if (state.gi < 0) { renderTabs(); renderComparison(); renderNav(); return; }
  renderTabs(); renderFilters(); renderDash(); renderNav(); }
const JRANK = n => /^(S1|D4)/.test(n) ? 0 : /^S2/.test(n) ? 1 : /^S3/.test(n) ? 2 : 3;
function processFiles(files){
  // satu kelompok per prodi: file kuesioner menurut kode prodi, daftar pengisian menurut NIM yang cocok
  const keys = [...new Set(files.filter(f => f.kind === "versi").map(f => f.prodi))];
  state.groups = keys.map(k => ({ key: k, files: files.filter(f => f.kind === "versi" ? f.prodi === k : (f.grp === k || (f.grp == null && keys.length === 1))) }))
    .map(g => ({ key: g.key, compiled: compile(g.files), filters: {}, tab: null }))
    .sort((p, q) => JRANK(prodiShortOf(p.compiled)) - JRANK(prodiShortOf(q.compiled)) || String(prodiShortOf(p.compiled)).localeCompare(prodiShortOf(q.compiled)));
  state.settings.pre = null; state.gi = 0; useGroup(0);
  applyPre(); renderCompile(); renderAll();
  setView("dash");
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}
function useGroup(i){
  const cur = state.groups[state.gi]; if (cur && state.gi >= 0) { cur.tab = state.tab; }
  state.gi = i; if (i < 0) return;
  const g = state.groups[i]; state.compiled = g.compiled; state.filters = g.filters; state.tab = g.tab;
}
// Beranda dan Dasbor: beranda menampilkan halaman unggah tanpa menghapus data yang sudah dimuat
function setView(v){
  const dash = v === "dash" && state.groups.length;
  $("hero").hidden = !!dash; $("sec-upload").hidden = !!dash; $("sec-dash").hidden = !dash; if (dash) $("sec-compile").hidden = true; else $("sec-compile").hidden = true;
  $("sec-paket").hidden = !!dash || location.hash !== "#caru";
  $("tnHome").classList.toggle("on", !dash); $("tnDash").classList.toggle("on", !!dash); $("tnDash").hidden = !state.groups.length;
  if (dash) closePanels();
}
document.addEventListener("click", e => {
  const h = e.target.closest("[data-home]"), d = e.target.closest("[data-gotodash]");
  if (h) { e.preventDefault(); if (state.example) resetAll(); setView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (d) { setView("dash"); window.scrollTo({ top: 0, behavior: "smooth" }); }
});
setTimeout(() => { $("brandLogo").src = LOGO_PNG; });
function resetAll(){ $("hero").hidden = false; state.files = []; state.compiled = null; state.groups = []; state.gi = 0; state.example = false; $("sec-compile").hidden = true; $("sec-dash").hidden = true; $("sec-upload").hidden = false; renderFiles(); setView("home"); }
const drop = $("drop"), input = $("fileInput");
input.addEventListener("change", () => { if (state.example) resetAll(); addFiles([...input.files]); input.value = ""; });
drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => { if (state.example) resetAll(); addFiles([...e.dataTransfer.files].filter(f => /\.(xlsx?|csv)$/i.test(f.name))); });
$("fileRows").addEventListener("click", e => { const id = e.target.dataset.remove; if (!id) return; const f = state.files.find(x => x.id === id); state.files = state.files.filter(x => x.id !== id && !(f && f.paket && x.paket === f.paket)); renderFiles(); });
$("btnClear").addEventListener("click", resetAll);
$("btnProcess").addEventListener("click", () => { state.example = false; processFiles(state.files.filter(f => !f.errors.length && !f.crossError)); });
document.addEventListener("click", e => { if (e.target.closest("[data-example]")) $("btnExample").click(); });
$("btnExample").addEventListener("click", () => { resetAll(); state.example = true; processFiles(makeExample()); });
$("btnExitExample").addEventListener("click", () => { resetAll(); $("sec-upload").scrollIntoView({ behavior: "smooth" }); });
document.addEventListener("click", e => {
  if (e.target.closest("[data-guide]")) { const d = $("guide"); if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  if (e.target.closest("[data-clearfilter]")) { const f = fShared(); f.tahun.clear(); f.jenis = ""; renderFilters(); renderDash(); }
  if (e.target.closest("[data-hintoff]")) { hintOff = true; try { localStorage.setItem("tracer-hint", "1"); } catch (er) {} const h = document.querySelector(".fliphint"); if (h) h.remove(); }
});
$("guideClose").addEventListener("click", () => { const d = $("guide"); if (d.close) d.close(); else d.removeAttribute("open"); });
$("guide").addEventListener("click", e => { if (e.target.id === "guide" && e.target.close) e.target.close(); });
$("dashBody").addEventListener("click", e => { const c = e.target.closest(".flip"); if (!c) return; if (e.target.closest("a, input, select, textarea, summary")) return; if (String(window.getSelection ? window.getSelection() : "").length) return; const on = c.classList.toggle("flipped"); c.setAttribute("aria-pressed", String(on)); });
$("dashBody").addEventListener("keydown", e => { const c = e.target.closest(".flip"); if (!c || e.target !== c || (e.key !== "Enter" && e.key !== " ")) return; e.preventDefault(); const on = c.classList.toggle("flipped"); c.setAttribute("aria-pressed", String(on)); });
$("tabs").addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; state.tab = b.dataset.tab; renderTabs(); renderFilters(); renderDash(); renderBar(); });
$("filters").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; const f = fShared(); const val = b.dataset.v;
  if (b.dataset.f === "jenis") f.jenis = val; else { if (!val) f.tahun.clear(); else if (f.tahun.has(val)) f.tahun.delete(val); else f.tahun.add(val); }
  renderFilters(); renderDash(); });
$("preYears").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; const y = Number(b.dataset.pre); const p = state.settings.pre; const i = p.indexOf(y); if (i >= 0) p.splice(i, 1); else p.push(y); p.sort(); saveSettings(); renderAll(); });
$("wisudaDates").addEventListener("change", e => { const y = e.target.dataset.wy; if (!y) return; const ws = state.settings.wisuda || (state.settings.wisuda = {}); const arr = ws[y] || (ws[y] = ["", ""]); arr[Number(e.target.dataset.wk)] = e.target.value; saveSettings(); applyPre(); renderTabs(); const keep = $("settings").open; renderFilters(); renderDash(); $("settings").open = keep; });
[["setTargetIku", "targetIku"], ["setTarget6", "target6"], ["setUmp", "ump"]].forEach(([id, k]) => $(id).addEventListener("change", e => { state.settings[k] = e.target.value.trim(); saveSettings(); renderDash(); }));
