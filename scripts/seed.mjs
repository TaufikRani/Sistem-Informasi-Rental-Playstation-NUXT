import mysql from 'mysql2/promise'
import { createHash } from 'node:crypto'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'

function hashPassword(password) {
  const salt = 'rentalps'
  return 'sha256:' + createHash('sha256').update(salt + password).digest('hex')
}

const conn = await mysql.createConnection(url)

// ---- Helper insert dengan on duplicate key update ----
const upsert = async (table, row, onDup) => {
  const cols = Object.keys(row)
  const sql = `INSERT INTO ${table} (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${cols.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${onDup.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(', ')}`
  await conn.query(sql, cols.map((c) => row[c]))
}

// ---- Truncate semua tabel (reverse dependency order) ----
await conn.query('DELETE FROM asset_logs')
await conn.query('DELETE FROM stock_movements')
await conn.query('DELETE FROM transaction_details')
await conn.query('DELETE FROM rentals')
await conn.query('DELETE FROM transactions')
await conn.query('DELETE FROM controllers')
await conn.query('DELETE FROM televisions')
await conn.query('DELETE FROM playstations')
await conn.query('DELETE FROM rooms')
await conn.query('DELETE FROM products')
await conn.query('DELETE FROM customers')
await conn.query('DELETE FROM penalty_rates')
await conn.query('DELETE FROM rental_packages')
await conn.query('DELETE FROM play_rates')
await conn.query('DELETE FROM users')

// ---- Users ----
await conn.query("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
  'Administrator', 'admin', hashPassword('admin123'), 'admin',
])

// ---- Play Rates ----
for (const r of [
  { name: 'Tarif Reguler', hourly_rate: '5000' },
  { name: 'Tarif VIP', hourly_rate: '10000' },
  { name: 'Tarif Premium', hourly_rate: '15000' },
]) {
  await conn.query('INSERT INTO play_rates (name, hourly_rate) VALUES (?, ?)', [r.name, r.hourly_rate])
}

// ---- Rooms ----
for (const r of [
  { name: 'Room 1', play_rate_id: 1 },
  { name: 'Room 2', play_rate_id: 1 },
  { name: 'Room 3', play_rate_id: 2 },
  { name: 'Room 4', play_rate_id: 2 },
  { name: 'Room 5', play_rate_id: 3 },
]) {
  await conn.query('INSERT INTO rooms (name, play_rate_id) VALUES (?, ?)', [r.name, r.play_rate_id])
}

// ---- PlayStations ----
for (const p of [
  { asset_code: 'PS-001', name: 'PlayStation 4 Slim', series: 'PS4 Slim', brand: 'Sony', serial_number: 'SN-PS4-001', room_id: 1 },
  { asset_code: 'PS-002', name: 'PlayStation 4 Slim', series: 'PS4 Slim', brand: 'Sony', serial_number: 'SN-PS4-002', room_id: 2 },
  { asset_code: 'PS-003', name: 'PlayStation 5', series: 'PS5', brand: 'Sony', serial_number: 'SN-PS5-001', room_id: 3 },
  { asset_code: 'PS-004', name: 'PlayStation 5', series: 'PS5', brand: 'Sony', serial_number: 'SN-PS5-002', room_id: 4 },
  { asset_code: 'PS-005', name: 'PlayStation 5 Pro', series: 'PS5 Pro', brand: 'Sony', serial_number: 'SN-PS5-003', room_id: 5 },
]) {
  await conn.query(
    'INSERT INTO playstations (asset_code, name, series, brand, serial_number, room_id) VALUES (?, ?, ?, ?, ?, ?)',
    [p.asset_code, p.name, p.series, p.brand, p.serial_number, p.room_id],
  )
}

// ---- Televisions ----
for (let i = 1; i <= 5; i++) {
  await conn.query(
    'INSERT INTO televisions (asset_code, name, size, serial_number, room_id) VALUES (?, ?, ?, ?, ?)',
    [`TV-00${i}`, `TV Room ${i}`, '32 inch', `SN-TV-00${i}`, i],
  )
}

// ---- Controllers (2 per room, 10 total) ----
let cnum = 1
for (let room = 1; room <= 5; room++) {
  for (let s = 1; s <= 2; s++) {
    const num = String(cnum++).padStart(2, '0')
    await conn.query(
      'INSERT INTO controllers (asset_code, controller_number, room_id) VALUES (?, ?, ?)',
      [`STK-${num}`, num, room],
    )
  }
}

// ---- Rental Packages ----
for (const p of [
  { name: '3 Hari', duration_days: '3', price: '50000' },
  { name: '7 Hari', duration_days: '7', price: '100000' },
  { name: '14 Hari', duration_days: '14', price: '180000' },
]) {
  await conn.query('INSERT INTO rental_packages (name, duration_days, price) VALUES (?, ?, ?)', [p.name, p.duration_days, p.price])
}

// ---- Penalty Rates ----
await conn.query(
  "INSERT INTO penalty_rates (name, type, amount, is_active) VALUES (?, ?, ?, ?)",
  ['Denda Standar', 'hourly', '5000', true],
)

// ---- Customers ----
for (const c of [
  { name: 'Andi Pratama', phone: '081234567890', identity_number: 'KTP-3171012312960001', address: 'Jl. Merdeka No. 10, Jakarta' },
  { name: 'Budi Santoso', phone: '081298765432', identity_number: 'KTP-3171011501900002', address: 'Jl. Sudirman No. 45, Jakarta' },
  { name: 'Citra Lestari', phone: '081377654321', identity_number: 'SIM-6502071201880003', address: 'Jl. Melati No. 8, Bandung' },
]) {
  await conn.query(
    'INSERT INTO customers (name, phone, identity_number, address) VALUES (?, ?, ?, ?)',
    [c.name, c.phone, c.identity_number, c.address],
  )
}

// ---- Products ----
for (const p of [
  { product_code: 'PDT-001', category: 'drink', name: 'Air Mineral', price: '5000', stock: 50, minimum_stock: 10 },
  { product_code: 'PDT-002', category: 'food', name: 'Mie Instan', price: '10000', stock: 30, minimum_stock: 10 },
  { product_code: 'PDT-003', category: 'food', name: 'Snack', price: '5000', stock: 40, minimum_stock: 10 },
  { product_code: 'PDT-004', category: 'drink', name: 'Kopi', price: '8000', stock: 20, minimum_stock: 5 },
  { product_code: 'PDT-005', category: 'drink', name: 'Minuman Botol', price: '7000', stock: 25, minimum_stock: 8 },
  { product_code: 'PDT-006', category: 'service', name: 'Tambah Stick', price: '10000', stock: 0, minimum_stock: 0 },
  { product_code: 'PDT-007', category: 'service', name: 'Sewa Headset', price: '15000', stock: 0, minimum_stock: 0 },
  { product_code: 'PDT-008', category: 'other', name: 'Biaya Lain-lain', price: '0', stock: 0, minimum_stock: 0 },
]) {
  await conn.query(
    'INSERT INTO products (product_code, category, name, price, stock, minimum_stock) VALUES (?, ?, ?, ?, ?, ?)',
    [p.product_code, p.category, p.name, p.price, p.stock, p.minimum_stock],
  )
}

console.log('Seed selesai. Login: admin / admin123')
await conn.end()
