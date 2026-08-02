import mysql from 'mysql2/promise'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'

const conn = await mysql.createConnection(url)
const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM users')
await conn.end()

if (count === 0) {
  console.log('Database kosong — menjalankan seed...')
  await import('./seed.mjs')
} else {
  console.log('Database sudah berisi — seed dilewati.')
}
