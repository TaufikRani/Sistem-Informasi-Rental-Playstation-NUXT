# Revisi — Sistem Informasi Rental PS

Tanggal: 2026-08-08

---

## 1. Validasi Delete — Referential Integrity

**Masalah**: Semua endpoint delete langsung menghapus tanpa cek constraint. Data master yang sedang dipakai transaksi bisa dihapus.

**Perubahan**: Setiap endpoint delete kini melakukan pengecekan sebelum hapus.

| Endpoint | Cek Sebelum Hapus | Pesan Error |
|----------|-------------------|-------------|
| `/api/rooms/[id]` | Ada PS/TV/stick assigned, atau transaksi `active` | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/playstations/[id]` | Status `in_use`/`rented`, atau rental `waiting_return` | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/televisions/[id]` | Status `in_use` | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/controllers/[id]` | Status `in_use`/`rented`, atau rental `waiting_return` (pakai `FIND_IN_SET`) | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/customers/[id]` | Transaksi `active`/`waiting_return` | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/products/[id]` | Stock > 0, atau ada di transaction_details transaksi non-cancelled | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/play-rates/[id]` | Room dengan playRateId ini punya transaksi `active` | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/rental-packages/[id]` | Rental `waiting_return` dengan packageId ini | *Data ini sedang digunakan. Tidak dapat dihapus.* |
| `/api/users/[id]` | Tidak bisa hapus akun sendiri | *Tidak dapat menghapus akun sendiri* |

---

## 2. Role — Hanya Admin

**Masalah**: Sistem sebelumnya memiliki 2 role (admin & cashier) padahal analoginya admin = kasir.

**Perubahan**:
- `USER_ROLES` di schema hanya `['admin']`
- Fungsi `requireAdmin()` dihapus dari `server/utils/session.ts` — semua endpoint pakai `requireUser()`
- Halaman users: role di-hardcode `admin`, tidak bisa pilih role lain
- `UserMenu.vue`: selalu tampil "Administrator"
- Seed: hanya 1 user `admin/admin123`
- `types/auth.d.ts`: `role: 'admin'`

---

## 3. Paket Rental — Decimal & Proyeksi Jam

**Masalah**: Durasi paket hanya integer (1, 3, 7 hari), tidak support 12 jam atau 1.5 hari.

**Perubahan**:
- Kolom `rental_packages.duration_days`: `int` → `decimal(6,1)` dengan default `'1'`
- Validasi API: `durationDays >= 0.5 && durationDays <= 365`
- Halaman paket rental: input `step="0.5" min="0.5"`, tampil `"X hari (Y jam)"`
- Due date rental dihitung via milisecond: `dueDate.getTime() + durationDays * 24 * 3600 * 1000`
- Seed: `durationDays: '3'` (string decimal)

---

## 4. Relasi Room — Play Rate

**Masalah**: Room punya `roomType` (reguler/vip/premium) dan `play_rates` juga punya `roomType`. Duplikasi dan membingungkan. Relasi loose via string matching.

**Perubahan**:
- Kolom `rooms.room_type` dihapus
- Kolom `play_rates.room_type` dihapus
- `rooms` dapat kolom `play_rate_id` (FK ke `play_rates.id`, nullable)
- `play_rates` jadi murni nama + harga: `name`, `hourlyRate`, `isActive`
- Room di-assign ke tarif tertentu di halaman Set Room
- API rooms: GET join `playRateName`, PUT support `playRateId` partial update
- API play-rates: hapus validasi `roomType`, integrity check pakai `rooms.playRateId`
- `main/index.post.ts`: rate lookup via `eq(playRates.id, room.playRateId)`
- `main/[id]/finish.post.ts`: re-fetch rate terbaru dari DB saat selesai (harga selalu fresh)
- Halaman rooms: hapus kolom "Jenis"
- Halaman play-rates: hapus kolom "Jenis Room"
- Halaman Set Room: dropdown tarif per room (nama + harga/jam)
- Halaman Main: `rateLabel` langsung dari `playRateId` room

---

## 5. Set Room — Halaman Manajemen Perangkat & Tarif

**Fitur baru**: Halaman `/set-room` untuk mengatur komposisi perangkat dan tarif setiap room.

- Grid card per room menampilkan: PS, TV, Stick yang ter-assign
- Dropdown untuk reassign device antar room atau lepas
- Dropdown tarif (play rate) per room
- Section "Tanpa Room" untuk device yang belum di-assign
- API: `PUT /api/devices/{type}/{id}/assign` — pindahkan device ke room
- API: `PUT /api/rooms/[id]` — partial update (termasuk `playRateId`)
- PS & controller GET API kini menyertakan `roomName` via subquery

---

## 6. Denda CRUD — Master Data

**Masalah**: Sebelumnya cuma single-row global (`penalty_rates` dengan `hourly_penalty`). Tidak bisa punya beberapa jenis denda.

**Perubahan**:

**Schema** (`penalty_rates`):
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | int PK | |
| `name` | varchar(100) | Nama denda |
| `type` | varchar(20) | `hourly` / `daily` / `fixed` |
| `amount` | decimal(12,0) | Tarif |
| `is_active` | boolean | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | on update |

- API CRUD lengkap: `GET/POST /api/penalty-rates`, `PUT/DELETE /api/penalty-rates/[id]`
- Halaman `/master/penalty-rates` dengan tabel + modal create/edit
- Return rental: cari rate aktif pertama dengan `type='hourly'`
- Halaman rental detail: fetch dari `/api/penalty-rates`, filter client-side
- File lama `/api/penalty-rate/` dan `/master/penalty-rate.vue` dihapus

---

## 7. Multi-Stick Rental

**Masalah**: Rental hanya bisa 1 stick. Realitanya pelanggan bawa 2+ stick.

**Perubahan**:
- Kolom `rentals.controller_id`: `int` → `varchar(255)` (simpan comma-separated IDs: `"1,2,3"`)
- Form rental: ganti single select jadi dropdown searchable + tag (pilih stick → muncul tag, bisa remove)
- POST rental: validasi semua stick ready, set semua status `rented` via `inArray`
- Return/cancel: split `controllerId`, release semua dengan `inArray`
- Detail rental: fetch semua controller, tampilkan list nama
- Delete controller: cek `FIND_IN_SET(id, controller_id)` di rental `waiting_return`

---

## 8. Harga Selalu Fresh Saat Selesai Main

**Masalah**: Ganti tarif saat room dipakai, tapi hitungan final tetap pakai harga lama.

**Perubahan**: `main/[id]/finish.post.ts` — saat selesai, re-fetch rate dari `play_rates` via `room.playRateId`. `unitPrice` di `transaction_details` di-update ke harga terbaru.

---

## 9. Urutan Data

**Masalah**: Data transaksi selesai tidak muncul paling atas. Master data juga diurutkan alfabetis.

**Perubahan sorting**:

| Resource | Sorting | Alasan |
|----------|---------|--------|
| Transaksi | `updatedAt DESC` | Transaksi selesai → auto naik ke atas |
| Room | `id ASC` | Stabil, tidak geser di Set Room & Main |
| PS, TV, Stick | `updatedAt DESC` | Terbaru di-edit paling atas |
| Customer, Produk | `updatedAt DESC` | Terbaru paling atas |
| Tarif Main | `id DESC` | Tarif baru paling atas |
| Paket Rental | `id DESC` | Paket baru paling atas |
| Master Denda | `updatedAt DESC` | Terbaru paling atas |
| Pengguna | `updatedAt DESC` | Terbaru paling atas |

---

## 10. Label Room di Form Rental

**Masalah**: Dropdown PS & stick di form rental tidak menunjukkan room mana.

**Perubahan**:
- API `/api/playstations` & `/api/controllers`: tambah subquery `roomName`
- Form rental: label opsi PS & stick kini `"PS-001 — PS4 Slim (Room 1)"` / `"(Tanpa Room)"`

---

## 11. ConfirmModal @confirm Handler

**Masalah**: Tombol "Hapus" di ConfirmModal emit event `confirm` tapi tidak ada `@confirm="onDelete"` di 10 halaman master. Tombol hapus tidak berfungsi.

**Perubahan**:
- Semua ConfirmModal di 10 halaman master kini punya `@confirm="onDelete"`
- `useCrud.ts` deleteItem: toast error saat gagal (tidak silent)
- Seluruh `onDelete`: cek return value, modal hanya close saat sukses

---

## 12. Delete Protection — Lepas dari Room

**Masalah**: TV/PS/Stick yang di-assign ke room (ready, bukan occupied) tetap bisa dihapus.

**Perubahan**:
- TV, PS, Stick: tidak bisa dihapus jika `roomId` tidak null — pesan *"Lepas dari room terlebih dahulu sebelum menghapus."*
- Tarif Main: tidak bisa dihapus jika ada room dengan `playRateId` ini
- Denda: tidak bisa dihapus jika ada rental `waiting_return`

---

## 13. Auto-Generate Kode Aset & Produk

**Masalah**: Kode aset (PS-xxx, TV-xxx, STK-xx) dan kode produk (PDT-xxx) diinput manual.

**Perubahan**:

Backend POST endpoint auto-generate jika field kosong:
- `PS-` + 3 digit (PlayStation)
- `TV-` + 3 digit (TV)
- `STK-` + 2 digit (Stick)
- `PDT-` + 3 digit (Produk)

Frontend:
- PS, TV, Produk: field kode tetap ada, optional, placeholder "Kosongkan untuk auto-generate"
- Stick: field kode dihapus (full auto)

---

## 14. Clean Seed & Migration Consistency

**Masalah**:
- 3 perubahan schema diterapkan via direct SQL tanpa tercatat di file migration (room_type removal, rentals varchar)
- Seed tidak idempotent — duplicate key error saat re-run
- Schema default `users.role` masih `'cashier'`
- Login page tampil 2 akun demo padahal cuma 1 role

**Perubahan**:
- `users.role` default: `'cashier'` → `'admin'` di schema.ts
- Migration `0002_curved_moon_knight.sql` — cover 4 perubahan manual:
  - `rooms` drop `room_type`, add `play_rate_id`
  - `play_rates` drop `room_type`
  - `rentals.controller_id` int → varchar(255)
- Seed rewrite: truncate **semua** tabel → fresh insert berurutan
- Seed data: 1 user, 5 room, 5 PS, 5 TV, 10 stick, 3 play rate, 3 paket, 1 denda, 3 customer, 8 produk
- Login page: hapus button demo `kasir / kasir123`

---

## Migration

Tiga migration manual di-apply ke DB:

1. `0001_thin_red_shift.sql` — restructure `penalty_rates`, alter `rental_packages.duration_days` ke decimal
2. `0002` (direct SQL) — `rooms` drop `room_type` + add `play_rate_id`, `play_rates` drop `room_type`
3. `0003` (direct SQL) — `rentals.controller_id` int → varchar(255)

---

## Status Akhir

Semua perubahan sudah di-build (`pnpm build` sukses) dan siap digunakan. Jalankan `pnpm dev` untuk uji manual, `pnpm db:seed` untuk reset data (jalankan setelah migrasi).
