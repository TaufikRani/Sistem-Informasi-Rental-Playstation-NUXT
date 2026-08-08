import { eq, and } from 'drizzle-orm'
import { rentalPackages, rentals, transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const activeRental = await db.select({ id: rentals.id })
    .from(rentals)
    .innerJoin(transactions, eq(rentals.transactionId, transactions.id))
    .where(and(eq(rentals.packageId, id), eq(transactions.status, 'waiting_return')))
    .limit(1)
  if (activeRental.length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data ini sedang digunakan. Tidak dapat dihapus.' })
  }

  await db.delete(rentalPackages).where(eq(rentalPackages.id, id))
  return { ok: true }
})
