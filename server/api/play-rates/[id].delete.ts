import { eq } from 'drizzle-orm'
import { playRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(playRates).where(eq(playRates.id, id))
  return { ok: true }
})
