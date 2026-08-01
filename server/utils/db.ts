import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../db/schema'

let pool: mysql.Pool
let cachedDb: ReturnType<typeof drizzle> | undefined

export function useDb() {
  if (cachedDb) return cachedDb
  if (!pool) {
    pool = mysql.createPool(useRuntimeConfig().databaseUrl)
  }
  cachedDb = drizzle(pool, { schema, mode: 'default' })
  return cachedDb
}
