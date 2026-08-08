import { eq } from 'drizzle-orm'
import { rentalPackages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const durationDays = Number(body.durationDays)
  const price = String(body.price || '0')
  if (!name || !durationDays || durationDays < 0.5 || durationDays > 365 || Number(price) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data paket tidak valid (min 0.5 hari / 12 jam)' })
  }

  await db.update(rentalPackages).set({ name, durationDays, price, isActive: body.isActive !== false }).where(eq(rentalPackages.id, id))
  return { ok: true }
})
