#!/usr/bin/env python3
"""Membangun halaman pengalih statis untuk GitHub Pages dari links.json.

Setiap kunci di links.json menjadi folder berisi index.html yang langsung mengalihkan ke url tujuan,
lengkap dengan judul dan keterangan untuk pratinjau tautan di WhatsApp. Jalankan setiap kali links.json berubah.
"""
import json, html, os, re, shutil

BASE = os.path.dirname(os.path.abspath(__file__))
links = json.load(open(os.path.join(BASE, "links.json"), encoding="utf-8"))

STYLE = """:root{--deep:#14532D;--accent:#15803D;--soft:#ECFDF3;--line:#BBF7D0;--ink:#0F1F14;--muted:#4B5B50;--bg:#F6F8F5}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 'Plus Jakarta Sans',system-ui,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px 16px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:28px;max-width:520px;width:100%}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
h1{margin:6px 0 10px;font-size:24px;line-height:1.25;background:linear-gradient(90deg,#14532D,#15803D 60%,#22C55E);-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin:0 0 14px;color:var(--muted)}a.btn{display:inline-block;background:var(--deep);color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px}
ul{list-style:none;padding:0;margin:14px 0 0}li{border-top:1px solid var(--line);padding:10px 0}li:first-child{border-top:0}code{background:var(--soft);padding:1px 6px;border-radius:6px}"""

def page(title, body, head_extra=""):
    return f"""<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><meta name="robots" content="noindex">{head_extra}
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&display=swap" rel="stylesheet">
<style>{STYLE}</style></head><body><main class="card">{body}</main></body></html>
"""

# bersihkan folder lama yang dibuat skrip ini (ditandai berkas .tautan)
for name in os.listdir(BASE):
    p = os.path.join(BASE, name)
    if os.path.isdir(p) and os.path.exists(os.path.join(p, ".tautan")):
        shutil.rmtree(p)

for slug, d in links.items():
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
        raise SystemExit(f"Nama tautan tidak sah: {slug} (pakai huruf kecil, angka, dan tanda hubung)")
    url, judul, ket = d["url"], d.get("judul", slug), d.get("keterangan", "")
    u = html.escape(url, quote=True)
    head = (f'<meta http-equiv="refresh" content="0;url={u}"><link rel="canonical" href="{u}">'
            f'<meta property="og:title" content="{html.escape(judul, quote=True)}"><meta property="og:description" content="{html.escape(ket, quote=True)}">'
            f'<script>location.replace({json.dumps(url)});</script>')
    body = (f'<span class="eyebrow">CARU CEDC UNPRI</span><h1>{html.escape(judul)}</h1><p>{html.escape(ket)}</p>'
            f'<p>Sedang mengalihkan. Bila tidak berpindah otomatis, klik tombol di bawah.</p><a class="btn" href="{u}">Buka halaman</a>')
    os.makedirs(os.path.join(BASE, slug), exist_ok=True)
    open(os.path.join(BASE, slug, "index.html"), "w", encoding="utf-8").write(page(judul, body, head))
    open(os.path.join(BASE, slug, ".tautan"), "w").write("dibuat oleh buat_link.py\n")

items = "".join(f'<li><a href="{html.escape(s)}/"><code>/{html.escape(s)}</code></a> {html.escape(d.get("judul", s))}</li>' for s, d in sorted(links.items()))
open(os.path.join(BASE, "index.html"), "w", encoding="utf-8").write(page("Tautan CARU CEDC UNPRI",
    f'<span class="eyebrow">CARU CEDC UNPRI</span><h1>Tautan resmi CARU</h1><p>Career and Alumni Relations Unit, Career, Entrepreneurship, and Development Center Universitas Prima Indonesia.</p><ul>{items}</ul>'))
open(os.path.join(BASE, "404.html"), "w", encoding="utf-8").write(page("Tautan tidak ditemukan",
    '<span class="eyebrow">CARU CEDC UNPRI</span><h1>Tautan tidak ditemukan</h1><p>Periksa kembali ejaan tautan, atau hubungi CARU CEDC UNPRI.</p><a class="btn" href="./">Lihat daftar tautan</a>'))
open(os.path.join(BASE, ".nojekyll"), "w").close()
print("Selesai:", ", ".join("/" + s for s in links))
