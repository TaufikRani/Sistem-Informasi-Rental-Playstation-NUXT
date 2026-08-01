import { eq } from 'drizzle-orm'
import { televisions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(televisions).where(eq(televisions.id, id))
  return { ok: true }
})
