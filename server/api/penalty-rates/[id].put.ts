import { eq } from 'drizzle-orm'
import { penaltyRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
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

  await db.update(penaltyRates).set({ name, type, amount, isActive: body.isActive !== false }).where(eq(penaltyRates.id, id))
  return { ok: true }
})
