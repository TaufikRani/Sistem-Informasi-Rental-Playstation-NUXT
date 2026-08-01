import { eq } from 'drizzle-orm'
import { controllers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(controllers).where(eq(controllers.id, id))
  return { ok: true }
})
