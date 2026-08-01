import { eq } from 'drizzle-orm'
import { penaltyRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const hourlyPenalty = String(body.hourlyPenalty || '0')
  if (Number(hourlyPenalty) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Denda tidak valid' })
  }

  const rows = await db.select().from(penaltyRates).limit(1)
  if (rows.length) {
    await db.update(penaltyRates).set({ hourlyPenalty }).where(eq(penaltyRates.id, rows[0].id))
  } else {
    await db.insert(penaltyRates).values({ hourlyPenalty })
  }
  return { ok: true }
})
