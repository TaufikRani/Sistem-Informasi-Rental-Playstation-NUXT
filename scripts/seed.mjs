import mysql from 'mysql2/promise'
import { createHash } from 'node:crypto'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'

function hashPassword(password) {
  const salt = 'rentalps'
  return 'sha256:' + createHash('sha256').update(salt + password).digest('hex')
}

const conn = await mysql.createConnection(url)

const upsert = async (table, row, onDup) => {
  const cols = Object.keys(row)
  const sql = `INSERT INTO ${table} (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${cols.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${onDup.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(', ')}`
  await conn.query(sql, cols.map((c) => row[c]))
}

// ===== Master data yang tidak punya unique key: bersihkan lalu isi ulang =====
await conn.query('DELETE FROM customers')
await conn.query('DELETE FROM penalty_rates')
await conn.query('DELETE FROM play_rates')
await conn.query('DELETE FROM rental_packages')

// ===== Users =====
await upsert('users', { name: 'Administrator', username: 'admin', password_hash: hashPassword('admin123'), role: 'admin' }, ['name'])
await upsert('users', { name: 'Kasir', username: 'kasir', password_hash: hashPassword('kasir123'), role: 'cashier' }, ['name'])

// ===== Play rates =====
for (const r of [
  { name: 'Reguler', room_type: 'reguler', hourly_rate: '5000' },
  { name: 'VIP', room_type: 'vip', hourly_rate: '10000' },
  { name: 'Premium', room_type: 'premium', hourly_rate: '15000' },
]) {
  await conn.query('INSERT INTO play_rates (name, room_type, hourly_rate) VALUES (?, ?, ?)', [r.name, r.room_type, r.hourly_rate])
}

// ===== Paket rental =====
for (const p of [
  { name: '3 Hari', durationDays: 3, price: '50000' },
  { name: '7 Hari', durationDays: 7, price: '100000' },
  { name: '14 Hari', durationDays: 14, price: '180000' },
]) {
  await conn.query('INSERT INTO rental_packages (name, duration_days, price) VALUES (?, ?, ?)', [p.name, p.durationDays, p.price])
}

// ===== Tarif denda =====
await conn.query('INSERT INTO penalty_rates (hourly_penalty) VALUES (?)', ['5000'])

// ===== Produk =====
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
  await upsert('products', p, ['name', 'price', 'stock', 'minimum_stock', 'category'])
}

// ===== Customer (wajib untuk rental — jaminan identitas) =====
for (const c of [
  { name: 'Andi Pratama', phone: '081234567890', identity_number: 'KTP-3171012312960001', address: 'Jl. Merdeka No. 10, Jakarta' },
  { name: 'Budi Santoso', phone: '081298765432', identity_number: 'KTP-3171011501900002', address: 'Jl. Sudirman No. 45, Jakarta' },
  { name: 'Citra Lestari', phone: '081377654321', identity_number: 'SIM-6502071201880003', address: 'Jl. Melati No. 8, Bandung' },
]) {
  await conn.query('INSERT INTO customers (name, phone, identity_number, address) VALUES (?, ?, ?, ?)', [c.name, c.phone, c.identity_number, c.address])
}

// ===== Rooms =====
for (const r of [
  { name: 'Room 1', room_type: 'reguler' },
  { name: 'Room 2', room_type: 'reguler' },
  { name: 'Room 3', room_type: 'vip' },
  { name: 'Room 4', room_type: 'vip' },
  { name: 'Room 5', room_type: 'premium' },
]) {
  await upsert('rooms', r, ['room_type'])
}

// ===== PlayStation =====
for (const p of [
  { asset_code: 'PS-001', name: 'PlayStation 4 Slim', series: 'PS4 Slim', brand: 'Sony', serial_number: 'SN-PS4-001', room_id: 1 },
  { asset_code: 'PS-002', name: 'PlayStation 4 Slim', series: 'PS4 Slim', brand: 'Sony', serial_number: 'SN-PS4-002', room_id: 2 },
  { asset_code: 'PS-003', name: 'PlayStation 5', series: 'PS5', brand: 'Sony', serial_number: 'SN-PS5-001', room_id: 3 },
  { asset_code: 'PS-004', name: 'PlayStation 5', series: 'PS5', brand: 'Sony', serial_number: 'SN-PS5-002', room_id: 4 },
  { asset_code: 'PS-005', name: 'PlayStation 5 Pro', series: 'PS5 Pro', brand: 'Sony', serial_number: 'SN-PS5-003', room_id: 5 },
]) {
  await upsert('playstations', p, ['name', 'series', 'brand', 'serial_number', 'room_id'])
}

// ===== Televisi =====
for (let i = 1; i <= 5; i++) {
  await upsert('televisions', {
    asset_code: `TV-00${i}`,
    name: `TV Room ${i}`,
    size: '32 inch',
    serial_number: `SN-TV-00${i}`,
    room_id: i,
  }, ['name', 'size', 'serial_number', 'room_id'])
}

// ===== Stick =====
let cnum = 1
for (let room = 1; room <= 5; room++) {
  for (let s = 1; s <= 2; s++) {
    const num = String(cnum++).padStart(2, '0')
    await upsert('controllers', {
      asset_code: `STK-${num}`,
      controller_number: num,
      room_id: room,
    }, ['controller_number', 'room_id'])
  }
}

console.log('Seed selesai. Login: admin / admin123 | kasir / kasir123')
await conn.end()
