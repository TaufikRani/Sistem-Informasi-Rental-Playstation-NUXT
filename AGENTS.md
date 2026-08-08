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

- Seed: truncate semua tabel → fresh insert. Login: `admin` / `admin123` (role admin). Hanya 1 role — Admin.
- Docker (produksi): `docker compose up -d --build`. Startup app (`scripts/start.sh` → `wait-db.mjs` → `seed-if-empty.mjs`) otomatis migrate+seed **hanya** jika tabel `users` belum ada (DB fresh) atau kosong — dicek via `SHOW TABLES LIKE 'users'` dulu, **jangan** query `users` langsung karena akan crash loop (ER_NO_SUCH_TABLE) saat DB kosong. Reset total: `docker compose down -v && docker compose up -d --build`.
- Tidak ada script lint/typecheck/test.

## Tech Stack

- Nuxt 4 (mode kompatibilitas v3 via `future.compatibilityVersion: 3` — struktur proyek tetap ala Nuxt 3: `pages/`, `server/` di root) + TypeScript (fullstack monolith)
- @nuxt/ui v4 (komponen UI; layout dashboard via `UDashboardPanel`/`UDashboardNavbar`/`UDashboardSidebar`/`UDashboardToolbar`/`UDashboardSidebarCollapse`/`UDashboardSearch`, ikon `i-lucide-*` via @iconify-json/lucide)
- nuxt-auth-utils (session auth)
- Drizzle ORM + MySQL (mysql2)
- exceljs (export laporan Excel)
- Package manager: **pnpm**

## Struktur

```
pages/            halaman aplikasi (login, main, rental, set-room, master/*, transactions, stok, reports, struk)
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
- Semua handler diawali `await requireUser(event)`. (Hanya 1 role: Admin.)
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
- Struktur halaman: `<UDashboardPanel id="...">` + slot `#header` (berisi `UDashboardNavbar title="..."` dengan `UDashboardSidebarCollapse` di `#leading` dan aksi di `#right`, lalu `UDashboardToolbar`) + slot `#body`. Layout `default.vue` menyediakan sidebar global (BrandMenu, UserMenu, DashboardSearch).
- Gunakan komponen @nuxt/ui: `UCard`, `UButton`, `UBadge`, `UInput`, `USelect`, `UFormField`, `UAlert`, `UModal`, `UTable`, `UIcon` (ikon `i-lucide-*`).
- **@nuxt/ui v4**: kolom `UTable` pakai `{ accessorKey, header }`, slot dinamis `` `${column.id}-cell` `` (mis. `#actions-cell`); **tidak ada `$confirm`** — konfirmasi via komponen `components/ConfirmModal.vue` (pakai `confirm()` native atau `window.confirm`); sukses via notifikasi `useToast`, error ditampilkan lewat `UAlert` di dalam modal; tombol reset radio pakai `native` (dihapus) + slot `#input` (reset via `form.xxx = null`).
- Tema: color mode via `useColorMode` (Terang/Gelap/Sistem) di menu pengguna; timer sesi main di `pages/main/[id].vue` & kartu room di `pages/main/index.vue` berjalan live tiap detik dan dihitung dari `startedAt` server (persisten walau di-refresh).
- CRUD master data via `composables/useCrud(endpoint)` (menyediakan `items`, `loading`, `saving`, `error`, `fetchItems`, `createItem`, `updateItem`, `deleteItem`; memakai `useToast`).
- Fetch data: `useFetch` untuk GET, `$fetch` untuk mutasi; error API dibaca `e?.data?.statusMessage` (selalu fallback pesan Bahasa Indonesia).
- Halaman transaksi opsional: `pages/main/[id].vue` & `pages/rental/[id].vue` (satu kolom dengan info card + daftar item + tombol aksi), `pages/struk/[id].vue` (layout `auth.vue`, ukuran kertas 58mm via CSS `@page`).
- Format uang via `formatRupiah`, label status via map di `utils/format.ts` (mis. `ROOM_STATUS_LABEL`, `TRANSACTION_STATUS_LABEL`), warna badge via `statusColor`.
- Respons API acuan: `/api/dashboard/stats` → `{ rooms, mainActive, rentalActive, today:{revenue,count,productsSold}, monthRevenue, lowStock, activeMains, activeRentals, lateReturns, playstations, controllers }`; `/api/transactions?type=&status=&from=&to=` (daftar semua transaksi, diurutkan `updatedAt DESC`); `/api/transactions/rental?status=active|waiting_return|completed|all`; `/api/reports/revenue?type=day|month|year&date=` → `{ revenue:{main,rental,product,penalty,total}, main:{count,totalHours,total}, rental:{active,completed,lateCount,penalty}, products, transactions }`; `/api/penalty-rates` (CRUD master denda); `/api/devices/{type}/{id}/assign` (pindahkan device ke room).

## Business Rules (dari PRD)

- **Invoice**: `PS-YYYYMMDD-0001`, dibuat otomatis via `generateInvoiceNumber` (`server/utils/invoice.ts`).
- **Struktur transaksi**: header `transactions` + detail `transaction_details` dengan `item_type`: `MAIN`, `RENTAL`, `PRODUCT`, `SERVICE`, `PENALTY`.
- **Main di Tempat**: Mulai Main → room `occupied`, asset room `in_use`; selama sesi boleh tambah produk; Selesai → durasi di-ceil per jam × tarif (re-fetch rate terbaru dari `play_rates` via `room.playRateId`), stok produk OUT, room/asset kembali `ready`.
- **Rental**: buat rental → status transaksi `waiting_return`, PS/stick `rented` (multi-stick via `controllerIds[]`, disimpan sebagai comma-separated di `rentals.controller_id`); saat pengembalian → denda = `ceil(lateHours) × tariff_denda_aktif` ditambahkan sebagai item `PENALTY`; selesai → PS/stick `ready`.
- **Diskon**: `nominal` atau `percent`, hanya sebelum transaksi selesai.
- **Pembayaran**: metode `cash` / `transfer` / `qris` (pencatatan saja); `amountPaid` minimal `grandTotal`, kembalian dihitung otomatis.
- **Stok**: berkurang saat transaksi selesai (OUT) + tercatat di `stock_movements` (`IN` / `OUT` / `CORRECTION`) dengan reference invoice.
- **Referential Integrity**: semua endpoint delete mengecek constraint sebelum menghapus (data yang sedang digunakan tidak bisa dihapus). Device yang ter-assign ke room harus dilepas dulu di Set Room. Pesan error: *"Data ini sedang digunakan. Tidak dapat dihapus."* atau *"Lepas dari room terlebih dahulu sebelum menghapus."*
- **Partial Update**: endpoint PUT rooms mendukung partial update — field yang tidak dikirim akan fallback ke nilai existing.
- **Auto-Generate Kode**: asset code (PS/TV/Stick) dan product code auto-generate jika dikosongkan. Prefix: `PS-`, `TV-`, `STK-`, `PDT-` dengan padding 2-3 digit. Backend POST endpoint mencari kode tertinggi via LIKE query lalu increment +1.
- **ConfirmModal**: komponen `components/ConfirmModal.vue` menggunakan emit `confirm` — setiap pemakaian wajib tambah `@confirm="onDelete"` di tag `<ConfirmModal>`.
- **Sorting**: transaksi `updatedAt DESC` (selesai → naik ke atas). Room `id ASC` (stabil). Master data lainnya `updatedAt DESC` atau `id DESC`.

## Verifikasi

Tidak ada lint/typecheck/test script. Validasi perubahan via `pnpm build` (atau `pnpm dev` untuk uji manual).
