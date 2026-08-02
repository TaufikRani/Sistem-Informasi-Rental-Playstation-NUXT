# BAB 1
# PENDAHULUAN

## 1.1 Latar Belakang

Industri hiburan digital berkembang pesat seiring meningkatnya minat masyarakat terhadap permainan video. Salah satu bentuk usaha yang tumbuh dari minat tersebut adalah jasa penyewaan PlayStation yang banyak diminati para pecinta game (Pande et al., 2026). Usaha ini umumnya menawarkan dua jenis layanan utama, yaitu main di tempat dan penyewaan PlayStation untuk dibawa pulang, serta penjualan produk pendukung seperti makanan, minuman, dan layanan tambahan. Kedua layanan tersebut menjadikan pengelolaan operasional usaha rental PlayStation tidak hanya bergantung pada ketersediaan perangkat, tetapi juga pada keakuratan pencatatan transaksi, perhitungan biaya, dan pengendalian stok.

Permasalahan utama yang dihadapi sebagian besar usaha rental PlayStation adalah sistem pencatatan yang masih dilakukan secara manual. Penelitian pada Rental PlayStation Zhagon menunjukkan bahwa pencatatan transaksi masih menggunakan media kertas dan buku sehingga rawan terjadi kesalahan serta menyulitkan proses administrasi, terutama ketika terjadi pergantian petugas (Alifah, 2022). Kondisi serupa ditemukan pada Rental PlayStation Naya yang mengalami kesalahan pencatatan, keterlambatan administrasi, dan keterbatasan promosi akibat sistem manual (Pande et al., 2026). Kholili dan Adriyansyah (2025) menegaskan bahwa sistem manual menimbulkan kesulitan dalam proses pemesanan, keterbatasan informasi ketersediaan unit, dan ketidakteraturan pencatatan transaksi karena pendataan masih menggunakan buku tulis. Dampak yang ditimbulkan antara lain kesalahan perhitungan durasi dan biaya, lambatnya proses pelayanan, sulitnya memantau status perangkat, serta tidak tersusunnya laporan pendapatan secara rapi.

Penelitian-penelitian sebelumnya membuktikan bahwa penerapan sistem informasi dapat mengatasi permasalahan tersebut. Permana et al. (2025) mengembangkan platform berbasis web dan aplikasi mobile untuk layanan rental PlayStation dan memperoleh hasil penurunan waktu pemesanan sebesar 70% serta tingkat kepuasan pengguna sebesar 90%. Sistem digital juga terbukti mampu melakukan pencatatan transaksi secara otomatis dan real-time sehingga meningkatkan efisiensi layanan dibandingkan metode konvensional (Kholili & Adriyansyah, 2025). Pendekatan aplikasi berbasis web untuk usaha penyewaan juga telah diterapkan pada Berkah Rental dengan memanfaatkan metode Waterfall yang memudahkan pelaksanaan pengujian black-box dan white-box (Daulay & Safarudin, 2021). Hasil-hasil penelitian tersebut menunjukkan bahwa digitalisasi pencatatan pada usaha penyewaan merupakan solusi yang relevan dan telah teruji.

Glory Esports Wonocatur merupakan usaha rental PlayStation yang berlokasi di Jalan Wonocatur, Banguntapan, Kabupaten Bantul, Daerah Istimewa Yogyakarta. Usaha ini menyediakan layanan main di tempat dan rental PlayStation, serta menjual produk pendukung seperti makanan dan minuman. Berdasarkan alur operasional yang berjalan, pencatatan transaksi pada Glory Esports Wonocatur masih dilakukan secara manual, sehingga muncul permasalahan yang serupa dengan penelitian sebelumnya, yaitu kesalahan perhitungan durasi main yang dihitung per jam, perhitungan denda keterlambatan pengembalian rental, pemantauan status ruang dan perangkat seperti PlayStation, televisi, dan stik, pengendalian stok produk, serta penyusunan laporan pendapatan harian dan bulanan yang membutuhkan waktu lama.

Berdasarkan uraian tersebut, secara teoritis penelitian ini diperlukan untuk menerapkan konsep sistem informasi transaksi dengan struktur header dan detail yang mencatat setiap item transaksi secara terperinci serta perhitungan biaya yang otomatis. Secara praktis, penelitian ini diperlukan untuk menyediakan alat bantu bagi Glory Esports Wonocatur dalam mengelola operasional sehari-hari secara lebih cepat dan akurat. Permasalahan tersebut dipecahkan dengan merancang dan membangun sistem informasi rental PlayStation berbasis web menggunakan metode Waterfall yang meliputi tahap analisis kebutuhan, perancangan, implementasi, dan pengujian, serta melakukan pengujian black-box untuk memastikan seluruh fungsi berjalan sesuai kebutuhan.

## 1.2 Rumusan Masalah

Permasalahan dalam penelitian ini dirumuskan dengan pendekatan studi literatur terhadap penelitian-penelitian terdahulu mengenai sistem informasi penyewaan serta analisis kebutuhan operasional pada Glory Esports Wonocatur. Keunikan objek studi terletak pada kebutuhan integrasi dua jenis layanan dalam satu sistem, yaitu layanan main di tempat yang memerlukan perhitungan durasi secara real-time dan layanan rental PlayStation yang memerlukan perhitungan denda keterlambatan, disertai penjualan produk tambahan, pengelolaan stok, pemantauan status perangkat, dan penyusunan laporan yang tidak tersedia secara bersamaan pada penelitian-penelitian sebelumnya. Berbekal latar belakang tersebut, masalah yang diteliti dirumuskan sebagai berikut.

1. Bagaimana merancang sistem informasi rental PlayStation berbasis web pada Glory Esports Wonocatur yang mampu mengelola transaksi main di tempat, rental PlayStation, dan penjualan produk tambahan?
2. Bagaimana sistem menghitung durasi main, biaya rental, denda keterlambatan, diskon, dan kembalian secara otomatis dan akurat?
3. Bagaimana sistem mengelola stok produk serta status ruang dan perangkat secara real-time?
4. Bagaimana sistem menyediakan laporan pendapatan dan operasional yang akurat bagi pemilik usaha?

Alur kerangka proses perumusan masalah hingga pencapaian tujuan penelitian digambarkan pada bagan berikut.

```
Operasional manual pada Glory Esports Wonocatur
                    │
                    ▼
Analisis kebutuhan (studi literatur + observasi alur kerja)
                    │
                    ▼
Perumusan masalah (empat pertanyaan penelitian)
                    │
                    ▼
Penentuan tujuan penelitian
                    │
                    ▼
Perancangan dan pembangunan sistem (metode Waterfall)
                    │
                    ▼
Pengujian black-box
                    │
                    ▼
Pencapaian tujuan penelitian
```

## 1.3 Ruang Lingkup

Ruang lingkup penelitian ini mencakup pekerjaan berikut.

- Objek penelitian berupa sistem informasi rental PlayStation pada Glory Esports Wonocatur yang menyediakan layanan main di tempat dan rental PlayStation.
- Perancangan dan pembangunan sistem informasi berbasis web yang diakses melalui peramban pada perangkat desktop dan tablet.
- Pengembangan modul autentikasi pengguna dengan dua peran, yaitu admin dan kasir.
- Pengembangan dashboard yang menampilkan ringkasan operasional secara real-time, meliputi ketersediaan ruang, sesi main aktif, rental aktif, pendapatan harian dan bulanan, produk dengan stok di bawah batas minimal, serta pengembalian yang terlambat.
- Pengembangan master data ruang, PlayStation, televisi, stik, tarif main, paket rental, tarif denda, produk, pelanggan, dan pengguna.
- Pengembangan transaksi main di tempat yang meliputi mulai main, penambahan produk selama sesi berlangsung, dan penyelesaian transaksi dengan perhitungan durasi, diskon, dan pembayaran.
- Pengembangan transaksi rental PlayStation yang meliputi pembuatan rental, pengembalian dengan perhitungan denda keterlambatan, diskon, dan pembayaran.
- Pengembangan manajemen stok yang meliputi penambahan stok, koreksi stok, pengurangan stok otomatis saat transaksi selesai, dan riwayat pergerakan stok.
- Pengembangan laporan pendapatan harian, bulanan, dan tahunan beserta ekspor laporan ke Microsoft Excel.
- Pengembangan cetak struk transaksi berukuran 58 mm.
- Perhitungan otomatis yang meliputi durasi main yang dibulatkan ke atas per jam dikalikan tarif, denda keterlambatan yang dihitung dari jumlah jam keterlambatan dibulatkan ke atas dikalikan tarif denda per jam, diskon nominal atau persentase, dan kembalian yang dihitung otomatis dari uang yang dibayarkan.
- Pengembangan sistem menggunakan metode Waterfall dengan tahapan analisis kebutuhan, perancangan, implementasi, dan pengujian.
- Pengujian sistem menggunakan black-box testing terhadap seluruh fungsi.
- Teknologi yang digunakan meliputi Nuxt 3 sebagai kerangka kerja Vue.js (Nuxt, n.d.) dengan Nuxt UI (Nuxt UI, n.d.), TypeScript, Drizzle ORM sebagai penghubung aplikasi dengan basis data (Drizzle ORM, n.d.), MariaDB 11 sebagai sistem manajemen basis data (MariaDB, n.d.), dan ExcelJS untuk pembuatan laporan.

## 1.4 Tujuan Penelitian

Tujuan yang akan dicapai dalam penelitian ini adalah sebagai berikut.

1. Merancang sistem informasi rental PlayStation berbasis web pada Glory Esports Wonocatur yang mampu mengelola transaksi main di tempat, rental PlayStation, dan penjualan produk tambahan.
2. Mengimplementasikan perhitungan otomatis durasi main, biaya rental, denda keterlambatan, diskon, dan kembalian pada sistem.
3. Menyediakan pengelolaan stok produk serta pemantauan status ruang dan perangkat secara real-time.
4. Menghasilkan laporan pendapatan dan operasional yang akurat beserta fitur ekspor ke Microsoft Excel.
5. Menguji seluruh fungsi sistem melalui black-box testing untuk memastikan sistem berjalan sesuai kebutuhan.

## 1.5 Manfaat Penelitian

Penelitian ini diharapkan memberikan manfaat sebagai berikut.

- Bagi pengembangan iptek, penelitian ini memberikan sumbangan berupa penerapan metode Waterfall dan black-box testing pada pengembangan sistem informasi untuk usaha kecil dan menengah di bidang jasa penyewaan perangkat hiburan, serta dapat menjadi rujukan bagi penelitian sejenis.
- Bagi pemilik usaha, penelitian ini menyediakan sistem yang dapat digunakan sebagai pertimbangan dalam pengambilan kebijakan operasional, misalnya penentuan tarif, pengendalian stok, dan perawatan perangkat, berdasarkan laporan yang akurat.
- Bagi profesi kasir dan petugas, penelitian ini mempermudah dan mempercepat proses pencatatan transaksi serta mengurangi kesalahan perhitungan dibandingkan pencatatan manual.
- Bagi masyarakat umum, penelitian ini meningkatkan kualitas layanan rental PlayStation dan dapat menjadi contoh penerapan sistem informasi bagi pelaku usaha serupa.

## 1.6 Sistematika Penulisan

Bab I Pendahuluan menguraikan latar belakang yang menjadi dasar dilakukannya penelitian, rumusan masalah yang akan dijawab, ruang lingkup pekerjaan yang dilakukan, tujuan yang hendak dicapai, manfaat yang diharapkan, serta sistematika penulisan yang menjelaskan susunan bab secara keseluruhan.

Bab II Tinjauan Pustaka memaparkan teori-teori yang menjadi landasan penelitian, meliputi konsep sistem informasi, basis data, teknologi yang digunakan, metode pengembangan sistem, serta penelitian-penelitian terdahulu yang relevan beserta posisi penelitian ini di antara penelitian tersebut.

Bab III Metode Penelitian menjelaskan tahapan penelitian yang dilakukan, meliputi pengumpulan data, analisis kebutuhan sistem, perancangan arsitektur sistem, perancangan basis data, perancangan antarmuka, dan perancangan skenario pengujian dengan metode Waterfall.

Bab IV Implementasi dan Pembahasan menguraikan hasil implementasi setiap modul sistem, hasil pengujian black-box terhadap seluruh fungsi, serta pembahasan terhadap temuan yang diperoleh selama penelitian.

Bab V Penutup menyajikan kesimpulan yang menjawab rumusan masalah serta saran yang dapat dipertimbangkan untuk pengembangan sistem di masa mendatang.
