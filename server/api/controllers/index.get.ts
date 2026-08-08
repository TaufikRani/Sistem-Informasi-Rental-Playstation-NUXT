import { desc, sql } from 'drizzle-orm'
import { controllers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select({
    id: controllers.id,
    roomId: controllers.roomId,
    assetCode: controllers.assetCode,
    controllerNumber: controllers.controllerNumber,
    condition: controllers.condition,
    status: controllers.status,
    notes: controllers.notes,
    createdAt: controllers.createdAt,
    updatedAt: controllers.updatedAt,
    roomName: sql`(SELECT name FROM rooms r WHERE r.id = controllers.room_id LIMIT 1)`.as('roomName'),
  }).from(controllers).orderBy(desc(controllers.updatedAt))
})
