import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const roomType = String(body.roomType || '').trim()
  if (!name || !roomType) {
    throw createError({ statusCode: 422, statusMessage: 'Nama dan jenis room wajib diisi' })
  }

  const [room] = await db.insert(rooms).values({ name, roomType }).$returningId()
  return { id: room.id }
})
