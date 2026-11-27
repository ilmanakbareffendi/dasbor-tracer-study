"use strict";
/* ================= MESIN ANOMALI (dipakai dasbor dan Excel) ================= */
// Tiga tingkat: "jingga" = kemungkinan terisi paksa (aturan relevansi), "kuning" = jawaban bertentangan atau tidak sah, "catatan" = masalah tingkat kolom atau baris.
// Setiap temuan dihitung ulang dari data yang diunggah; temuan dengan jumlah nol tidak ditampilkan.
const LV = { jingga: "Jingga", kuning: "Kuning", catatan: "Catatan" };
// nama awam untuk aturan relevansi yang paling sering muncul; aturan lain memakai bunyi syaratnya
const RULE_PLAIN = { work: "Pertanyaan khusus alumni yang bekerja, diisi juga oleh yang tidak bekerja", w19: "Pertanyaan khusus alumni yang bekerja, diisi juga oleh yang tidak bekerja", studi: "Pertanyaan studi lanjut, diisi oleh yang tidak melanjutkan studi", work_tidak: "Lama menunggu kerja lebih dari 6 bulan (F506), diisi oleh yang tidak bekerja atau menjawab mendapat kerja dalam 6 bulan", work_ya: "Lama mendapat kerja dalam 6 bulan (F502), diisi oleh yang tidak bekerja atau menjawab lebih dari 6 bulan", wira: "Pertanyaan khusus wirausaha, diisi oleh yang bukan wirausaha", cari: "Pertanyaan proses mencari kerja, diisi oleh yang tidak mencari kerja", cari19: "Pertanyaan proses mencari kerja, diisi oleh yang tidak mencari kerja" };
const CAVEAT_FORCED = "Dugaan ini bisa keliru bila alumni salah memilih jawaban penentu (misalnya status di F8), atau mengisi pengalaman kerja atau studi sebelumnya. Jawaban tidak dihapus; hanya diwarnai dan tidak dihitung di dasbor.";
function nimOf(x){ return ident(x.r.nimhsmsmh) || "-"; }
function analyze(v, list){
  const c = state.compiled, head = (c && c.headers[v]) || [], has = col => head.includes(col);
  const cells = new Map(), items = [];
  const mark = (i, col, lv, note) => { if (!has(col) && !["tahun_lulus"].includes(col)) return; const k = i + "|" + col, o = cells.get(k); if (o && o.lv === "kuning") { if (note && !o.note.includes(note)) o.note += "\n" + note; return; } cells.set(k, { lv, note: note || "" }); };
  const sample = arr => [...new Set(arr)].slice(0, 5).join(", ");
  // 1) JINGGA: aturan relevansi per kolom
  const byRule = {};
  list.forEach((x, i) => head.forEach(col => { const sp = specFor(v, col), rid = sp[2]; if (!rid || !RULES[rid] || !RULES[rid][1]) return; const val = sp[1](x.r); if (val === null || val === undefined) return; if (RULES[rid][1](x.r)) return;
    mark(i, col, "jingga"); const b = byRule[rid] || (byRule[rid] = { cols: new Set(), n: 0, rows: new Set(), nims: [] }); b.cols.add(col); b.n++; if (!b.rows.has(i)) { b.rows.add(i); b.nims.push(nimOf(x)); } }));
  Object.keys(byRule).forEach(rid => { const b = byRule[rid], hidden = rid === "hidden", studi = rid === "studi";
    items.push({ id: "j_" + rid, lv: hidden ? "catatan" : "jingga", title: hidden ? "Kolom yang tidak tampil di layar sistem" : RULE_PLAIN[rid] || "Isian lanjutan (" + [...b.cols].join(", ").toUpperCase() + ") diisi oleh alumni yang tidak memenuhi syarat", rule: RULES[rid][0], cols: [...b.cols], n: b.n, unit: "sel", rows: b.rows.size, nims: sample(b.nims),
      why: hidden ? "Kolom ini tidak tampil di layar sistem dan nilainya selalu 5 untuk semua alumni." : "Pertanyaan di kolom ini hanya berlaku bila " + RULES[rid][0] + ". Sistem mewajibkan semua pertanyaan diisi, sehingga jawaban dari alumni di luar syarat itu kemungkinan terisi paksa.",
      caveat: hidden ? "Tidak ada; kolom diabaikan di dasbor." : studi ? "Bisa keliru bila alumni kuliah lanjut sambil bekerja tetapi memilih Bekerja di F8; dalam kasus itu isian studi lanjutnya justru benar. " + CAVEAT_FORCED : CAVEAT_FORCED }); });
  // 2) KUNING: jawaban bertentangan atau tidak sah
  const K = (id, title, cols, why, caveat, test) => { let n = 0; const nims = [], all = []; list.forEach((x, i) => { const hit = test(x); if (!hit) return; n++; nims.push(nimOf(x)); all.push({ x, note: typeof hit === "string" ? hit : Array.isArray(hit) ? "Kolom " + hit.join(", ") : "" }); (Array.isArray(hit) ? hit : cols).forEach(col => mark(i, col, "kuning", typeof hit === "string" ? hit : title)); });
    if (n) items.push({ id, lv: "kuning", title, cols, n, unit: "alumni", rows: n, nims: sample(nims), all, why, caveat }); };
  if (v === "v2021") {
    K("k_masa_tunggu", "Menjawab tidak mendapat kerja dalam 6 bulan (F504 = Tidak), tetapi lama menunggu (F506) kosong atau kurang dari 7 bulan", ["f504", "f506"],
      "F504 = Tidak berarti pekerjaan didapat lebih dari 6 bulan setelah lulus, sehingga F506 seharusnya 7 bulan atau lebih.",
      "Bisa jadi alumni salah memilih F504 dan sebenarnya mendapat kerja dalam 6 bulan. Karena tidak bisa dipastikan, lama masa tunggunya tidak dipakai di dasbor dan alumni ini masuk kategori IKU 2 'tanpa data'.",
      x => x.m.work && x.m.inconsistent ? ["f504", "f506"] : false);
    K("k_lokasi", "Lokasi kerja berisi kode wilayah yang tidak dikenal (misalnya 999999)", ["f5a1", "f5a2"],
      "Isian bukan kode wilayah yang sah. Lokasi yang tidak dipilih (masih \"------\" atau \"Pilih Provinsi\") dihitung sebagai tidak menjawab, bukan temuan.",
      "Kode baru hasil pemekaran wilayah bisa belum ada di daftar Kemendikdasmen yang dipakai (diambil 28 Oktober 2026).",
      x => { if (!x.m.work) return false; const out = []; const a = n_(x.r, "f5a1"), b = n_(x.r, "f5a2");
        // isian bawaan sistem ("------", "Pilih ...") berarti tidak menjawab, bukan isian tidak sah
        const unanswered = v => isBlank(v) || /^-+$/.test(String(v).trim()) || /^pilih/i.test(String(v).trim());
        if (!unanswered(x.r.f5a1) && (a === null || !PROV[a])) out.push("f5a1"); if (!unanswered(x.r.f5a2) && (b === null || !KABKOTA[b])) out.push("f5a2"); return out.length ? out : false; });
    K("k_prov_kab", "Provinsi tidak sesuai dengan kabupaten/kota tempat kerja", ["f5a1", "f5a2"],
      "Dua digit awal kode kabupaten/kota menunjukkan provinsinya. Bila berbeda dengan provinsi yang dipilih, salah satu isian keliru.",
      "Dasbor memakai kabupaten/kota sebagai acuan, sehingga provinsi yang tidak sesuai tidak memengaruhi angka lokasi.",
      x => { if (!x.m.work) return false; const a = n_(x.r, "f5a1"), b = n_(x.r, "f5a2"); return a !== null && b !== null && PROV[a] && KABKOTA[b] && Math.floor(b / 10000) * 10000 !== a; });
  }
  K("k_lamaran", "Jumlah perusahaan yang merespons (F7) lebih banyak dari jumlah lamaran (F6), atau undangan wawancara (F7A) lebih banyak dari respons", ["f6", "f7", "f7a"],
    "Respons tidak mungkin melebihi lamaran, dan undangan wawancara tidak mungkin melebihi respons.",
    "Alumni mungkin menghitung tawaran yang datang tanpa melamar (misalnya dihubungi perusahaan), atau tertukar urutan pengisian. Isian ini tidak dipakai di corong lamaran.",
    x => { if (!x.m.searched) return false; const a = n_(x.r, "f6"), b = n_(x.r, "f7"), d = n_(x.r, "f7a"); return a !== null && b !== null && (b > a || (d !== null && d > b)); });
  if (has("f1301")) K("k_gaji", "Pendapatan di bawah Rp100 ribu per bulan", ["f1301"],
    "Nilai ini terlalu kecil untuk pendapatan bulanan.",
    "Kemungkinan ditulis dalam ribuan atau jutaan rupiah (misalnya 4500 untuk Rp4,5 juta). Tidak dipakai dalam bobot gaji IKU 2.",
    x => { const g = n_(x.r, "f1301"); return x.m.work && g !== null && g > 0 && g < 100000; });
  K("k_tahun_lulus", "Tahun lulus berbeda antara file kuesioner dan daftar pengisian", ["tahun_lulus"],
    "Data yang sama di dua tempat seharusnya identik.",
    "Salah satu sumber mungkin diperbarui belakangan. Dasbor memakai tahun lulus dari file kuesioner; pastikan di data akademik.",
    x => x.d && x.d.tahunLulus != null && x.m.tahun != null && x.d.tahunLulus !== x.m.tahun ? "Tahun lulus di daftar pengisian: " + x.d.tahunLulus : false);
  const J = jenjang();
  K("k_lama_studi", "Lama studi tidak wajar untuk jenjang " + J.k + " (kurang dari " + J.lo + " tahun atau lebih dari " + J.hi + " tahun)", ["tahun_lulus"],
    "Dihitung dari tahun masuk (daftar pengisian) sampai tahun lulus. " + J.prog,
    "Wajar untuk mahasiswa pindahan, alih jenjang, atau rekognisi pembelajaran lampau (RPL). Perlu dicek di data akademik.",
    x => x.m.lamaStudi != null && (x.m.lamaStudi < J.lo || x.m.lamaStudi > J.hi) ? "Lama studi " + x.m.lamaStudi + " tahun (masuk " + x.m.tahunMasuk + ", lulus " + x.m.tahun + ")" : false);
  // 3) CATATAN tingkat kolom atau baris
  const C = (id, title, n, unit, cols, why, caveat, nims, all) => { if (n) items.push({ id, lv: "catatan", title, n, unit, cols, rows: n, nims: nims || "", all: all || null, why, caveat }); };
  const flat = (V => V.f17.flatMap(([a, b]) => [a, b]))(VERSIONS[v]).filter(col => { const vals = list.map(x => num(x.r[col])).filter(q => q !== null); return vals.length >= 10 && vals.every(q => q === vals[0]); });
  C("c_konstan", "Kolom kompetensi bernilai sama untuk semua alumni", flat.length, "kolom", flat, "Jawaban skala 1 sampai 5 yang seragam pada seluruh alumni hampir pasti bukan jawaban asli, melainkan nilai bawaan sistem.", "Bisa benar bila jumlah alumni sangat sedikit. Kolom ini tidak dipakai di grafik kompetensi.");
  if (v === "v2021" && has("f505")) C("c_f505", "Kolom f505 berisi angka yang bercampur", list.filter(x => !isBlank(x.r.f505)).length, "alumni", ["f505"], "Kolom ini tidak tampil di layar sistem dan isinya bukan pendapatan (F13 di layar kosong untuk sampel yang dicek).", "Bila sistem memperbaiki ekspor F13, kolom pendapatan akan terbaca otomatis.");
  const outL = list.filter(x => x.inList === false);
  C("c_luar_daftar", "Baris kuesioner tidak ada di daftar pengisian periode ini", outL.length, "alumni", ["status_daftar"], "Daftar pengisian (Download Data Mahasiswa) sama dengan daftar di layar sistem. Baris yang tidak ada di sana kemungkinan diisi di luar periode tarikan, karena tombol unduh kuesioner tidak selalu menerapkan filter periode.", "Bisa juga karena data alumni diperbarui setelah daftar ditarik. Baris tetap dihitung di dasbor dan ditandai di kolom status_daftar.", sample(outL.map(nimOf)), outL.map(x => ({ x, note: "Tidak ada di daftar pengisian periode ini" })));
  const dupN = c ? c.dups.filter(d => c.kept.some(x => x.v === v && nimKey(x.r.nimhsmsmh) === d.nim)).length : 0;
  C("c_ganda", "NIM muncul lebih dari sekali", dupN, "NIM", ["status_nim"], "Satu alumni mengisi lebih dari sekali, atau periode tarikan tumpang tindih.", "Isian versi 2021 dan periode terbaru dipakai; isian lain disimpan di sheet NIM Ganda.", "");
  if (c && !c.hasDaftar) C("c_tanpa_daftar", "Daftar pengisian tidak diunggah", list.length, "alumni", [], "Tanpa daftar pengisian, tanggal pengisian, tahun masuk, dan pemeriksaan baris di luar periode tidak tersedia.", "Unggah paket CARU, atau sertakan file Download Data Mahasiswa.", "");
  const order = { kuning: 0, jingga: 1, catatan: 2 };
  items.sort((a, b) => order[a.lv] - order[b.lv] || b.n - a.n);
  const jCells = [...cells.values()].filter(q => q.lv === "jingga").length, kCells = [...cells.values()].filter(q => q.lv === "kuning").length;
  return { cells, items, jCells, kCells };
}
