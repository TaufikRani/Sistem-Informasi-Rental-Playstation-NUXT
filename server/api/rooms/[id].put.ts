import { eq } from 'drizzle-orm'
import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const [current] = await db.select().from(rooms).where(eq(rooms.id, id))
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Room tidak ditemukan' })

  const name = body.name !== undefined ? String(body.name).trim() : current.name
  const playRateId = body.playRateId !== undefined ? (body.playRateId ? Number(body.playRateId) : null) : current.playRateId
  const status = body.status !== undefined ? String(body.status).trim() : current.status
  if (!name) {
    throw createError({ statusCode: 422, statusMessage: 'Nama room wajib diisi' })
  }

  await db.update(rooms).set({ name, playRateId, status }).where(eq(rooms.id, id))
  return { ok: true }
})
