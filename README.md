# Pulupulu

Penjaga desain untuk AI coding agent. Pulupulu membuat UI yang dibangun AI tidak kelihatan seperti buatan AI, dan memastikan hasilnya jujur, berfungsi, dan bisa dipakai semua orang.

[English](README.en.md)

Pulupulu menggabungkan dua proyek open source lalu menambal kekurangan masing-masing:

| | antislop | Impeccable | **Pulupulu** |
|---|---|---|---|
| Aturan tertulis (tes tujuan, Hard Gate, Delivery Gate) | ✓ | sebagian | ✓ |
| Mode halaman (Persuade, Operate, Read, Experience) | | ✓ | ✓ |
| Perintah (`audit`, `polish`, `typeset`, dll.) | | 24 | 25 |
| Detektor otomatis tanpa AI | | ✓ (binary diunduh) | ✓ (JavaScript, tanpa unduhan) |
| Cek di browser: kontras, ukuran tombol, overflow, fokus keyboard | | ✓ | ✓ |
| Hook yang hanya melaporkan masalah **baru**, bukan masalah lama | | sebagian | ✓ |
| Copy & tombol generik bahasa Indonesia ikut dicek | | | ✓ |
| Komentar kode, aksesibilitas, layout HP | ✓ | sebagian | ✓ |
| Dependency | 0 | engine Rust | 0 (cukup Node 18+) |

## Isinya

- **Skill `pulupulu`**: aturan R-01 sampai R-48 dalam tiga tingkat (Hard Gate, Purpose Gate, Quality Lock), dial ENERGY / RHYTHM / MOTION, mode halaman, dan Delivery Gate.
- **25 perintah**: `init`, `document`, `shape`, `build`, `extract`, `critique`, `audit`, `detect`, `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `clarify`, `adapt`, `optimize`, `comments`, `hooks`.
- **Detektor**: memindai HTML, CSS, JSX/TSX, Vue, Svelte, Astro, Blade, dan template lain. Contoh yang ditangkap: gradasi ungu, teks bergradasi, label kecil di atas judul, kartu bertumpuk, statistik palsu, avatar palsu, tombol mati, em dash, buzzword, font pasaran, kontras rendah.
- **Cek browser**: membuka halaman di Chrome/Edge headless ukuran desktop dan HP, lalu mengukur kontras, ukuran target sentuh, overflow horizontal, fokus keyboard, gambar rusak, error JavaScript, dan heading. Bisa sekalian menyimpan screenshot.
- **Hook Claude Code**: setelah Claude mengedit file UI, detektor langsung jalan dan Claude diberi tahu masalah yang baru ia buat. Saat Claude mau selesai, hook memeriksa sekali lagi.

## Instalasi

Butuh Node.js 18 atau lebih baru. Cek browser butuh Node 22+ dan Chrome atau Edge.

**Cara 1: plugin Claude Code** (skill dan hook langsung terpasang)

```
/plugin marketplace add albasithabs/pulupulu
/plugin install pulupulu@pulupulu
```

**Cara 2: installer** (pilih sendiri mau pakai hook atau tidak)

```bash
npx github:albasithabs/pulupulu install            # proyek ini saja
npx github:albasithabs/pulupulu install --global   # semua proyek
npx github:albasithabs/pulupulu install --hook     # plus hook pengecek edit
```

Tambahkan `--agents` supaya Codex, Cursor, atau Gemini ikut membaca Pulupulu lewat `AGENTS.md`.

**Cara 3: manual**

```bash
git clone https://github.com/albasithabs/pulupulu
node pulupulu/skills/pulupulu/scripts/pulupulu.mjs install --global
```

Setelah instalasi, buka sesi Claude Code baru lalu ketik `/pulupulu`.

## Cara pakai

```
/pulupulu                      saran 2-3 langkah berikutnya untuk proyek ini
/pulupulu init                 tulis PRODUCT.md (siapa penggunanya, untuk apa)
/pulupulu build landing page   bangun halaman baru dari nol sampai lolos gate
/pulupulu audit                laporan bernomor, kamu pilih nomor mana yang diperbaiki
/pulupulu polish checkout      rapikan sebelum rilis
/pulupulu typeset              benahi font dan hierarki teks
```

Permintaan biasa tanpa perintah ("bikin halaman harga") juga tetap mengikuti aturan Pulupulu.

**Mode During / After.** Perintah membangun (`build`, `polish`, dll.) otomatis memakai mode *During*: aturan diterapkan sambil bekerja. Perintah menilai (`audit`, `critique`, `detect`) otomatis memakai mode *After*: Claude hanya membuat laporan dan baru mengubah file setelah kamu memilih nomor temuannya. Pulupulu hanya bertanya kalau modenya benar-benar tidak jelas.

## Detektor dari terminal

```bash
node skills/pulupulu/scripts/pulupulu.mjs detect src/
node skills/pulupulu/scripts/pulupulu.mjs detect --json src/ > temuan.json
node skills/pulupulu/scripts/pulupulu.mjs detect http://localhost:5173
node skills/pulupulu/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots index.html
node skills/pulupulu/scripts/pulupulu.mjs rules
node skills/pulupulu/scripts/pulupulu.mjs contrast "#6b7280" "#ffffff"
```

Kode keluar: `0` bersih, `2` ada temuan, `1` ada target yang gagal diperiksa. Jadi bisa langsung dipakai di CI.

## Pengaturan per proyek

Buat `.pulupulu.json` (perintah `pulupulu init-config`):

```json
{
  "ignoreRules": ["section-numbers"],
  "ignoreFiles": ["src/legacy/**"],
  "allow": { "fonts": ["Poppins"] },
  "severity": { "pure-black": "medium" },
  "hook": { "enabled": true, "blockOn": "high" }
}
```

- `allow.fonts`: font brand yang memang dipilih dengan sengaja, supaya tidak ditandai sebagai font pasaran.
- `hook.blockOn`: `high` (default), `medium`, atau `never`.
- `.pulupulu.local.json` untuk pengaturan di komputer sendiri (tidak ikut commit).

Kalau satu temuan memang disengaja, tulis alasannya langsung di file:

```html
<!-- pulupulu-disable-next-line overused-font: font brand sesuai DESIGN.md -->
```

## Keterbatasan

- Detektor statis membaca teks kode, tidak menjalankannya. Warna yang dihitung saat runtime atau yang berasal dari variabel CSS lintas file bisa terlewat. Untuk itu ada cek browser.
- Lolos detektor itu bukti, bukan jaminan. Tampilan tetap harus dilihat langsung di desktop dan HP.
- Hook baru jalan di Claude Code. Agent lain cukup memakai skill dan perintah `detect`.
- Cek browser tidak dipakai di production. Arahkan ke localhost atau file lokal.

## Kredit dan lisensi

Pulupulu dibangun di atas [antislop](https://github.com/miqdadbadjuber/anti-slop) karya Miqdad Badjuber (MIT) dan [Impeccable](https://github.com/pbakaus/impeccable) karya Paul Bakaus (Apache-2.0). Rinciannya ada di [NOTICE](NOTICE).

Lisensi: Apache-2.0.
