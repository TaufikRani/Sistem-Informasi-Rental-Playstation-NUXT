import { eq, and, inArray } from 'drizzle-orm'
import { transactions, rentals, playstations, controllers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [tx] = await db.select().from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.transactionType, 'RENTAL'), eq(transactions.status, 'waiting_return')))
  if (!tx) throw createError({ statusCode: 422, statusMessage: 'Transaksi tidak ditemukan atau sudah selesai' })

  const [rental] = await db.select().from(rentals).where(eq(rentals.transactionId, id))
  if (rental) {
    await db.update(playstations).set({ status: 'ready' }).where(eq(playstations.id, rental.playstationId))
    if (rental.controllerId) {
      const ids = rental.controllerId.split(',').map(Number).filter(n => n > 0)
      if (ids.length > 0) {
        await db.update(controllers).set({ status: 'ready' }).where(inArray(controllers.id, ids))
      }
    }
  }

  await db.update(transactions).set({ status: 'cancelled', endedAt: new Date() }).where(eq(transactions.id, id))
  return { ok: true }
})
