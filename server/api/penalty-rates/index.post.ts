import { penaltyRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const type = String(body.type || 'hourly')
  const amount = String(body.amount || '0')
  if (!name || Number(amount) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Nama dan tarif denda wajib diisi' })
  }
  if (!['hourly', 'daily', 'fixed'].includes(type)) {
    throw createError({ statusCode: 422, statusMessage: 'Tipe denda tidak valid' })
  }

  const [row] = await db.insert(penaltyRates).values({
    name,
    type,
    amount,
    isActive: body.isActive !== false,
  }).$returningId()

  return { id: row.id }
})
