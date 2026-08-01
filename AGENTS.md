# AGENTS.md

## Gambaran Proyek

Sistem Informasi Rental PlayStation (PS Rental Management System) — aplikasi web untuk operasional rental PS: Main di Tempat, Rental PS, penjualan produk tambahan, manajemen stok & perangkat, dan laporan.

Referensi utama: **PRD.md** (source of truth untuk modul, alur, dan perhitungan).

Out of scope: payment gateway, booking online, mobile app, membership.

## Perintah

```bash
pnpm dev            # development server (http://localhost:3000)
pnpm build          # production build
pnpm generate       # static generation
pnpm preview        # preview production build
pnpm db:generate    # drizzle-kit generate (dari server/db/schema.ts)
pnpm db:migrate     # drizzle-kit migrate
pnpm db:seed        # seed data (tsx server/db/seed.ts)
```

- Seed: login `admin` / `admin123` (role admin) dan `kasir` / `kasir123` (role cashier).
- Tidak ada script lint/typecheck/test.

## Tech Stack

- Nuxt 3 + TypeScript (fullstack monolith)
- @nuxt/ui v3 (komponen UI) + @iconify-json/lucide (ikon `i-lucide-*`)
- nuxt-auth-utils (session auth)
- Drizzle ORM + MySQL (mysql2)
- exceljs (export laporan Excel)
- Package manager: **pnpm**

## Struktur

```
pages/            halaman aplikasi (login, main, rental, master/*, transactions, stok, reports, struk)
layouts/          auth.vue, default.vue
components/       komponen UI (jika dibuat, komponen client)
composables/      useCrud.ts (CRUD generic untuk master data)
middleware/       auth.global.ts (redirect ke /login jika belum login)
server/api/       REST API file-based
server/db/        schema.ts, seed.ts, migrations/
server/utils/     useDb, requireUser, generateInvoiceNumber, setRoomAssetsStatus (auto-import)
utils/            format.ts (formatRupiah, label map, statusColor) (auto-import)
types/            deklarasi tipe global
public/           aset statis
```

## Konvensi Server API

- Pola route: `server/api/<resource>/index.get.ts`, `index.post.ts`, `[id].put.ts`, `[id].delete.ts`.
- Semua handler diawali `await requireUser(event)`. Endpoint khusus admin pakai `requireAdmin(event)`.
- Error dikirim via `throw createError({ statusCode, statusMessage })` dengan statusMessage **Bahasa Indonesia** (mis. `'Room sedang tidak tersedia'`).
- Body di-parse via `readBody(event)`, param route via `getRouterParam(event, 'id')`, DB via `useDb()` (auto-import dari `server/utils/db.ts`).
- Endpoint transaksi membalas `{ id, invoiceNumber }` (dan field tambahan seperti `grandTotal`, `changeAmount`).

## Konvensi Database

- Schema tunggal di `server/db/schema.ts`; kolom DB `snake_case`, field TypeScript `camelCase`.
- Enum status/tipe sebagai konstanta + tipe literal (mis. `ROOM_STATUS`, `ASSET_STATUS`, `TRANSACTION_STATUS`, `ITEM_TYPES`, `STOCK_MOVEMENT_TYPES`).
- Uang disimpan sebagai **string decimal** MySQL (`decimal`), diproses dengan `String(x)` dan dibulatkan `Math.round`.
- `timestamp` mode `'date'` (Date JS); `created_at`/`updated_at` default `defaultNow()`.
- Alur ubah schema: `pnpm db:generate && pnpm db:migrate`.

## Konvensi Frontend

- UI dan pesan **Bahasa Indonesia**.
- Gunakan komponen @nuxt/ui: `UCard`, `UButton`, `UBadge`, `UInput`, `USelect`, `UIcon` (ikon `i-lucide-*`).
- CRUD master data via `composables/useCrud(endpoint)` (menyediakan `items`, `loading`, `saving`, `error`, `fetchItems`, `createItem`, `updateItem`, `deleteItem`).
- Format uang via `formatRupiah`, label status via map di `utils/format.ts` (mis. `ROOM_STATUS_LABEL`, `TRANSACTION_STATUS_LABEL`), warna badge via `statusColor`.

## Business Rules (dari PRD)

- **Invoice**: `PS-YYYYMMDD-0001`, dibuat otomatis via `generateInvoiceNumber` (`server/utils/invoice.ts`).
- **Struktur transaksi**: header `transactions` + detail `transaction_details` dengan `item_type`: `MAIN`, `RENTAL`, `PRODUCT`, `SERVICE`, `PENALTY`.
- **Main di Tempat**: Mulai Main → room `occupied`, asset room `in_use`; selama sesi boleh tambah produk; Selesai → durasi di-ceil per jam × tarif, stok produk OUT, room/asset kembali `ready`.
- **Rental**: buat rental → status transaksi `waiting_return`, PS/stick `rented`; saat pengembalian → denda = `ceil(lateHours) × hourly_penalty` ditambahkan sebagai item `PENALTY`; selesai → PS/stick `ready`.
- **Diskon**: `nominal` atau `percent`, hanya sebelum transaksi selesai.
- **Pembayaran**: metode `cash` / `transfer` / `qris` (pencatatan saja); `amountPaid` minimal `grandTotal`, kembalian dihitung otomatis.
- **Stok**: berkurang saat transaksi selesai (OUT) + tercatat di `stock_movements` (`IN` / `OUT` / `CORRECTION`) dengan reference invoice.

## Verifikasi

Tidak ada lint/typecheck/test script. Validasi perubahan via `pnpm build` (atau `pnpm dev` untuk uji manual).
