"use strict";
/* ================= EXCEL KOMPILASI ================= */
function panduan(v){
  const rows = [], OK = "Terkonfirmasi", KR = "Kuesioner resmi";
  const block = (col, scr, q, map, rule, status, note) => {
    if (!map) { rows.push([col, scr, q, "", note || "Isian bebas/angka", RULES[rule || "all"][0], status, true]); return; }
    Object.keys(map).forEach((k, i) => rows.push([i ? "" : col, i ? "" : scr, i ? "" : q, Number(k), map[k], i ? "" : RULES[rule || "all"][0], i ? "" : status, i === 0]));
  };
  const ids = [["kdptimsmh","Kode perguruan tinggi (11033 = Universitas Prima Indonesia)"],["kdpstmsmh","Kode program studi PDDikti"],["nimhsmsmh","NIM"],["nmmhsmsmh","Nama lulusan"],["telpomsmh","Nomor telepon (di Data Terbaca diberi awalan 0)"],["emailmsmh","Email"],["tahun_lulus","Tahun lulus"]];
  if (v === "v2021") ids.push(["nik","NIK"], ["npwp","NPWP"]);
  ids.forEach(([c, q]) => rows.push([c, "", q, "", "Data identitas", RULES.all[0], "", true]));
  const yesno = (c, scr, q, rule) => rows.push([c, scr, q, "1 / 0", "1 = dipilih (di Data Terbaca: Ya), 0 = tidak dipilih (Tidak)", RULES[rule][0], OK, true]);
  if (v === "v2021") {
    block("f8","F8","Jelaskan status Anda saat ini?",F8_21,null,OK+" (kode 1)");
    block("f504","F5-04","Apakah Anda telah mendapatkan pekerjaan ≤6 bulan / termasuk bekerja sebelum lulus?",YN,"work",OK+" (kode 2)");
    block("f502","F5-02","Jika Ya: dalam berapa bulan Anda mendapatkan pekerjaan?",null,"work_ya",KR,"Angka (bulan)");
    block("f505","Tidak tampil","Rata-rata pendapatan per bulan (take home pay), menurut kode kuesioner Kemdikbud",null,"work","Bukan F13: F13 kosong di layar sistem untuk sampel yang dicek. Isian bercampur; belum layak dipakai","Angka (rupiah)");
    block("f1301 s.d. f1303","F13-01 s.d. F13-03","Kira-kira berapa pendapatan Anda setiap bulannya? (pekerjaan utama, lembur dan tips, pekerjaan lainnya)",null,"work","Belum ikut dalam tarikan Excel per Oktober 2026; otomatis dipakai bila kolomnya muncul","Angka (rupiah)");
    block("f506","F5-06","Jika Tidak: dalam berapa bulan Anda mendapatkan pekerjaan?",null,"work_tidak",OK,"Angka (bulan)");
    block("f5a1","F5-A1","Lokasi tempat bekerja: provinsi",null,"work","Kode wilayah Kemendikdasmen (Dapodik), 39 provinsi termasuk Luar Negeri (350000); sumber referensi.data.kemendikdasmen.go.id, diambil 28 Okt 2026","Kode wilayah 6 digit");
    block("f5a2","F5-A2","Lokasi tempat bekerja: kabupaten/kota",null,"work","Kode wilayah Kemendikdasmen (Dapodik), 514 kabupaten/kota dan 12 negara; sumber referensi.data.kemendikdasmen.go.id, diambil 28 Okt 2026. 076000 Kota Medan dan 070100 Kab. Deli Serdang juga dicek langsung di layar sistem","Kode wilayah 6 digit");
    block("f1101","F11-01","Apa jenis perusahaan/instansi/institusi tempat Anda bekerja sekarang?",F11_21,"work","Kode 4 terkonfirmasi; kode 6 cocok dengan isian nama (Bank Mandiri, BNI, BRI); kode 7 perlu konfirmasi");
    block("f1102","F11-02","Jenis perusahaan lainnya (isian)",null,"f11lain",KR);
    block("f5b","F5-B","Apa nama perusahaan/kantor tempat Anda bekerja?",null,"work",OK);
    block("f5c","F5-C","Bila berwiraswasta, apa posisi/jabatan Anda saat ini?",F5C,"wira",OK+" (kode 4)");
    block("f5d","F5-D","Apa tingkat tempat kerja Anda?",F5D,"work",OK+" (kode 1)");
    block("f18a","F18-A","Pertanyaan studi lanjut: sumber biaya",F18A,"studi",OK+" (kode 1)");
    block("f18b","F18-B","Pertanyaan studi lanjut: perguruan tinggi",null,"studi",KR,"Kode PT PDDikti");
    block("f18c","F18-C","Pertanyaan studi lanjut: program studi",null,"studi",KR,"Kode prodi PDDikti");
    block("f18d","F18-D","Pertanyaan studi lanjut: tanggal masuk",null,"studi",OK,"Tanggal");
  } else {
    block("f501","F5-01","Berapa bulan waktu yang dihabiskan (sebelum dan sesudah kelulusan) untuk memperoleh pekerjaan pertama?",F501,"w19","Konsisten dengan data (kode 1 mengisi f502, kode 2 mengisi f503)");
    block("f502","F5-02","Kira-kira berapa bulan sebelum lulus",null,"w19_501a",KR,"Angka (bulan)");
    block("f503","F5-03","Kira-kira berapa bulan sesudah lulus",null,"w19_501b",KR,"Angka (bulan)");
    block("f8","F8","Apakah Anda bekerja saat ini (termasuk kerja sambilan dan wirausaha)?",F8_19,null,OK+" (kode 1)");
    F9.forEach(([c, l]) => yesno(c, c.toUpperCase().replace("F9", "F9-"), "Bagaimana Anda menggambarkan situasi Anda saat ini? " + l, "all"));
    block("f906","F9-06","Situasi lainnya (isian)",null,"f9lain",KR);
    block("f1101","F11-01","Apa jenis perusahaan/instansi/institusi tempat Anda bekerja sekarang?",F11_19,"w19","Kode 5 terkonfirmasi; kode 1 sampai 4 mengikuti urutan kuesioner lama");
    block("f1102","F11-02","Jenis perusahaan lainnya (isian)",null,"f11lain19",KR);
    block("f1301","F13-01","Pendapatan dari pekerjaan utama",null,"w19",OK,"Angka (rupiah)");
    block("f1302","F13-02","Pendapatan dari lembur dan tips",null,"w19",OK,"Angka (rupiah)");
    block("f1303","F13-03","Pendapatan dari pekerjaan lainnya",null,"w19",OK,"Angka (rupiah)");
  }
  const wr = v === "v2021" ? "work" : "w19";
  block("f1201","F12-01","Sebutkan sumber dana dalam pembiayaan kuliah?",F12,null,OK+" (kode 1)");
  block("f1202","F12-02","Sumber dana lainnya (isian)",null,"f12lain",KR);
  block("f14","F14","Seberapa erat hubungan antara bidang studi dengan pekerjaan Anda?",F14,wr,OK);
  block("f15","F15","Tingkat pendidikan apa yang paling tepat/sesuai untuk pekerjaan Anda saat ini?",F15,wr,OK);
  VERSIONS[v].f17.forEach(([a, b, l]) => { block(a, "F17 (A)", "Kompetensi " + l + ": tingkat yang dikuasai pada saat lulus (A)", F17S, null, OK); block(b, "F17 (B)", "Kompetensi " + l + ": tingkat yang diperlukan dalam pekerjaan saat ini (B)", F17S, null, OK); });
  if (v === "v2019") { block("f1711a","Tidak tampil","Kolom tambahan F17 yang tidak tampil di layar sistem",null,"hidden","Selalu bernilai 5 pada semua responden; abaikan"); block("f1712a","Tidak tampil","Kolom tambahan F17 yang tidak tampil di layar sistem",null,"hidden","Selalu bernilai 5 pada semua responden; abaikan"); }
  F2.forEach(([c, l]) => block(c, c.toUpperCase(), "Penekanan metode pembelajaran di prodi: " + l, F2S, null, OK));
  block("f301","F3-01","Kapan Anda mulai mencari pekerjaan? (pekerjaan sambilan tidak dimasukkan)",F3,null,OK+" (kode 3)");
  block("f302","F3-02","Kira-kira berapa bulan sebelum lulus",null,"f302",KR,"Angka (bulan)");
  block("f303","F3-03","Kira-kira berapa bulan sesudah lulus",null,"f303",KR,"Angka (bulan)");
  const cr = v === "v2021" ? "cari" : "cari19";
  F4.forEach(([c, l]) => yesno(c, c.toUpperCase().replace("F4", "F4-"), "Bagaimana Anda mencari pekerjaan tersebut? " + l, cr));
  block("f416","F4-16","Cara mencari pekerjaan lainnya (isian)",null,v === "v2021" ? "f4lain" : "f4lain19",KR);
  block("f6","F6","Berapa perusahaan/instansi/institusi yang sudah Anda lamar sebelum memperoleh pekerjaan pertama?",null,cr,OK,"Angka");
  block("f7","F7","Berapa banyak perusahaan/instansi/institusi yang merespons lamaran Anda?",null,cr,OK,"Angka");
  block("f7a","F7A","Berapa banyak perusahaan/instansi/institusi yang mengundang Anda untuk wawancara?",null,cr,OK,"Angka");
  block("f1001","F10-01","Apakah Anda aktif mencari pekerjaan dalam 4 minggu terakhir?",F10,null,OK);
  block("f1002","F10-02","Aktif mencari pekerjaan, lainnya (isian)",null,"f10lain",KR);
  F16.forEach(([c, l]) => yesno(c, c.toUpperCase().replace("F16", "F16-"), "Jika pekerjaan tidak sesuai pendidikan, mengapa Anda mengambilnya? " + l, wr));
  block("f1614","F16-14","Alasan lainnya (isian)",null,v === "v2021" ? "f16lain" : "f16lain19",KR);
  EXTRA_COLS.forEach(([c, q]) => rows.push([c, "", q.replace("Kolom tambahan: ", ""), "", "Kolom tambahan dari web app", RULES.all[0], "", true]));
  return rows;
}
const EXTRA_COLS = [["file_sumber", "Kolom tambahan: file tarikan asal baris", 26], ["periode", "Kolom tambahan: periode pengisian tarikan asal baris", 24], ["waktu_isian", "Kolom tambahan: diisi sebelum wisuda atau setelah lulus", 20], ["status_nim", "Kolom tambahan: status NIM (tunggal atau ganda)", 34], ["tahun_masuk", "Kolom tambahan: tahun masuk (dari daftar pengisian)", 12], ["tanggal_pengisian", "Kolom tambahan: tanggal pengisian kuesioner (dari daftar pengisian)", 14], ["lama_studi", "Kolom tambahan: lama studi dalam tahun (tahun lulus dikurangi tahun masuk)", 12], ["jarak_isi", "Kolom tambahan: tahun pengisian dikurangi tahun lulus (0 = di tahun kelulusan)", 12], ["status_daftar", "Kolom tambahan: ada atau tidak di daftar pengisian periode ini", 26]];
// jenjang prodi dibaca dari nama prodi (daftar pengisian atau katalog); menentukan batas lama studi dan kata "lulusan ..." di dasbor
function jenjang(){
  const c = state.compiled || {}, n = String(c.prodiNama || PRODI_DYN[c.prodi] || PRODI[c.prodi] || "").trim();
  if (/^(Magister|S2)\b/i.test(n)) return { k: "S2", lo: 1, hi: 4, lulusan: "magister", prog: "Program magister umumnya ditempuh 1,5 sampai 4 tahun." };
  if (/^(Doktor|S3)\b/i.test(n)) return { k: "S3", lo: 2, hi: 7, lulusan: "doktor", prog: "Program doktor umumnya ditempuh 3 sampai 7 tahun." };
  if (/^Spesialis/i.test(n)) return { k: "spesialis", lo: 3, hi: 7, lulusan: "dokter spesialis", prog: "Program spesialis umumnya ditempuh 4 sampai 6 tahun." };
  if (/^(Profesi|Pendidikan Profesi)/i.test(n)) return { k: "profesi", lo: 1, hi: 4, lulusan: "profesi", prog: "Program profesi umumnya ditempuh 1 sampai 3 tahun." };
  if (/^(Sarjana Terapan|D4)\b/i.test(n)) return { k: "D4", lo: 3, hi: 7, lulusan: "sarjana terapan", prog: "Program sarjana terapan umumnya ditempuh 3,5 sampai 7 tahun." };
  return { k: "S1", lo: 3, hi: 7, lulusan: "sarjana", prog: "Program sarjana umumnya ditempuh 3,5 sampai 7 tahun." };
}
function prodiShortOf(c){ return PRODI_DYN[c.prodi] || PRODI[c.prodi] || (c.prodiNama ? shortProdi(c.prodiNama) : "Prodi " + c.prodi); }
function excelFileName(c){
  const per = c.period ? fmtTgl(c.period.from) + " sd " + fmtTgl(c.period.to) : [...new Set(c.files.map(f => f.periode))].join("-");
  return (state.example ? "CONTOH_" : "") + "Tracer Study_" + prodiShortOf(c) + "_" + per + ".xlsx";
}
function extraValues(x){
  const m = x.m;
  return [x.file, x.periodeTxt, m.pre ? "Diisi sebelum wisuda" : "Diisi setelah lulus", x.status, m.tahunMasuk, m.tgl, m.lamaStudi, m.jarakIsi,
    x.inList === true ? "Ada di daftar pengisian" : x.inList === false ? "Tidak ada di daftar pengisian" : "Daftar pengisian tidak diunggah"];
}
async function buildExcel(){
  const c = state.compiled; applyPre();
  const wb = new ExcelJS.Workbook(); wb.creator = "CEDC UNPRI";
  const F = (o) => Object.assign({ name: "Arial", size: 10 }, o || {});
  const FONT = F(), BOLD = F({ bold: true }), ITAL = F({ size: 9, italic: true });
  const fill = argb => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
  const HEADFILL = fill("FFF2F2F2"), EXTRAFILL = fill("FFE2EFDA"), JINGGA = fill("FFFCE4D6"), KUNING = fill("FFFFF2CC"), PREFILL = fill("FFDDEBF7");
  const thin = { style: "thin", color: { argb: "FF000000" } }, hair = { style: "thin", color: { argb: "FFBFBFBF" } };
  const letter = n => { let s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const prodiTxt = prodiShortOf(c) + (c.prodi != null ? " (" + c.prodi + ")" : ""), perTxt = c.period ? periodText(c.period) : "tidak diketahui";
  const today = new Date(); const todayTxt = today.getDate() + " " + BULAN[today.getMonth()] + " " + today.getFullYear();
  const VS = ["v2021", "v2019"].filter(v => c.headers[v]);
  const keptOf = v => c.kept.filter(x => x.v === v), dropOf = v => c.dropped.filter(x => x.v === v);
  const AN = {}; VS.forEach(v => { AN[v] = analyze(v, keptOf(v)); });
  const yrs = list => yrText(list.map(x => x.m.tahun));

  /* ---------- Baca Dulu ---------- */
  const bd = wb.addWorksheet("Baca Dulu", { views: [{ showGridLines: false }] });
  bd.columns = [5, 11, 11, 46, 16, 24, 50, 50, 34].map(w => ({ width: w }));
  let r = 1;
  const put = (row, col, val, font, o) => { const cell = bd.getRow(row).getCell(col); cell.value = val; cell.font = font || FONT; cell.alignment = Object.assign({ wrapText: true, vertical: "top" }, (o && o.align) || {}); if (o && o.fill) cell.fill = o.fill; if (o && o.border) cell.border = o.border; return cell; };
  const kv = (k, v) => { bd.mergeCells(r, 1, r, 3); bd.mergeCells(r, 4, r, 9); put(r, 1, k, BOLD); put(r, 4, v); const lines = String(v || "").split("\n").length; bd.getRow(r).height = Math.max(15, 15 * Math.max(lines, Math.ceil(String(v || "").length / 140))); r++; };
  const head = t => { r++; bd.mergeCells(r, 1, r, 9); put(r, 1, t, F({ size: 12, bold: true })); r++; };
  bd.mergeCells(r, 1, r, 9); put(r, 1, "Baca Dulu: Tracer Study " + prodiTxt, F({ size: 14, bold: true })); r++;
  bd.mergeCells(r, 1, r, 9); put(r, 1, [c.fakultas, "Periode pengisian " + perTxt, "Excel dibuat " + todayTxt + " dari web app Dasbor Tracer Study CEDC UNPRI"].filter(Boolean).join(" · "), ITAL); r++;
  bd.mergeCells(r, 1, r, 9); put(r, 1, "Sheet ini disusun otomatis dari data yang diunggah. Isinya berubah setiap kali data dengan periode berbeda diunggah.", ITAL); r++;

  head("1. Ringkasan data");
  kv("Program studi", prodiTxt + (c.fakultas ? ", " + c.fakultas : ""));
  kv("Periode pengisian", perTxt + (c.period ? "" : ". Unggah paket CARU atau file Download Data Mahasiswa agar periode terbaca."));
  const info = c.infos.length ? c.infos[c.infos.length - 1].info : null;
  if (info) {
    if (info.filter_tahun_masuk || info.filter_tahapan) kv("Filter tarikan", "Tahun masuk: " + (info.filter_tahun_masuk || "-") + "; tahapan masuk: " + (info.filter_tahapan || "-"));
    if (info.tanggal_tarik) kv("Tanggal tarik data", fmtTgl(info.tanggal_tarik));
  }
  kv("File yang digabung", c.files.map(f => "• " + f.name + " (" + (f.kind === "daftar" ? "daftar pengisian" : VERSIONS[f.v].label) + ", " + fmt(f.n) + " baris" + (f.periode ? ", periode " + f.periode : "") + ")").join("\n"));
  VS.forEach(v => kv("Alumni " + VERSIONS[v].label.toLowerCase(), fmt(keptOf(v).length) + " alumni unik, lulusan " + (yrs(keptOf(v)) || "-")));
  kv("NIM ganda", c.dups.length ? fmt(c.dups.length) + " NIM muncul lebih dari sekali. Isian versi 2021 dan periode terbaru dipakai; sisanya di sheet NIM Ganda." : "Tidak ada.");
  if (c.hasDaftar) { const outL = c.kept.filter(x => x.inList === false).length; kv("Cocok dengan daftar pengisian", outL ? fmt(outL) + " baris kuesioner tidak ada di daftar pengisian periode ini (lihat temuan dan kolom status_daftar)." : "Semua baris kuesioner ada di daftar pengisian."); }
  else kv("Daftar pengisian", "Tidak diunggah. Tanggal pengisian, tahun masuk, dan pemeriksaan baris di luar periode tidak tersedia.");
  const preN = c.kept.filter(x => x.m.pre).length, basis = [...new Set(c.kept.filter(x => x.m.pre).map(x => x.m.preBasis))];
  kv("Diisi sebelum wisuda", preN ? fmt(preN) + " alumni (lulusan " + yrText(c.kept.filter(x => x.m.pre).map(x => x.m.tahun)) + "). Dasar penentuan: " + (basis.includes("tanggal wisuda") ? "tanggal pengisian dibanding tanggal wisuda yang diisi di Pengaturan dasbor." : "tahun lulus yang dipilih di Pengaturan dasbor (tanggal wisuda belum diisi).") + " Isian pekerjaan mereka tetap dihitung, karena banyak mahasiswa UNPRI sudah bekerja atau berwirausaha sebelum lulus." : "Tidak ada.");

  head("2. Arti warna");
  [[JINGGA, "Jingga", "Jawaban kemungkinan terisi paksa: pertanyaan dijawab oleh alumni di luar syarat pertanyaan itu, karena sistem mewajibkan semua pertanyaan diisi. Ini dugaan berbasis aturan dan bisa keliru. Jawaban tidak dihapus, tetapi tidak dihitung di dasbor."],
   [KUNING, "Kuning", "Jawaban bertentangan dengan jawaban lain atau tidak sah. Setiap sel kuning punya catatan; arahkan kursor ke sel untuk membacanya."],
   [PREFILL, "Biru (kolom waktu_isian)", "Alumni yang mengisi sebelum wisuda."],
   [EXTRAFILL, "Hijau muda (judul kolom)", "Kolom tambahan dari web app, letaknya di paling kanan setelah kolom asli."]].forEach(([fl, k, v]) => { bd.mergeCells(r, 1, r, 3); bd.mergeCells(r, 4, r, 9); put(r, 1, k, BOLD, { fill: fl }); put(r, 4, v); bd.getRow(r).height = 30; r++; });

  head("3. Daftar temuan");
  const th = ["No", "Versi", "Warna", "Temuan", "Jumlah", "Kolom terdampak", "Mengapa dianggap anomali", "Mengapa dugaan bisa keliru", "Contoh NIM (daftar lengkap di sheet Rincian Temuan untuk warna kuning dan catatan per alumni)"];
  th.forEach((t, j) => put(r, j + 1, t, BOLD, { fill: HEADFILL, border: { top: thin, bottom: thin, left: hair, right: hair } })); r++;
  let no = 0; const lvFill = { jingga: JINGGA, kuning: KUNING, catatan: null };
  VS.forEach(v => AN[v].items.forEach(it => { no++;
    const vals = [no, VERSIONS[v].label, LV[it.lv], it.title + (it.rule && it.lv === "jingga" ? ". Syarat: " + it.rule : ""), fmt(it.n) + " " + it.unit + (it.unit === "sel" ? " (" + fmt(it.rows) + " alumni)" : ""), (it.cols || []).join(", "), it.why, it.caveat, it.nims];
    vals.forEach((val, j) => put(r, j + 1, val, FONT, { fill: j === 2 ? lvFill[it.lv] : null, border: { bottom: hair, left: hair, right: hair } }));
    bd.getRow(r).height = Math.min(160, 15 * Math.ceil(Math.max(it.why.length, it.caveat.length) / 55)); r++; }));
  if (!no) { bd.mergeCells(r, 1, r, 9); put(r, 1, "Tidak ada temuan pada data ini."); r++; }
  if (VS.includes("v2021") && !c.headers.v2021.includes("f1301")) { bd.mergeCells(r, 1, r, 9); put(r, 1, "Catatan: data pendapatan (F13) belum ada di file tarikan versi 2021, sehingga bobot gaji IKU 2 belum bisa dihitung.", ITAL); r++; }

  if (info) {
    head("4. Hasil cek tarikan dari CARU");
    [["layar_total", "Baris di layar sistem (total)"], ["layar_v2021", "Baris di layar, versi 2021"], ["layar_v2019", "Baris di layar, versi 2019"], ["file_v2021", "Baris di file versi 2021"], ["file_v2019", "Baris di file versi 2019"], ["file_daftar", "Baris di daftar pengisian"]].forEach(([k, l]) => { if (info[k] != null) kv(l, info[k]); });
    if (info.catatan.length) kv("Catatan", info.catatan.map(t => "• " + t).join("\n"));
  }

  head((info ? "5" : "4") + ". Isi sheet");
  const sheetsDesc = [["Baca Dulu", "Sheet ini."], ["Rincian Temuan", "Semua alumni pada setiap temuan kuning dan catatan per alumni, lengkap dengan NIM, nama, telepon, dan email untuk dikonfirmasi."], ["Ringkas", "Kolom inti per alumni dalam urutan yang mudah dibaca: identitas, waktu pengisian, status, pekerjaan, dan kategori IKU 2. Jawaban yang terisi paksa tidak ditampilkan."]];
  VS.forEach(v => { const n = c.headers[v].length; sheetsDesc.push(["Data Terbaca " + v.slice(1), "Kolom A sampai " + letter(n) + " sama persis dengan file tarikan sistem, kodenya sudah diterjemahkan. Baris 1 sampai 2 judul dan legenda, baris 3 kode kolom asli, baris 4 pertanyaan, data mulai baris 5. Kolom tambahan " + letter(n + 1) + " sampai " + letter(n + EXTRA_COLS.length) + ": " + EXTRA_COLS.map(e => e[0]).join(", ") + "."]); });
  VS.forEach(v => { if (dropOf(v).length) sheetsDesc.push(["NIM Ganda " + v.slice(1), "Isian dari NIM yang sama yang tidak dipakai."]); });
  VS.forEach(v => sheetsDesc.push(["Panduan Kode " + v.slice(1), "Arti setiap kode, syarat jawaban relevan, dan status verifikasi."]));
  VS.forEach(v => sheetsDesc.push(["Data Asli " + v.slice(1), "Isi file tarikan apa adanya, tanpa terjemahan. Dua kolom terakhir (file_sumber, periode) ditambahkan web app."]));
  if (c.hasDaftar) sheetsDesc.push(["Data Asli Daftar Pengisian", "Isi file Download Data Mahasiswa apa adanya. Dua kolom terakhir (file_sumber, periode) ditambahkan web app."]);
  sheetsDesc.forEach(([k, v]) => kv(k, v));

  /* ---------- Rincian Temuan: semua alumni per temuan, dengan kontak untuk konfirmasi ---------- */
  const rt = wb.addWorksheet("Rincian Temuan", { views: [{ state: "frozen", ySplit: 3 }] });
  const RT = [["No temuan", 9], ["Versi", 11], ["Warna", 10], ["Temuan", 46], ["NIM", 15], ["Nama", 28], ["Telepon", 16], ["Email", 30], ["Tahun lulus", 9], ["Keterangan", 46]];
  rt.columns = RT.map(h => ({ width: h[1] }));
  rt.mergeCells(1, 1, 1, RT.length); rt.getCell(1, 1).value = "Rincian Temuan: Tracer Study " + prodiTxt + " · periode pengisian " + perTxt; rt.getCell(1, 1).font = F({ size: 12, bold: true });
  rt.mergeCells(2, 1, 2, RT.length); rt.getCell(2, 1).value = "Setiap baris satu alumni pada satu temuan, untuk dikonfirmasi dan diperbaiki di sistem. Nomor temuan sama dengan daftar di sheet Baca Dulu. Temuan jingga (terisi paksa) tidak dirinci per alumni karena tidak perlu dikonfirmasi."; rt.getCell(2, 1).font = ITAL; rt.getCell(2, 1).alignment = { wrapText: true }; rt.getRow(2).height = 30;
  RT.forEach((h, j) => { const cell = rt.getRow(3).getCell(j + 1); cell.value = h[0]; cell.font = BOLD; cell.fill = HEADFILL; cell.alignment = { wrapText: true, vertical: "middle" }; cell.border = { top: thin, bottom: thin }; });
  let rr = 4, tno = 0;
  VS.forEach(v => AN[v].items.forEach(it => { tno++; if (!it.all || it.lv === "jingga") return;
    it.all.forEach(({ x, note }) => { const vals = [tno, VERSIONS[v].label, LV[it.lv], it.title, ident(x.r.nimhsmsmh), txt(x.r.nmmhsmsmh), phone(x.r.telpomsmh), txt(x.r.emailmsmh), x.m.tahun, note];
      const row = rt.getRow(rr++); vals.forEach((val, j) => { if (val === null || val === undefined || val === "") return; const cell = row.getCell(j + 1); cell.value = val; cell.font = FONT; cell.alignment = { wrapText: j === 3 || j === 9, vertical: "top" }; if (j === 2 && it.lv === "kuning") cell.fill = KUNING; }); }); }));
  if (rr === 4) { rt.mergeCells(4, 1, 4, RT.length); rt.getCell(4, 1).value = "Tidak ada temuan kuning atau catatan per alumni pada data ini."; rt.getCell(4, 1).font = FONT; }
  else rt.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: RT.length } };

  /* ---------- Ringkas ---------- */
  const rk = wb.addWorksheet("Ringkas", { views: [{ state: "frozen", xSplit: 3, ySplit: 3 }] });
  const RK = [["Versi", 11], ["NIM", 15], ["Nama", 28], ["Tahun masuk", 9], ["Tahun lulus", 9], ["Tanggal pengisian", 12], ["Waktu isian", 20], ["Status saat mengisi", 24], ["Dapat kerja dalam 6 bulan", 12], ["Lama menunggu kerja (bulan)", 12], ["Jenis tempat kerja", 26], ["Nama tempat kerja", 28], ["Kabupaten/kota kerja", 24], ["Provinsi kerja", 18], ["Keterkaitan dengan bidang studi", 18], ["Kesesuaian tingkat pendidikan", 22], ["Kategori IKU 2 (perkiraan)", 24], ["Status daftar", 24], ["Status NIM", 24]];
  rk.columns = RK.map(h => ({ width: h[1] }));
  rk.mergeCells(1, 1, 1, RK.length); rk.getCell(1, 1).value = "Ringkas: Tracer Study " + prodiTxt + " · periode pengisian " + perTxt + " · " + fmt(c.kept.length) + " alumni"; rk.getCell(1, 1).font = F({ size: 12, bold: true });
  rk.mergeCells(2, 1, 2, RK.length); rk.getCell(2, 1).value = "Kolom pekerjaan hanya diisi untuk alumni yang bekerja atau berwirausaha. Data lengkap ada di sheet Data Terbaca; penjelasan di sheet Baca Dulu."; rk.getCell(2, 1).font = ITAL;
  RK.forEach((h, j) => { const cell = rk.getRow(3).getCell(j + 1); cell.value = h[0]; cell.font = BOLD; cell.fill = HEADFILL; cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" }; cell.border = { top: thin, bottom: thin, left: hair, right: hair }; });
  rk.getRow(3).height = 42;
  const dv = (x, col) => c.headers[x.v].includes(col) ? specFor(x.v, col)[1](x.r) : null;
  c.kept.forEach((x, i) => { const m = x.m, w = m.work, k = num(x.r.f5a2), pc = k !== null && KABKOTA[k] ? Math.floor(k / 10000) * 10000 : null;
    const vals = [VERSIONS[x.v].label, ident(x.r.nimhsmsmh), txt(x.r.nmmhsmsmh), m.tahunMasuk, m.tahun, m.tgl, m.pre ? "Diisi sebelum wisuda" : "Diisi setelah lulus", m.detail,
      w ? (m.le6 ? "Ya" : "Tidak") : null, w ? m.months : null, w ? dv(x, "f1101") : null, w ? dv(x, "f5b") : null, w && k !== null ? (KABKOTA[k] || dv(x, "f5a2")) : null, w && pc ? PROV[pc] : null,
      w ? dv(x, "f14") : null, w ? dv(x, "f15") : null, ikuCategory(m), x.inList === true ? "Ada di daftar pengisian" : x.inList === false ? "Tidak ada di daftar pengisian" : "Daftar tidak diunggah", x.status];
    const row = rk.getRow(i + 4); vals.forEach((val, j) => { if (val === null || val === undefined || val === "") return; const cell = row.getCell(j + 1); cell.value = val; cell.font = FONT; if (val instanceof Date) cell.numFmt = "dd/mm/yyyy"; if (j === 6 && m.pre) cell.fill = PREFILL; }); });
  rk.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: RK.length } };

  /* ---------- Data Terbaca dan NIM Ganda ---------- */
  function dataSheet(name, v, list, an){
    const cols = c.headers[v]; const ws = wb.addWorksheet(name, { views: [{ state: "frozen", xSplit: 4, ySplit: 4 }] });
    const heads = cols.map(col => { const sp = specFor(v, col); return [col, sp[0], sp[3]]; }).concat(EXTRA_COLS);
    ws.columns = heads.map(h => ({ width: h[2] }));
    ws.mergeCells(1, 1, 1, 12); ws.getCell(1, 1).value = "Tracer Study " + prodiTxt + " · Kuesioner " + VERSIONS[v].label + " · periode pengisian " + perTxt + " · " + fmt(list.length) + " alumni" + (name.startsWith("NIM Ganda") ? " (isian ganda yang tidak dipakai)" : ""); ws.getCell(1, 1).font = F({ size: 12, bold: true });
    ws.mergeCells(2, 1, 2, 12); ws.getCell(2, 1).value = "Jingga: kemungkinan terisi paksa. Kuning: jawaban bertentangan atau tidak sah (arahkan kursor untuk catatan). Biru di waktu_isian: diisi sebelum wisuda. Judul hijau muda: kolom tambahan. Penjelasan lengkap di sheet Baca Dulu."; ws.getCell(2, 1).font = ITAL;
    heads.forEach((h, j) => { const ex = j >= cols.length; const a = ws.getRow(3).getCell(j + 1); a.value = h[0]; a.font = BOLD; a.fill = ex ? EXTRAFILL : HEADFILL; a.alignment = { horizontal: "center", vertical: "middle" }; a.border = { top: thin, bottom: thin, left: hair, right: hair }; const b = ws.getRow(4).getCell(j + 1); b.value = h[1]; b.font = ITAL; if (ex) b.fill = EXTRAFILL; b.alignment = { wrapText: true, vertical: "top" }; b.border = { bottom: thin, left: hair, right: hair }; });
    ws.getRow(4).height = 120;
    list.forEach((x, i) => {
      const row = ws.getRow(i + 5);
      cols.forEach((col, j) => { const sp = specFor(v, col); const val = sp[1](x.r); const flag = an.cells.get(i + "|" + col); if ((val === null || val === undefined) && !(flag && flag.lv === "kuning")) return; const cell = row.getCell(j + 1); if (val !== null && val !== undefined) cell.value = val; cell.font = FONT;
        if (/^f(505|130[123])$/.test(col) && typeof val === "number") cell.numFmt = "#,##0"; if (val instanceof Date) cell.numFmt = "dd/mm/yyyy";
        if (flag) { cell.fill = flag.lv === "kuning" ? KUNING : JINGGA; if (flag.lv === "kuning" && flag.note) cell.note = flag.note; } });
      extraValues(x).forEach((val, k) => { if (val === null || val === undefined) return; const cell = row.getCell(cols.length + k + 1); cell.value = val; cell.font = FONT; if (val instanceof Date) cell.numFmt = "dd/mm/yyyy"; if (k === 2 && x.m.pre) cell.fill = PREFILL; });
    });
    ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: heads.length } };
  }
  function guideSheet(name, v){
    const pg = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 6 }] });
    pg.getCell("A1").value = "Panduan Kode Kuesioner Tracer Study " + VERSIONS[v].label + " (format Kemdikbud), sistem internal UNPRI"; pg.getCell("A1").font = F({ size: 12, bold: true });
    ["Sheet 'Data Terbaca " + v.slice(1) + "' memakai kolom yang sama persis dengan file tarikan sistem. Baris 1 sampai 2 judul dan legenda, baris 3 kode kolom asli, baris 4 pertanyaan, data mulai baris 5. Kolom tambahan ada di paling kanan.",
     "Sel jingga = kemungkinan terisi paksa (tidak relevan dengan status responden). Sel kuning = jawaban bertentangan atau tidak sah, dengan catatan sel. Penjelasan lengkap di sheet Baca Dulu.",
     "Periode pengisian: " + perTxt + ". File yang digabung: " + c.files.filter(f => f.v === v).map(f => f.name + " (" + f.n + " baris)").join("; ") + ".",
     "Status Verifikasi: Terkonfirmasi = dicocokkan dengan tampilan sistem UNPRI; Kuesioner resmi = mengikuti kuesioner Kemdikbud, belum dicocokkan di layar sistem."].forEach((t, i) => { const cell = pg.getCell(2 + i, 1); cell.value = t; cell.font = ITAL; });
    const heads = ["Kolom", "Kode Kolom Excel", "Kode di Layar Sistem", "Pertanyaan", "Kode Nilai", "Arti", "Jawaban Relevan Jika", "Status Verifikasi"];
    pg.columns = [7, 16, 14, 52, 10, 50, 40, 30].map(w => ({ width: w }));
    heads.forEach((h, j) => { const cell = pg.getRow(6).getCell(j + 1); cell.value = h; cell.font = BOLD; cell.fill = HEADFILL; cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; cell.border = { top: thin, bottom: thin, left: hair, right: hair }; });
    const allCols = c.headers[v].concat(EXTRA_COLS.map(e => e[0]));
    panduan(v).forEach((rw, i) => { const vals = [rw[0] && allCols.includes(rw[0]) ? letter(allCols.indexOf(rw[0]) + 1) : ""].concat(rw.slice(0, 7)); const row = pg.getRow(7 + i); vals.forEach((val, j) => { const cell = row.getCell(j + 1); cell.value = val === "" ? null : val; cell.font = (j <= 1 && val) ? BOLD : FONT; cell.alignment = { wrapText: true, vertical: "top", horizontal: (j === 0 || j === 4) ? "center" : undefined }; cell.border = { top: rw[7] ? thin : undefined, left: hair, right: hair }; }); });
  }
  function rawSheet(name, v){
    const cols = c.headers[v], da = wb.addWorksheet(name, { views: [{ state: "frozen", xSplit: 4, ySplit: 1 }] }); const dh = cols.concat(["file_sumber", "periode"]);
    da.columns = dh.map(() => ({ width: 12 })); dh.forEach((h, j) => { const cell = da.getRow(1).getCell(j + 1); cell.value = h; cell.font = BOLD; cell.fill = HEADFILL; });
    c.all.filter(x => x.v === v).forEach((x, i) => { const row = da.getRow(i + 2); cols.forEach((col, j) => { let val = x.r[col]; if (isBlank(val)) return; if (["nimhsmsmh","nik","telpomsmh","npwp","kdptimsmh"].includes(col)) val = typeof val === "string" ? val.trim() : ident(val); const cell = row.getCell(j + 1); cell.value = val; cell.font = FONT; if (val instanceof Date) cell.numFmt = "yyyy-mm-dd"; }); row.getCell(cols.length + 1).value = x.file; row.getCell(cols.length + 2).value = x.periodeTxt; });
  }
  function rawDaftar(){
    const ws = wb.addWorksheet("Data Asli Daftar Pengisian", { views: [{ state: "frozen", ySplit: 1 }] });
    const h = (c.daftarFiles[0] && c.daftarFiles[0].header) || ["NIM"]; const dh = h.concat(["file_sumber", "periode"]);
    ws.columns = dh.map((x, j) => ({ width: j === 1 ? 28 : 14 })); dh.forEach((t, j) => { const cell = ws.getRow(1).getCell(j + 1); cell.value = t; cell.font = BOLD; cell.fill = HEADFILL; });
    let i = 2; c.daftarFiles.forEach(f => f.rows.forEach(rec => { const row = ws.getRow(i++);
      const vals = rec.raw ? rec.raw.slice(0, h.length) : [null, rec.nama, rec.nim, rec.prodiNama, rec.tahunMasuk, rec.tahunLulus, null, null, rec.tgl ? fmtTgl(isoDate(rec.tgl)) : null];
      vals.forEach((val, j) => { if (isBlank(val)) return; const cell = row.getCell(j + 1); cell.value = (j === 2 || /telp/i.test(h[j] || "")) && typeof val === "number" ? ident(val) : val; cell.font = FONT; });
      row.getCell(h.length + 1).value = f.name; row.getCell(h.length + 2).value = periodText(f.period); }));
  }
  VS.forEach(v => dataSheet("Data Terbaca " + v.slice(1), v, keptOf(v), AN[v]));
  VS.forEach(v => { const d = dropOf(v); if (d.length) dataSheet("NIM Ganda " + v.slice(1), v, d, analyze(v, d)); });
  VS.forEach(v => guideSheet("Panduan Kode " + v.slice(1), v));
  VS.forEach(v => rawSheet("Data Asli " + v.slice(1), v));
  if (c.hasDaftar) rawDaftar();
  return wb.xlsx.writeBuffer();
}
async function saveFile(filename, blob){
  try { if (window.claude && typeof window.claude.use === "function") { const d = await window.claude.use("downloads"); if (d) { await d.save({ filename, data: blob }); return "saved"; } } }
  catch (e) { if (e && e.code === "declined") return "declined"; if (e && e.code && e.code !== "unavailable") throw e; }
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); return "saved";
}
