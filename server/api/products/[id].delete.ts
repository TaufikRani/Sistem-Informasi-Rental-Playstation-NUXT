import { eq, and, ne } from 'drizzle-orm'
import { products, transactionDetails, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const prod = await db.select({ stock: products.stock }).from(products).where(eq(products.id, id)).limit(1)
  if (prod.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }
  if (prod[0].stock > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const detail = await db.select({ id: transactionDetails.id })
    .from(transactionDetails)
    .innerJoin(transactions, eq(transactionDetails.transactionId, transactions.id))
    .where(and(
      eq(transactionDetails.referenceId, id),
      eq(transactionDetails.itemType, 'PRODUCT'),
      ne(transactions.status, 'cancelled')
    ))
    .limit(1)
  if (detail.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  await db.delete(products).where(eq(products.id, id))
  return { ok: true }
})
