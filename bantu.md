# Panduan Menjalankan di Laptop Lain

Dokumen ini menjelaskan cara menjalankan Sistem Informasi Rental PS agar hasilnya **sama persis** dengan kondisi master data awal produksi.

## Prasyarat di laptop lain

- Git
- Docker (+ Docker Compose)
- Node.js 22+ dan pnpm (via corepack)

```bash
git clone git@github.com:TaufikRani/Sistem-Informasi-Rental-Playstation-NUXT.git
cd Sistem-Informasi-Rental-Playstation-NUXT
```

Ada **dua jalur** eksekusi — pilih salah satu sesuai kebutuhan:

- **Produksi via Docker** (paling setara dengan kondisi produksi).
- **Development** (Nuxt dev server + DB lokal, untuk pengembangan).

---

## Jalur 1 — Produksi via Docker

```bash
# 1. Siapkan env
cp .env.example .env
# lalu isi kredensial:
#   MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, DB_USER, DB_PASSWORD, NUXT_SESSION_PASSWORD
# (opsional) APP_PORT=8082, DB_PORT=3308

# 2. Build & jalankan
docker compose up -d --build
```

- Aplikasi: `http://localhost:8082`
- Database MySQL/MariaDB: `localhost:3308`
- Login: `admin` / `admin123`

**Alur otomatis saat start:**
`scripts/start.sh` → `scripts/wait-db.mjs` → `scripts/seed-if-empty.mjs`

Script tersebut otomatis menjalankan **migrate + seed** hanya ketika database masih **kosong/fresh** (folder migration ikut ter-copy ke image). Hasilnya master data awal yang identik.

---

## Jalur 2 — Development (nuxt dev server + DB lokal)

```bash
# 1. Install dependencies
pnpm install

# 2. Siapkan DB lokal (mis. via Docker, port 3306)
# isi DATABASE_URL di .env, contoh:
#   DATABASE_URL=mysql://root:rootpassword@127.0.0.1:3306/rental_ps

# 3. Migrate & seed (skema & master data mengikuti source)
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 4. Jalankan dev server
pnpm dev
```

- Aplikasi: `http://localhost:3000`
- Login: `admin` / `admin123`

---

## Kunci agar hasil sama antar laptop

1. **Selalu `git pull`** sampai commit terbaru di laptop lain (source sudah sinkron: migration `0000`–`0003` + seeder identik).
2. Pastikan **seed benar-benar berjalan** pada database kosong/fresh, agar master data ter-reset ke kondisi awal.
3. Gunakan **cara menjalankan yang sama** antar laptop (jangan mencampur dev-docker dengan perintah berbeda).

> Catatan: status "produksi saat ini" yang dihasilkan dari pemakaian nyata (room `occupied`, PS `in_use`, stok berkurang, customer terubah, transaksi aktif) adalah **bukan master data awal** dan otomatis ter-reset saat seed dijalankan ulang.
