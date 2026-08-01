import { eq } from 'drizzle-orm'
import { customers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(customers).where(eq(customers.id, id))
  return { ok: true }
})
