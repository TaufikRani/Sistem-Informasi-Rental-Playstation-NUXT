import { asc } from 'drizzle-orm'
import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(rooms).orderBy(asc(rooms.name))
})
