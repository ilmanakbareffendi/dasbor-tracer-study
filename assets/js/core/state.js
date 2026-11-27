"use strict";
/* ================= STATE ================= */
const DEFAULT_UMP = Math.round(3228971 * 1.2);
const state = { files: [], compiled: null, groups: [], gi: 0, example: false, tab: null, filters: {}, settings: { targetIku: "", target6: "", ump: String(DEFAULT_UMP), pre: null, wisuda: {} } };
try { const s = JSON.parse(localStorage.getItem("tracer-settings") || "null"); if (s) Object.assign(state.settings, s); } catch (e) {}
function saveSettings(){ try { localStorage.setItem("tracer-settings", JSON.stringify(state.settings)); } catch (e) {} }
