import { eq } from 'drizzle-orm'
import { playstations, televisions, controllers } from '../../../../db/schema'

const tables: Record<string, any> = {
  playstation: playstations,
  television: televisions,
  controller: controllers,
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const type = getRouterParam(event, 'type')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const table = tables[type!]
  if (!table) throw createError({ statusCode: 404, statusMessage: 'Tipe perangkat tidak valid' })

  const [device] = await db.select().from(table).where(eq(table.id, id))
  if (!device) throw createError({ statusCode: 404, statusMessage: 'Perangkat tidak ditemukan' })

  const roomId = body.roomId === null ? null : Number(body.roomId)

  await db.update(table).set({ roomId } as any).where(eq(table.id, id))
  return { ok: true }
})
