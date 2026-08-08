import { eq } from 'drizzle-orm'
import { penaltyRates, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [row] = await db.select().from(penaltyRates).where(eq(penaltyRates.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Denda tidak ditemukan' })

  const activeRental = await db.select({ id: transactions.id })
    .from(transactions)
    .where(eq(transactions.status, 'waiting_return'))
    .limit(1)
  if (activeRental.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  await db.delete(penaltyRates).where(eq(penaltyRates.id, id))
  return { ok: true }
})
