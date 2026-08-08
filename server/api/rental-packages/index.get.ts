import { desc } from 'drizzle-orm'
import { rentalPackages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(rentalPackages).orderBy(desc(rentalPackages.id))
})
