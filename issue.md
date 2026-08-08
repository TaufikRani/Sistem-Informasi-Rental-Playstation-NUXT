# Issue Tracker — Sistem Informasi Rental PS

## Progress

| # | Issue | Status | Keterangan |
|---|-------|--------|------------|
| 1 | Validasi delete (referential integrity) | ✅ Selesai | Semua endpoint delete cek constraint sebelum hapus |
| 2 | Role: hanya Admin | ✅ Selesai | Hapus role cashier, semua endpoint pakai requireUser |
| 3 | Paket Rental decimal + proyeksi jam | ✅ Selesai | durationDays → decimal, tampil hari & jam |
| 4 | Set Room — manajemen device per room | ✅ Selesai | Halaman /set-room dengan card per device + reassign select |
| 5 | Denda CRUD — master data denda | ✅ Selesai | Tabel penalty_rates jadi CRUD dengan name/type/amount |
| 6 | Build & verifikasi | ✅ Selesai | `pnpm build` sukses, `pnpm db:migrate` + DB direct |

---

## 1. Validasi Delete — Referential Integrity

### Masalah
Semua endpoint delete langsung hapus tanpa cek constraint. Data master yang sedang dipakai transaksi bisa dihapus.

### Solusi
Setiap endpoint delete cek dulu apakah data direferensi oleh data lain:

| Endpoint | Cek Sebelum Hapus |
|----------|-------------------|
| `/api/rooms/[id]` | Tidak bisa hapus jika ada PS/TV/stick assigned, atau room sedang dipakai transaksi aktif |
| `/api/playstations/[id]` | Tidak bisa hapus jika status `in_use` atau `rented` |
| `/api/televisions/[id]` | Tidak bisa hapus jika status `in_use` |
| `/api/controllers/[id]` | Tidak bisa hapus jika status `in_use` atau `rented` |
| `/api/customers/[id]` | Tidak bisa hapus jika punya transaksi aktif (`active`/`waiting_return`) |
| `/api/products/[id]` | Tidak bisa hapus jika ada di `transaction_details` transaksi non-cancelled |
| `/api/play-rates/[id]` | Tidak bisa hapus jika roomType digunakan room dengan transaksi aktif |
| `/api/rental-packages/[id]` | Tidak bisa hapus jika direferensi rental `waiting_return` |
| `/api/users/[id]` | Sudah ada guard (tidak bisa hapus diri sendiri) |

Pesan error: **"Data ini sedang digunakan. Tidak dapat dihapus."**

---

## 2. Role: Admin Saja

### Perubahan
- `USER_ROLES` tetap `['admin']` di schema (kolom role tetap ada untuk backward compat)
- Hapus fungsi `requireAdmin()` → semua pakai `requireUser()`
- Halaman users: role di-hardcode `admin`, tidak bisa pilih role lain
- `UserMenu`: selalu tampil "Administrator"
- Seed: hanya buat 1 user `admin/admin123`

---

## 3. Paket Rental — Decimal & Proyeksi Jam

### Schema
- `duration_days` dari `int` → `decimal(6,1)` (support 1.5 hari, 0.5 hari = 12 jam)

### UI
- Input lama paket menerima desimal (1.5, 0.5, dst)
- Tampil: "1.5 hari (36 jam)" — proyeksi jam otomatis
- Due date dihitung: `startDate + durationDays * 24 jam`

---

## 4. Set Room — Kanban Device

### Halaman baru: `/set-room`
- Tampilan: grid room dengan card device di dalamnya
- Setiap room menampilkan: PS, TV, Stick yang ter-assign
- Tombol reassign: pilih device → pindahkan ke room lain / lepas dari room
- Section "Tanpa Room" untuk device yang belum di-assign
- API: `PUT /api/devices/{type}/{id}/assign` dengan body `{ roomId: number | null }`

---

## 5. Denda CRUD

### Schema baru `penalty_rates`
- `id`, `name`, `type` (hourly/daily/fixed), `amount`, `isActive`, `createdAt`, `updatedAt`

### API CRUD
- `GET /api/penalty-rates` — list semua
- `POST /api/penalty-rates` — tambah
- `PUT /api/penalty-rates/[id]` — ubah
- `DELETE /api/penalty-rates/[id]` — hapus

### Integrasi
- Saat return rental: cari penalty rate aktif type `hourly` pertama
- Halaman master baru: `/master/penalty-rates`
- Hapus halaman penalty-rate single-record lama

---

## Migration Plan

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

