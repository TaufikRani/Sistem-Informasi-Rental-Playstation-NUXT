import { controllers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const assetCode = String(body.assetCode || '').trim()
  const controllerNumber = String(body.controllerNumber || '').trim()
  if (!assetCode || !controllerNumber) {
    throw createError({ statusCode: 422, statusMessage: 'Kode aset dan nomor stick wajib diisi' })
  }

  const [row] = await db.insert(controllers).values({
    roomId: body.roomId ? Number(body.roomId) : null,
    assetCode,
    controllerNumber,
    condition: String(body.condition || 'good'),
    status: String(body.status || 'ready'),
    notes: body.notes ? String(body.notes) : null,
  }).$returningId()

  return { id: row.id }
})
