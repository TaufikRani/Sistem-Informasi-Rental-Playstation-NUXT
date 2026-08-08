import { playRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const hourlyRate = String(body.hourlyRate || '0')
  if (!name || Number(hourlyRate) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data tarif tidak valid' })
  }

  const [row] = await db.insert(playRates).values({
    name,
    hourlyRate,
    isActive: body.isActive !== false,
  }).$returningId()

  return { id: row.id }
})
