import { desc } from 'drizzle-orm'
import { playRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(playRates).orderBy(desc(playRates.id))
})
