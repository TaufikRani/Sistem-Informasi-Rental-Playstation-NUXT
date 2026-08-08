import { eq } from 'drizzle-orm'
import { playRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const hourlyRate = String(body.hourlyRate || '0')
  if (!name || Number(hourlyRate) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data tarif tidak valid' })
  }

  await db.update(playRates).set({ name, hourlyRate, isActive: body.isActive !== false }).where(eq(playRates.id, id))
  return { ok: true }
})
