import { and, eq } from 'drizzle-orm'
import { transactions, transactionDetails } from '../../../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const itemId = Number(getRouterParam(event, 'itemId'))
  const db = useDb()

  const [tx] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.status, 'active')))
  if (!tx) throw createError({ statusCode: 422, statusMessage: 'Transaksi tidak aktif' })

  const [item] = await db.select().from(transactionDetails)
    .where(and(eq(transactionDetails.id, itemId), eq(transactionDetails.transactionId, id)))
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Item tidak ditemukan' })
  if (item.itemType === 'MAIN') throw createError({ statusCode: 422, statusMessage: 'Item utama tidak dapat dihapus' })

  await db.delete(transactionDetails).where(eq(transactionDetails.id, itemId))
  return { ok: true }
})
