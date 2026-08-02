import { migrate } from 'drizzle-orm/mysql2/migrator'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps'
const migrationsFolder = process.env.MIGRATIONS_FOLDER || './server/db/migrations'

const conn = await mysql.createConnection(url)
await migrate(drizzle(conn), { migrationsFolder })
await conn.end()
console.log('Migrasi database selesai.')
