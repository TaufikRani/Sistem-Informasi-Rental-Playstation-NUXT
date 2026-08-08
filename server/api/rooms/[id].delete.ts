import { eq, and } from 'drizzle-orm'
import { rooms, playstations, televisions, controllers, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const room = await db.select({ status: rooms.status }).from(rooms).where(eq(rooms.id, id)).limit(1)
  if (room.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Room tidak ditemukan' })
  }
  if (room[0].status === 'occupied') {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const ps = await db.select({ id: playstations.id }).from(playstations).where(eq(playstations.roomId, id)).limit(1)
  if (ps.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const tv = await db.select({ id: televisions.id }).from(televisions).where(eq(televisions.roomId, id)).limit(1)
  if (tv.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const ctrl = await db.select({ id: controllers.id }).from(controllers).where(eq(controllers.roomId, id)).limit(1)
  if (ctrl.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  const txn = await db.select({ id: transactions.id }).from(transactions).where(and(eq(transactions.roomId, id), eq(transactions.status, 'active'))).limit(1)
  if (txn.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  await db.delete(rooms).where(eq(rooms.id, id))
  return { ok: true }
})
