import { eq, and, inArray } from 'drizzle-orm'
import { customers, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const txn = await db.select({ id: transactions.id })
    .from(transactions)
    .where(and(eq(transactions.customerId, id), inArray(transactions.status, ['active', 'waiting_return'])))
    .limit(1)
  if (txn.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  await db.delete(customers).where(eq(customers.id, id))
  return { ok: true }
})
