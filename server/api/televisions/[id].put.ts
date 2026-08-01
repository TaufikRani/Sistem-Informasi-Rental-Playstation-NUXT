import { eq } from 'drizzle-orm'
import { televisions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const assetCode = String(body.assetCode || '').trim()
  const name = String(body.name || '').trim()
  if (!assetCode || !name) {
    throw createError({ statusCode: 422, statusMessage: 'Kode aset dan nama wajib diisi' })
  }

  await db.update(televisions).set({
    roomId: body.roomId ? Number(body.roomId) : null,
    assetCode,
    name,
    size: body.size ? String(body.size) : null,
    serialNumber: body.serialNumber ? String(body.serialNumber) : null,
    status: String(body.status || 'ready'),
    notes: body.notes ? String(body.notes) : null,
  }).where(eq(televisions.id, id))

  return { ok: true }
})
