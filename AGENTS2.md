# AGENTS2.md

## Tugas

Membantu menulis **skripsi** berjudul (usulan): *Sistem Informasi Rental PlayStation Berbasis Web* — berangkat dari proyek nyata di repo ini (`Sistem-Informasi-Rental-PS`).

Output berupa dokumen **Markdown per-bab** di folder `skripsi/`:

```
skripsi/
├── BAB 1.md
├── BAB 2.md
├── BAB 3.md
├── BAB 4.md
├── BAB 5.md
└── daftar-pustaka.md
```

Bab dibuat satu per satu, hanya atas permintaan user (bukan sekaligus).

---

## Sumber Otoritas (hierarki)

1. **`PRD.md`** — fakta bisnis & sistem: latar belakang, tujuan, ruang lingkup, modul, alur transaksi, perhitungan biaya, struktur data. Ini acuan utama untuk isi BAB 1–3.
2. **Kode proyek** (schema `server/db/schema.ts`, `server/api/`, `pages/`, seed, docker-compose) — fakta implementasi untuk BAB 3 & 4. Cek file bila ragu; jangan menuliskan fakta teknis yang tidak ada di kode.
3. **`AGENTS.md`** — konvensi proyek (stack, struktur, business rules) sebagai ringkasan implementasi yang sah untuk dikutip.
4. **Referensi yang diberikan user** (file, URL, atau teks) — **satu-satunya sumber daftar pustaka**. Dilarang keras mengarang sitasi, buku, jurnal, atau URL yang tidak user berikan.

---

## Aturan Penulisan

### Bahasa & Gaya

- Bahasa Indonesia baku, formal, akademik (EYD).
- Kalimat pasif objektif (mis. "Sistem dirancang untuk…"), **tanpa** kata ganti orang pertama ("saya", "kami", "penulis" — gunakan "penelitian ini"/"sistem").
- Paragraf minimal 3 kalimat; satu ide utama per paragraf.
- Istilah teknis pertama kali ditulis lengkap dengan singkatannya (mis. "Entity Relationship Diagram (ERD)").
- Konsisten: "main di tempat" (huruf kecil, bukan "Main di Tempat" di dalam kalimat), "PlayStation" dengan kapitalisasi konsisten, angka Rp pakai format `Rp50.000` tanpa spasi.
- Bilangan: kata untuk satu–sembilan dalam kalimat naratif, angka untuk tabel/statistik.
- Gunakan tabel Markdown untuk perbandingan, kutipan rujukan pakai `> ` hanya bila benar-benar verbatim.

### Sitasi

- Gaya **APA** in-text: `(Nama, Tahun)` atau `Nama (Tahun)`.
- Setiap sitasi **wajib** muncul di `daftar-pustaka.md`; setiap entri daftar pustaka **wajib** dikutip minimal satu kali di teks.
- Referensi yang dibutuhkan tapi belum disediakan user: tulis placeholder `[REF: <deskripsi singkat, mis. buku basis data tahun 2023>]` di akhir paragraf — JANGAN menggantinya dengan referensi karangan.
- Jangan menyalin teks sumber secara verbatim tanpa ditulis ulang (parafrase).

### Integritas

- Fakta teknis (stack, fitur, perhitungan, struktur DB) harus sesuai kode/PRD. Bila ragu, periksa file proyek terlebih dahulu.
- Jangan menulis angka klaim hasil pengujian/laporan yang tidak pernah dijalankan; gunakan `[DATA: <deskripsi hasil yang diharapkan>]` sebagai placeholder sampai user mengisi data nyata.
- Nomor urut, label gambar/tabel ("Gambar 3.1", "Tabel 4.2") mengikuti aturan penomoran kampus user bila disampaikan; default: angka bab.tabel.

---

## Struktur BAB 1 (Pendahuluan)

Saat user meminta generate `BAB 1.md` (dengan atau tanpa referensi), susun sub-bab ini, sumber dalam kurung:

1. **1.1 Latar Belakang** — dari PRD §1 (masalah pencatatan manual: salah hitung durasi/biaya/status perangkat, laporan sulit) + PRD §2 (tujuan sistem) + posisikan solusi web. Kutip literatur pendukung dari referensi user bila ada (dasar teori teknologi/method).
2. **1.2 Rumusan Masalah** — derived dari latar belakang, dirumuskan sebagai pertanyaan (mis. "Bagaimana merancang sistem…?"), 3–5 butir.
3. **1.3 Batasan Masalah** — dari PRD §3: ruang lingkup (modul yang ada) + out of scope (payment gateway, booking online, mobile app, membership, pembayaran otomatis). Tambahkan batasan teknis nyata dari kode (mis. multi-user admin/kasir, web responsive desktop & tablet, DB MySQL).
4. **1.4 Tujuan Penelitian** — memetakan satu-per-satu ke rumusan masalah, dari PRD §2.
5. **1.5 Manfaat Penelitian** — manfaat praktis (pemilik/kasir: akurasi perhitungan, laporan otomatis, kontrol stok/perangkat) + manfaat akademis.
6. **1.6 Sistematika Penulisan** — deskripsi singkat tiap bab (BAB 1–5).

---

## Struktur Daftar Pustaka

- Format **APA** (`Penulis, Inisial. (Tahun). *Judul*. Penerbit/Kota` atau `*Judul*. (Tahun). URL` untuk sumber daring).
- Urut **alfabetis** oleh nama belakang penulis; beri baris kosong antar entri.
- Hanya berisi referensi yang benar-benar dikutip di BAB 1 (dan bab lain yang sudah ada).
- Jika ada referensi bahasa asing, pertahankan aslinya; jangan terjemahkan judul.

---

## Alur Kerja Generate

1. Tunggu/terima referensi dari user (file di `skripsi/ref/`, URL, atau tempel teks). Catat dulu semua referensi yang valid.
2. Baca `PRD.md` dan (bila perlu) file kode terkait untuk fakta sistem.
3. Tulis `skripsi/BAB 1.md` sesuai struktur di atas, sitasi APA, placeholder `[REF: …]` bila ada rujukan yang belum disediakan.
4. Tulis `skripsi/daftar-pustaka.md` berisi semua referensi yang benar-benar dikutip di BAB 1.
5. Verifikasi: cek setiap sitasi in-text punya entri daftar pustaka dan setiap entri daftar pustaka dipakai; periksa ejaan/format.

---

## Verifikasi

- Tidak ada lint/script khusus. Validasi konten: periksa konsistensi sitasi (BAB ↔ daftar pustaka), konsistensi istilah, dan kehadiran placeholder untuk data/referensi yang belum ada.
- Sebelum menyerahkan hasil, lakukan pembacaan ulang file untuk menangkap typo/format Markdown yang rusak.
