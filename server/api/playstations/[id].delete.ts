import { eq } from 'drizzle-orm'
import { playstations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(playstations).where(eq(playstations.id, id))
  return { ok: true }
})
