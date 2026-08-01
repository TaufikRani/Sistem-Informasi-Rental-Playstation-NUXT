import { eq } from 'drizzle-orm'
import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(rooms).where(eq(rooms.id, id))
  return { ok: true }
})
