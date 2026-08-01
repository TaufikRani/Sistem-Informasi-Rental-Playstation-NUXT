import { asc, like, or } from 'drizzle-orm'
import { customers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const query = getQuery(event)
  const q = String(query.q || '').trim()

  const base = db.select().from(customers)
  if (q) {
    const rows = await base.where(or(like(customers.name, `%${q}%`), like(customers.phone, `%${q}%`))).orderBy(asc(customers.name)).limit(20)
    return rows
  }
  return await base.orderBy(asc(customers.name)).limit(100)
})
