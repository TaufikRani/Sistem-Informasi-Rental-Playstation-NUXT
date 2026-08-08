import { eq } from 'drizzle-orm'
import { playRates, rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [pr] = await db.select().from(playRates).where(eq(playRates.id, id))
  if (!pr) throw createError({ statusCode: 404, statusMessage: 'Tarif tidak ditemukan' })

  const used = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.playRateId, id)).limit(1)
  if (used.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Lepas dari room terlebih dahulu sebelum menghapus.' })
  }

  await db.delete(playRates).where(eq(playRates.id, id))
  return { ok: true }
})
