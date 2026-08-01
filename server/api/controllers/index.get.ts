import { asc } from 'drizzle-orm'
import { controllers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(controllers).orderBy(asc(controllers.assetCode))
})
