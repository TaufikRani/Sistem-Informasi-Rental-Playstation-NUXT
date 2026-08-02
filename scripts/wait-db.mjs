import mysql from 'mysql2/promise'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'
const retries = Number(process.env.DB_WAIT_RETRIES || 30)

for (let i = 1; i <= retries; i++) {
  try {
    const conn = await mysql.createConnection(url)
    await conn.query('SELECT 1')
    await conn.end()
    console.log('Database siap.')
    process.exit(0)
  } catch {
    console.log(`Menunggu database... (${i}/${retries})`)
    await new Promise((r) => setTimeout(r, 2000))
  }
}

console.error('Database tidak dapat dijangkau.')
process.exit(1)
