import mysql from 'mysql2/promise'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'

const conn = await mysql.createConnection(url)

const [tables] = await conn.query("SHOW TABLES LIKE 'users'")
const isFresh = tables.length === 0

try {
  if (isFresh) {
    console.log('Tabel belum ada (DB fresh) — menjalankan migrate & seed...')
    await import('./migrate.mjs')
    await import('./seed.mjs')
  } else {
    const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM users')
    if (count === 0) {
      console.log('Database kosong — menjalankan migrate & seed...')
      await import('./migrate.mjs')
      await import('./seed.mjs')
    } else {
      console.log('Database sudah berisi — migrate & seed dilewati.')
    }
  }
} finally {
  await conn.end()
}
