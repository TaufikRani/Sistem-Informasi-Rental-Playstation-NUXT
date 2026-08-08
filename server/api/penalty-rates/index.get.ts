import { desc } from 'drizzle-orm'
import { penaltyRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(penaltyRates).orderBy(desc(penaltyRates.updatedAt))
})
