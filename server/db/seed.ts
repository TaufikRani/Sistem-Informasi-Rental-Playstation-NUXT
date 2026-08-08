import { createHash } from 'node:crypto'
import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'

function hashPassword(password: string) {
  const salt = 'rentalps'
  return 'sha256:' + createHash('sha256').update(salt + password).digest('hex')
}

async function main() {
  const conn = await mysql.createConnection(url)
  const db = drizzle(conn, { schema, mode: 'default' })

  // ---- Truncate all tables (reverse dependency order) ----
  await db.delete(schema.assetLogs)
  await db.delete(schema.stockMovements)
  await db.delete(schema.transactionDetails)
  await db.delete(schema.rentals)
  await db.delete(schema.transactions)
  await db.delete(schema.controllers)
  await db.delete(schema.televisions)
  await db.delete(schema.playstations)
  await db.delete(schema.rooms)
  await db.delete(schema.products)
  await db.delete(schema.customers)
  await db.delete(schema.penaltyRates)
  await db.delete(schema.rentalPackages)
  await db.delete(schema.playRates)
  await db.delete(schema.users)

  // ---- 1. Users ----
  await db.insert(schema.users).values({
    name: 'Administrator',
    username: 'admin',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
  })

  // ---- 2. Play Rates ----
  const rates = [
    { name: 'Tarif Reguler', hourlyRate: '5000' },
    { name: 'Tarif VIP', hourlyRate: '10000' },
    { name: 'Tarif Premium', hourlyRate: '15000' },
  ]
  for (const r of rates) {
    await db.insert(schema.playRates).values(r)
  }

  // ---- 3. Rooms (with playRateId) ----
  await db.insert(schema.rooms).values([
    { name: 'Room 1', playRateId: 1 },
    { name: 'Room 2', playRateId: 1 },
    { name: 'Room 3', playRateId: 2 },
    { name: 'Room 4', playRateId: 2 },
    { name: 'Room 5', playRateId: 3 },
  ])

  // ---- 4. PlayStations ----
  await db.insert(schema.playstations).values([
    { assetCode: 'PS-001', name: 'PlayStation 4 Slim', series: 'PS4 Slim', brand: 'Sony', serialNumber: 'SN-PS4-001', roomId: 1 },
    { assetCode: 'PS-002', name: 'PlayStation 4 Slim', series: 'PS4 Slim', brand: 'Sony', serialNumber: 'SN-PS4-002', roomId: 2 },
    { assetCode: 'PS-003', name: 'PlayStation 5', series: 'PS5', brand: 'Sony', serialNumber: 'SN-PS5-001', roomId: 3 },
    { assetCode: 'PS-004', name: 'PlayStation 5', series: 'PS5', brand: 'Sony', serialNumber: 'SN-PS5-002', roomId: 4 },
    { assetCode: 'PS-005', name: 'PlayStation 5 Pro', series: 'PS5 Pro', brand: 'Sony', serialNumber: 'SN-PS5-003', roomId: 5 },
  ])

  // ---- 5. Televisions ----
  for (let i = 1; i <= 5; i++) {
    await db.insert(schema.televisions).values({
      assetCode: `TV-00${i}`,
      name: `TV Room ${i}`,
      size: '32 inch',
      serialNumber: `SN-TV-00${i}`,
      roomId: i,
    })
  }

  // ---- 6. Controllers (2 per room, 10 total) ----
  let cnum = 1
  for (let room = 1; room <= 5; room++) {
    for (let s = 1; s <= 2; s++) {
      const num = String(cnum++).padStart(2, '0')
      await db.insert(schema.controllers).values({
        assetCode: `STK-${num}`,
        controllerNumber: num,
        roomId: room,
      })
    }
  }

  // ---- 7. Rental Packages ----
  await db.insert(schema.rentalPackages).values([
    { name: '3 Hari', durationDays: '3', price: '50000' },
    { name: '7 Hari', durationDays: '7', price: '100000' },
    { name: '14 Hari', durationDays: '14', price: '180000' },
  ])

  // ---- 8. Penalty Rates ----
  await db.insert(schema.penaltyRates).values([
    { name: 'Denda Standar', type: 'hourly', amount: '5000', isActive: true },
  ])

  // ---- 9. Customers ----
  await db.insert(schema.customers).values([
    { name: 'Andi Pratama', phone: '081234567890', identityNumber: 'KTP-3171012312960001', address: 'Jl. Merdeka No. 10, Jakarta' },
    { name: 'Budi Santoso', phone: '081298765432', identityNumber: 'KTP-3171011501900002', address: 'Jl. Sudirman No. 45, Jakarta' },
    { name: 'Citra Lestari', phone: '081377654321', identityNumber: 'SIM-6502071201880003', address: 'Jl. Melati No. 8, Bandung' },
  ])

  // ---- 10. Products ----
  await db.insert(schema.products).values([
    { productCode: 'PDT-001', category: 'drink', name: 'Air Mineral', price: '5000', stock: 50, minimumStock: 10 },
    { productCode: 'PDT-002', category: 'food', name: 'Mie Instan', price: '10000', stock: 30, minimumStock: 10 },
    { productCode: 'PDT-003', category: 'food', name: 'Snack', price: '5000', stock: 40, minimumStock: 10 },
    { productCode: 'PDT-004', category: 'drink', name: 'Kopi', price: '8000', stock: 20, minimumStock: 5 },
    { productCode: 'PDT-005', category: 'drink', name: 'Minuman Botol', price: '7000', stock: 25, minimumStock: 8 },
    { productCode: 'PDT-006', category: 'service', name: 'Tambah Stick', price: '10000', stock: 0, minimumStock: 0 },
    { productCode: 'PDT-007', category: 'service', name: 'Sewa Headset', price: '15000', stock: 0, minimumStock: 0 },
    { productCode: 'PDT-008', category: 'other', name: 'Biaya Lain-lain', price: '0', stock: 0, minimumStock: 0 },
  ])

  console.log('Seed selesai. Login: admin / admin123')
  await conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
