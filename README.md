# Git Visualizer

Visualisasi riwayat Git dari JSON yang diimpor pengguna. Tidak membuat riwayat commit atau branch fiktif.

## Fitur

- Graf commit dengan seluruh hubungan parent, branch, dan merge.
- Detail hash, pesan, author, waktu, dan parent.
- Filter ancestry branch, pencarian, zoom, dan navigasi gulir.
- Eksportir Node.js untuk repository Git lokal yang dapat Anda akses; tidak mengunggah riwayat.
- Import/export JSON versi 1; maksimal 5.000 commit, parent di luar batas data ditandai.

## Teknologi

React 19, TypeScript, Vite, Vitest. Git diperlukan hanya untuk eksportir lokal.

## Cara menjalankan

Memerlukan Node.js 22.12+.

```sh
npm ci
npm run dev
```

Buka alamat yang dicetak terminal. Jalankan `npm test` untuk pengujian dan `npm run build` untuk build produksi.
