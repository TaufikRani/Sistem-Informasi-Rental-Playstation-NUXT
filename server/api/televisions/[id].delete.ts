import { eq } from 'drizzle-orm'
import { televisions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const tv = await db.select({
    id: televisions.id, status: televisions.status, roomId: televisions.roomId,
  }).from(televisions).where(eq(televisions.id, id)).limit(1)
  if (tv.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'TV tidak ditemukan' })
  }
  if (tv[0].status === 'in_use') {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }
  if (tv[0].roomId) {
    throw createError({ statusCode: 422, statusMessage: 'Lepas dari room terlebih dahulu sebelum menghapus.' })
  }

  await db.delete(televisions).where(eq(televisions.id, id))
  return { ok: true }
})
