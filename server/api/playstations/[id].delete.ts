import { eq, and } from 'drizzle-orm'
import { playstations, rentals, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const ps = await db.select({ status: playstations.status, roomId: playstations.roomId }).from(playstations).where(eq(playstations.id, id)).limit(1)
  if (ps.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'PlayStation tidak ditemukan' })
  }
  if (ps[0].status === 'in_use' || ps[0].status === 'rented') {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const activeRental = await db.select({ id: rentals.id })
    .from(rentals)
    .innerJoin(transactions, eq(rentals.transactionId, transactions.id))
    .where(and(eq(rentals.playstationId, id), eq(transactions.status, 'waiting_return')))
    .limit(1)
  if (activeRental.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  if (ps[0].roomId) {
    throw createError({ statusCode: 422, statusMessage: 'Lepas dari room terlebih dahulu sebelum menghapus.' })
  }

  await db.delete(playstations).where(eq(playstations.id, id))
  return { ok: true }
})
