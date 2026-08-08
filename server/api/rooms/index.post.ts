import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  if (!name) {
    throw createError({ statusCode: 422, statusMessage: 'Nama room wajib diisi' })
  }
  const playRateId = body.playRateId ? Number(body.playRateId) : null

  const [room] = await db.insert(rooms).values({ name, playRateId }).$returningId()
  return { id: room.id }
})
