import { eq } from 'drizzle-orm'
import { rentalPackages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  await db.delete(rentalPackages).where(eq(rentalPackages.id, id))
  return { ok: true }
})
