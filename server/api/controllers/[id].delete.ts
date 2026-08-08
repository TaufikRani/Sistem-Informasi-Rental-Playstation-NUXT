import { eq, and, sql } from 'drizzle-orm'
import { controllers, rentals, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const ctrl = await db.select({ status: controllers.status, roomId: controllers.roomId }).from(controllers).where(eq(controllers.id, id)).limit(1)
  if (ctrl.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Stick tidak ditemukan' })
  }
  if (ctrl[0].status === 'in_use' || ctrl[0].status === 'rented') {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const activeRental = await db.select({ id: rentals.id })
    .from(rentals)
    .innerJoin(transactions, eq(rentals.transactionId, transactions.id))
    .where(and(sql`FIND_IN_SET(${id}, ${rentals.controllerId}) > 0`, eq(transactions.status, 'waiting_return')))
    .limit(1)
  if (activeRental.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  if (ctrl[0].roomId) {
    throw createError({ statusCode: 422, statusMessage: 'Lepas dari room terlebih dahulu sebelum menghapus.' })
  }

  await db.delete(controllers).where(eq(controllers.id, id))
  return { ok: true }
})
