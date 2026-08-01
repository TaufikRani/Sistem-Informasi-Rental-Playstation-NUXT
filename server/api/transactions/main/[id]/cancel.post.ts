import { and, eq } from 'drizzle-orm'
import { transactions } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [tx] = await db.select().from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.status, 'active')))
  if (!tx) throw createError({ statusCode: 422, statusMessage: 'Transaksi tidak aktif' })

  await db.update(transactions).set({ status: 'cancelled', endedAt: new Date() }).where(eq(transactions.id, id))

  if (tx.roomId) {
    await setRoomAssetsStatus(db, tx.roomId, 'ready')
  }

  return { ok: true }
})
