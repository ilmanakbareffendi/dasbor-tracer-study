"use strict";
/* ================= UTIL ================= */
function isBlank(v){ return v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (typeof v === "number" && isNaN(v)); }
function num(v){ if (isBlank(v)) return null; if (typeof v === "number") return v; if (v instanceof Date) return null; const s = String(v).trim().replace(",", "."); return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null; }
function ident(v){ if (isBlank(v)) return null; if (typeof v === "string") return v.trim(); const n = num(v); return n !== null && Number.isInteger(n) ? String(n) : String(v).trim(); }
function nimKey(v){ const s = ident(v); if (!s) return null; const n = num(s); return n !== null && Number.isInteger(n) ? String(n) : s.replace(/\s+/g, ""); }
function phone(v){ const s = ident(v); return s && s.startsWith("8") ? "0" + s : s; }
function txt(v){ if (isBlank(v)) return null; if (v instanceof Date) return v; return typeof v === "string" ? v.trim() : v; }
function dec(v, map){ if (isBlank(v)) return null; const n = num(v); if (n === null) return String(v).trim(); return map[n] !== undefined ? map[n] : "Kode " + n + " (tidak dikenal)"; }
function place(v, map, kind){ if (isBlank(v)) return null; const n = num(v); if (n === null) return String(v).trim(); const code = kind === "wil" ? String(n).padStart(6, "0") : String(n); return map[n] ? map[n] + " (" + code + ")" : "Kode " + code + " (belum terpetakan)"; }
function yt(v){ if (isBlank(v)) return null; return num(v) === 1 ? "Ya" : "Tidak"; }
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fmt = n => n == null ? "-" : Number(n).toLocaleString("id-ID");
const pctNum = (a, b) => b ? a / b * 100 : 0;
const fpct = (a, b) => b ? pctNum(a, b).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%" : "-";
const fmpct = (a, b) => fpct(a, b);
const fnp = (a, b) => b ? fpct(a, b) + " · " + fmt(a) + " dari " + fmt(b) + " orang" : "belum ada data";
const fdec = (v, d) => v == null ? "-" : v.toLocaleString("id-ID", { minimumFractionDigits: d == null ? 1 : d, maximumFractionDigits: d == null ? 1 : d });
const n_ = (r, c) => num(r[c]);
