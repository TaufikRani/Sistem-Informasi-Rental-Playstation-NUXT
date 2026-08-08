Berikut adalah **PRD Final** yang sudah disusun dengan pendekatan yang siap dijadikan acuan desain UI, ERD, dan implementasi backend. Dokumen ini menggunakan arsitektur transaksi yang fleksibel (Header & Detail), tanpa fitur yang tidak diperlukan seperti payment gateway, namun tetap dapat berkembang di masa depan.

# Product Requirements Document (PRD)

# Sistem Informasi Rental PlayStation (PS Rental Management System)

**Versi:** 1.0 (Final)
**Status:** Approved
**Target:** Web Application

---

# 1. Latar Belakang

Usaha rental PlayStation memiliki dua jenis layanan utama:

1. Main di Tempat
2. Rental PlayStation

Selain itu terdapat penjualan produk pendukung seperti makanan, minuman, dan layanan tambahan (misalnya tambah stik). Saat ini proses pencatatan masih dilakukan secara manual sehingga berpotensi menimbulkan kesalahan perhitungan durasi, biaya, status perangkat, serta kesulitan dalam penyusunan laporan.

Sistem ini dibangun untuk membantu operasional harian secara sederhana, cepat, dan akurat.

---

# 2. Tujuan Sistem

* Mengelola transaksi Main di Tempat.
* Mengelola transaksi Rental PlayStation.
* Menghitung biaya secara otomatis.
* Menghitung denda keterlambatan rental.
* Menjual produk tambahan dalam satu transaksi.
* Mengelola perangkat dan ruangan.
* Mengelola stok produk.
* Menyediakan laporan operasional dan pendapatan.

---

# 3. Ruang Lingkup

Sistem mencakup:

* Login Admin
* Dashboard
* Set Room
* Master Data
* Main di Tempat
* Rental PS
* Penjualan Produk
* Manajemen Stok
* Manajemen Perangkat
* Laporan

Sistem **tidak** mencakup:

* Payment Gateway
* Booking Online
* Mobile App
* Membership
* Pembayaran otomatis

Pembayaran dilakukan secara manual (Cash, Transfer, atau QRIS sebagai pencatatan metode pembayaran tanpa integrasi).

---

# 4. Role

## Admin

Hak akses:

* Login
* Mengelola master data
* Membuat transaksi
* Menambah produk
* Mengakhiri transaksi
* Mengelola rental
* Mengelola stok
* Mengelola perangkat
* Melihat laporan

Hanya ada 1 role: Admin. Analogi Admin = Kasir.

---

# 5. Modul Sistem

## Dashboard

Menampilkan informasi secara realtime.

### Ringkasan

* Room tersedia
* Room sedang digunakan
* Rental aktif
* Pendapatan hari ini
* Pendapatan bulan ini
* Produk terjual hari ini
* Jumlah transaksi hari ini

### Aktivitas

* Main yang sedang berjalan
* Rental aktif
* Pengembalian yang terlambat

---

# 6. Master Data

## Room

Field:

* Nama Room
* PlayRate (relasi ke Tarif Main)
* Status

Status:

* Ready
* Dipakai
* Maintenance

Relasi:

1 Room memiliki:
* 1 Tarif Main (playRateId)
* 1 TV
* 1 PlayStation
* Banyak Stick

Room tidak memiliki "Jenis" — klasifikasi dilakukan melalui tarif yang di-assign di Set Room.

---

## PlayStation

Field:

* Kode Aset (auto-generate: PS-001, PS-002... jika dikosongkan)
* Nama
* Seri
* Merek
* Serial Number
* Tanggal Pembelian
* Kondisi
* Status

Status:

* Ready
* Dipakai
* Rental
* Maintenance

---

## TV

Field:

* Kode Aset (auto-generate: TV-001, TV-002... jika dikosongkan)
* Nama
* Ukuran
* Serial Number
* Status

---

## Stick

Field:

* Kode Aset (auto-generate: STK-01, STK-02... full auto)
* Nomor Stick
* Kondisi
* Status

---

## Tarif Main

Field:

* Nama Tarif (contoh: "Tarif Reguler", "Tarif VIP")
* Harga Per Jam
* Status (Aktif/Nonaktif)

Tarif dipilih per Room di halaman Set Room. Tidak ada "Jenis Room" di tarif.

---

## Paket Rental

Field:

* Nama Paket
* Lama (hari, desimal — support 0.5 hari = 12 jam, 1.5 hari = 36 jam)
* Harga
* Status (Aktif/Nonaktif)

Tampil: "X hari (Y jam)" — proyeksi jam otomatis.

---

## Master Denda

Field:

* Nama Denda
* Tipe (Per Jam / Per Hari / Tetap)
* Tarif
* Status (Aktif/Nonaktif)

CRUD penuh. Saat return rental, sistem menggunakan denda aktif tipe `hourly` pertama.

---

## Produk

Kategori:

* Makanan
* Minuman
* Layanan
* Lain-lain

Field:

* Kode Produk (auto-generate: PDT-001, PDT-002... jika dikosongkan)
* Nama Produk
* Harga
* Stok
* Minimal Stok
* Status

---

# 7. Manajemen Stok

Sistem mengelola stok produk.

Fitur:

* Tambah stok
* Koreksi stok
* Riwayat stok
* Stok otomatis berkurang saat transaksi selesai

Dashboard menampilkan notifikasi apabila stok berada di bawah batas minimal.

---

# 8. Manajemen Perangkat

Setiap perangkat memiliki identitas unik.

Data:

* Kode Aset (auto-generate: PS-xxx, TV-xxx, STK-xx)
* Nama
* Serial Number
* Kondisi
* Status
* Catatan

Kebijakan hapus:

* Perangkat yang ter-assign ke room harus dilepas dulu di Set Room
* Perangkat dengan status `in_use` / `rented` tidak bisa dihapus
* Perangkat yang sedang di-rental (`waiting_return`) tidak bisa dihapus

Riwayat:

* Digunakan
* Dirental
* Maintenance

---

# 9. Transaksi Main di Tempat

## Flow

Pelanggan datang

↓

Admin memilih Room

↓

Klik **Mulai Main**

↓

Sistem mencatat:

* Room
* PS
* TV
* Stick
* Waktu Mulai

↓

Status Room menjadi Dipakai

↓

Selama bermain admin dapat menambahkan produk.

↓

Klik **Selesai**

↓

Sistem menghitung:

* Durasi
* Biaya Main
* Produk Tambahan
* Diskon
* Total Tagihan

↓

Pembayaran

↓

Transaksi selesai

↓

Status perangkat kembali Ready

---

# 10. Perhitungan Main

Durasi = Jam Selesai − Jam Mulai

Biaya Main = Durasi × Tarif

Total =

Biaya Main

*

Produk

*

Biaya Layanan

−

Diskon

---

# 11. Rental PlayStation

Perangkat yang dirental:

* PlayStation
* Stick (multiple — bisa 2 atau lebih)

TV tidak termasuk.

## Flow

Admin membuat transaksi

↓

Pilih pelanggan

↓

Pilih PS

↓

Pilih Stick

↓

Pilih Paket Rental

↓

Sistem menentukan tanggal kembali

↓

Status perangkat menjadi Rental

↓

Saat pengembalian

↓

Hitung keterlambatan

↓

Hitung denda

↓

Tambah biaya tambahan jika diperlukan

↓

Pembayaran

↓

Status perangkat kembali Ready

---

# 12. Perhitungan Rental

Total =

Harga Rental

*

Denda

*

Produk

*

Biaya Lain

−

Diskon

---

# 13. Produk Tambahan

Produk dapat ditambahkan pada:

* Main
* Rental

Contoh:

* Air Mineral
* Mie Instan
* Kopi
* Snack
* Minuman Botol
* Tambah Stick
* Sewa Headset
* Biaya Lain-lain

Admin dapat:

* Menambah item
* Mengubah Qty
* Menghapus item sebelum transaksi selesai

---

# 14. Diskon

Jenis:

* Nominal
* Persentase

Hanya dapat diberikan sebelum transaksi selesai.

---

# 15. Pembayaran

Metode:

* Cash
* Transfer
* QRIS (Pencatatan saja)

Field:

* Total Tagihan
* Dibayar
* Kembalian

Kembalian dihitung otomatis.

---

# 16. Struktur Transaksi

## Transaction Header

Menyimpan informasi transaksi.

Field:

* Invoice
* Jenis Transaksi
* Customer
* Status
* Subtotal
* Diskon
* Grand Total
* Dibayar
* Kembalian
* Metode Pembayaran
* Catatan

---

## Transaction Detail

Menyimpan semua item transaksi.

Jenis Item:

MAIN

RENTAL

PRODUCT

SERVICE

PENALTY

Contoh:

| Item          |   Qty |  Harga | Subtotal |
| ------------- | ----: | -----: | -------: |
| Main Room VIP | 2 Jam | 20.000 |   40.000 |
| Mie Instan    |     2 | 10.000 |   20.000 |
| Air Mineral   |     2 |  5.000 |   10.000 |
| Tambah Stick  |     1 | 10.000 |   10.000 |
| Denda         | 3 Jam | 10.000 |   30.000 |

---

# 17. Nomor Invoice

Format:

PS-YYYYMMDD-0001

Contoh:

PS-20260730-0001

Nomor dibuat otomatis.

---

# 18. Status Transaksi

* Aktif
* Menunggu Pengembalian
* Selesai
* Dibatalkan

---

# 19. Laporan

## Pendapatan

Filter:

* Harian
* Bulanan
* Tahunan

Menampilkan:

* Pendapatan Main
* Pendapatan Rental
* Penjualan Produk
* Denda
* Total Pendapatan

---

## Main

Menampilkan:

* Jumlah transaksi
* Total jam bermain
* Pendapatan

---

## Rental

Menampilkan:

* Rental aktif
* Rental selesai
* Keterlambatan
* Denda

---

## Produk

Menampilkan:

* Produk terjual
* Qty
* Omzet

---

## Stok

Menampilkan:

* Stok saat ini
* Produk hampir habis
* Riwayat stok

---

## Perangkat

Menampilkan:

* Sedang digunakan
* Sedang dirental
* Maintenance
* Riwayat penggunaan

---

# 20. Functional Requirements

### Authentication

* Login
* Logout

### Dashboard

* Ringkasan operasional
* Statistik
* Aktivitas realtime

### Master Data

* CRUD Room
* CRUD PlayStation
* CRUD TV
* CRUD Stick
* CRUD Tarif Main
* CRUD Paket Rental
* CRUD Master Denda
* CRUD Produk

### Set Room

* Atur perangkat (PS, TV, Stick) per room
* Pindahkan device antar room
* Atur tarif main per room
* Lihat device tanpa room

### Main

* Mulai Main
* Selesai Main
* Hitung durasi otomatis
* Tambah produk
* Tambah biaya layanan
* Diskon
* Pembayaran
* Cetak struk

### Rental

* Buat Rental
* Pengembalian
* Hitung denda
* Tambah produk
* Tambah biaya
* Diskon
* Pembayaran
* Cetak struk

### Produk

* CRUD Produk
* Penyesuaian stok
* Riwayat stok

### Perangkat

* CRUD Perangkat
* Kode aset auto-generate
* Maintenance
* Status realtime
* Hapus ditolak jika ter-assign ke room (lepas dulu di Set Room)

### Laporan

* Filter tanggal
* Export PDF
* Export Excel

---

# 21. Non Functional Requirements

* Berbasis Web
* Responsive Desktop & Tablet
* Multi User Admin
* Backup Database
* Audit Log
* Performa respon <2 detik pada transaksi normal

---

# 22. Struktur Database (High Level)

### users

* id
* name
* username
* password_hash
* role

### rooms

* id
* name
* play_rate_id (FK ke play_rates)
* status

### playstations

* id
* room_id
* asset_code
* name
* series
* brand
* serial_number
* purchase_date
* condition
* status

### televisions

* id
* room_id
* asset_code
* name
* size
* serial_number
* status

### controllers

* id
* room_id
* asset_code
* controller_number
* condition
* status

### customers

* id
* name
* phone
* address
* identity_number (opsional)

### play_rates

* id
* name
* hourly_rate
* is_active

### rental_packages

* id
* name
* duration_days (decimal, support 0.5 = 12 jam)
* price
* is_active

### penalty_rates

* id
* name
* type (hourly / daily / fixed)
* amount
* is_active

### products

* id
* product_code
* category
* name
* price
* stock
* minimum_stock
* is_active

### stock_movements

* id
* product_id
* movement_type
* qty
* reference
* notes
* created_at

### transactions

* id
* invoice_number
* transaction_type
* customer_id
* room_id
* status
* subtotal
* discount_type
* discount_value
* discount_amount
* grand_total
* payment_method
* amount_paid
* change_amount
* notes
* created_by
* created_at
* updated_at

### transaction_details

* id
* transaction_id
* item_type
* reference_id
* item_name
* qty
* unit
* unit_price
* subtotal
* notes

### rentals

* id
* transaction_id
* playstation_id
* controller_id (varchar, comma-separated IDs — support multi-stick)
* package_id
* rental_date
* due_date
* return_date
* late_hours
* penalty_amount

### asset_logs

* id
* asset_type
* asset_id
* activity
* notes
* created_at

---

# 23. Future Enhancement (Out of Scope)

* Membership pelanggan
* Reservasi online
* Tarif Peak/Off-Peak
* Tarif Overnight
* Barcode produk
* QR Code transaksi
* WhatsApp Notification
* Mobile Application
* Integrasi Payment Gateway

### Catatan Arsitektur

Untuk implementasi, saya menyarankan menggunakan pendekatan **modular** agar mudah dikembangkan:

1. **Authentication**
2. **Dashboard**
3. **Master Data**

   * Room
   * Perangkat
   * Produk
   * Tarif
4. **Transaksi**

   * Main di Tempat
   * Rental
   * Pembayaran
5. **Inventory**
6. **Laporan**
7. **Settings**

Selain itu, saya juga menyarankan menambahkan **lampiran teknis** yang biasanya melengkapi PRD profesional, yaitu:

* **User Flow** (alur pengguna per modul)
* **Use Case Diagram**
* **ERD (Entity Relationship Diagram)**
* **Wireframe UI** (±20–25 halaman)
* **API Specification** (REST API)
* **Database Schema** lengkap (DDL SQL)

Dengan dokumen tersebut, seorang developer dapat langsung mulai mengembangkan aplikasi tanpa perlu banyak asumsi tambahan.
