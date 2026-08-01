import { eq } from 'drizzle-orm'
import { controllers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const assetCode = String(body.assetCode || '').trim()
  const controllerNumber = String(body.controllerNumber || '').trim()
  if (!assetCode || !controllerNumber) {
    throw createError({ statusCode: 422, statusMessage: 'Kode aset dan nomor stick wajib diisi' })
  }

  await db.update(controllers).set({
    roomId: body.roomId ? Number(body.roomId) : null,
    assetCode,
    controllerNumber,
    condition: String(body.condition || 'good'),
    status: String(body.status || 'ready'),
    notes: body.notes ? String(body.notes) : null,
  }).where(eq(controllers.id, id))

  return { ok: true }
})
