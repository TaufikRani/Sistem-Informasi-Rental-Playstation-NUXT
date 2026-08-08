import { desc } from 'drizzle-orm'
import { televisions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(televisions).orderBy(desc(televisions.updatedAt))
})
