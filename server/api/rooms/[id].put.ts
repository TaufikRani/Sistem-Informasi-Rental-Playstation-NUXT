import { eq } from 'drizzle-orm'
import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const roomType = String(body.roomType || '').trim()
  const status = String(body.status || 'ready').trim()
  if (!name || !roomType) {
    throw createError({ statusCode: 422, statusMessage: 'Nama dan jenis room wajib diisi' })
  }

  await db.update(rooms).set({ name, roomType, status }).where(eq(rooms.id, id))
  return { ok: true }
})
