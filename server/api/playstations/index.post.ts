import { sql } from 'drizzle-orm'
import { playstations } from '../../db/schema'

async function nextPS(db: ReturnType<typeof useDb>) {
  const rows = await db.select({ code: playstations.assetCode })
    .from(playstations)
    .where(sql`${playstations.assetCode} LIKE 'PS-%'`)
  let max = 0
  for (const r of rows) {
    const n = parseInt(String(r.code).replace('PS-', ''), 10)
    if (!isNaN(n) && n > max) max = n
  }
  return `PS-${String(max + 1).padStart(3, '0')}`
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  if (!name) throw createError({ statusCode: 422, statusMessage: 'Nama PlayStation wajib diisi' })

  const assetCode = String(body.assetCode || '').trim() || await nextPS(db)

  const [row] = await db.insert(playstations).values({
    roomId: body.roomId ? Number(body.roomId) : null,
    assetCode,
    name,
    series: body.series ? String(body.series) : null,
    brand: body.brand ? String(body.brand) : null,
    serialNumber: body.serialNumber ? String(body.serialNumber) : null,
    purchaseDate: body.purchaseDate || null,
    condition: String(body.condition || 'good'),
    status: String(body.status || 'ready'),
    notes: body.notes ? String(body.notes) : null,
  }).$returningId()

  return { id: row.id, assetCode }
})
