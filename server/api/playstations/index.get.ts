import { asc } from 'drizzle-orm'
import { playstations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(playstations).orderBy(asc(playstations.assetCode))
})
