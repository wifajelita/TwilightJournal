# TwilightJournal ✦ (Enhanced)

Cosmic-themed personal journal web app — cocok untuk GitHub Pages.

## Fitur Baru

- **Prompt Journaling** — 20+ prompt siap pakai
- **Statistik** — total entri, streak, mood chart, insight
- **Manfaat Journaling** — edukasi + tips
- **Target Harian** — progress bar + bisa atur target (1–10 entri/hari)
- **Background Music** — autoplay lagu 1, bisa ganti ke lagu 2 atau 3
- Quote inspiratif acak di halaman awal
- Search, filter mood, export/import JSON

## Struktur Folder

```
TwilightJournal/
├── index.html
├── styles.css
├── script.js
├── sample-data.json
├── README.md
└── audio/
    ├── track1.mp3   ← lagu default (autoplay)
    ├── track2.mp3
    └── track3.mp3
```

## Cara Pasang Musik

1. Masukkan 3 file MP3 ke folder `audio/`
2. Rename menjadi:
   - `track1.mp3` (akan diputar otomatis saat buka app)
   - `track2.mp3`
   - `track3.mp3`
3. Buka `index.html` — musik akan mencoba autoplay.
   (Beberapa browser memblokir autoplay sampai ada interaksi klik/keyboard pertama.)

## Deploy GitHub Pages

Upload semua file (termasuk folder `audio/`) ke repo, lalu aktifkan Pages dari branch `main`.

---

Dibuat dengan ✨ untuk perjalananmu di antara bintang.
