import { playstations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const assetCode = String(body.assetCode || '').trim()
  const name = String(body.name || '').trim()
  if (!assetCode || !name) {
    throw createError({ statusCode: 422, statusMessage: 'Kode aset dan nama wajib diisi' })
  }

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

  return { id: row.id }
})
