import { sql } from 'drizzle-orm'
import { controllers } from '../../db/schema'

async function nextStick(db: ReturnType<typeof useDb>) {
  const rows = await db.select({ code: controllers.assetCode })
    .from(controllers)
    .where(sql`${controllers.assetCode} LIKE 'STK-%'`)
  let max = 0
  for (const r of rows) {
    const n = parseInt(String(r.code).replace('STK-', ''), 10)
    if (!isNaN(n) && n > max) max = n
  }
  return `STK-${String(max + 1).padStart(2, '0')}`
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const controllerNumber = String(body.controllerNumber || '').trim()
  if (!controllerNumber) throw createError({ statusCode: 422, statusMessage: 'Nomor stick wajib diisi' })

  const assetCode = String(body.assetCode || '').trim() || await nextStick(db)

  const [row] = await db.insert(controllers).values({
    roomId: body.roomId ? Number(body.roomId) : null,
    assetCode,
    controllerNumber,
    condition: String(body.condition || 'good'),
    status: String(body.status || 'ready'),
    notes: body.notes ? String(body.notes) : null,
  }).$returningId()

  return { id: row.id, assetCode }
})
