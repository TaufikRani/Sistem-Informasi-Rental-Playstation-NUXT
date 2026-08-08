import { rentalPackages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const durationDays = Number(body.durationDays)
  const price = String(body.price || '0')
  if (!name || !durationDays || durationDays < 0.5 || durationDays > 365 || Number(price) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data paket tidak valid (min 0.5 hari / 12 jam)' })
  }

  const [row] = await db.insert(rentalPackages).values({
    name,
    durationDays,
    price,
    isActive: body.isActive !== false,
  }).$returningId()

  return { id: row.id }
})
