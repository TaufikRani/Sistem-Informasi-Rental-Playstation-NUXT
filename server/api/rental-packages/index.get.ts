import { asc } from 'drizzle-orm'
import { rentalPackages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select().from(rentalPackages).orderBy(asc(rentalPackages.durationDays))
})
