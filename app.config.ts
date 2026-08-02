export default defineAppConfig({
  ui: {
    colors: {
      // ===== WARNA PRIMARY (warna utama aplikasi) =====
      // Dipakai untuk: tombol utama, link, badge, fokus, gradient login,
      // statistik dashboard, dll. Ubah salah satu di bawah lalu restart dev.
      // 'green'   -> hijau segar (seperti logo/PS)
      // 'emerald' -> hijau kebiruan
      // 'teal'    -> hijau keabu-abuan
      // 'cyan'    -> biru muda
      // 'sky'     -> biru langit
      // 'blue'    -> biru standar
      // 'indigo'  -> biru keunguan
      // 'violet'  -> ungu muda
      // 'purple'  -> ungu
      // 'fuchsia' -> pink keunguan
      // 'pink'    -> pink
      // 'rose'    -> merah muda pekat
      // 'red'     -> merah (hati-hati, terlihat seperti error)
      // 'orange'  -> oranye
      // 'amber'   -> kuning keemasan
      // 'yellow'  -> kuning
      // 'lime'    -> hijau kekuningan
      primary: 'green',

      // ===== WARNA NEUTRAL (warna dasar UI: kartu, teks, border) =====
      // 'slate'   -> abu kebiruan
      // 'gray'    -> abu standar
      // 'zinc'    -> abu netral (default)
      // 'neutral' -> abu hangat
      // 'stone'   -> abu kecokelatan
      neutral: 'neutral',
    },
  },
})
