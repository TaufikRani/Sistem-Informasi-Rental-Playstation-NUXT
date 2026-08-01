import { penaltyRates } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const rows = await db.select().from(penaltyRates).limit(1)
  if (!rows.length) {
    const [row] = await db.insert(penaltyRates).values({ hourlyPenalty: '0' }).$returningId()
    return { id: row.id, hourlyPenalty: '0' }
  }
  return rows[0]
})
