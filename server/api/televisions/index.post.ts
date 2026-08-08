import { sql } from 'drizzle-orm'
import { televisions } from '../../db/schema'

async function nextTV(db: ReturnType<typeof useDb>) {
  const rows = await db.select({ code: televisions.assetCode })
    .from(televisions)
    .where(sql`${televisions.assetCode} LIKE 'TV-%'`)
  let max = 0
  for (const r of rows) {
    const n = parseInt(String(r.code).replace('TV-', ''), 10)
    if (!isNaN(n) && n > max) max = n
  }
  return `TV-${String(max + 1).padStart(3, '0')}`
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  if (!name) throw createError({ statusCode: 422, statusMessage: 'Nama TV wajib diisi' })

  const assetCode = String(body.assetCode || '').trim() || await nextTV(db)

  const [row] = await db.insert(televisions).values({
    roomId: body.roomId ? Number(body.roomId) : null,
    assetCode,
    name,
    size: body.size ? String(body.size) : null,
    serialNumber: body.serialNumber ? String(body.serialNumber) : null,
    status: String(body.status || 'ready'),
    notes: body.notes ? String(body.notes) : null,
  }).$returningId()

  return { id: row.id, assetCode }
})
