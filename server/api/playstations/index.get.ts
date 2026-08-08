import { desc, sql } from 'drizzle-orm'
import { playstations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return await db.select({
    id: playstations.id,
    roomId: playstations.roomId,
    assetCode: playstations.assetCode,
    name: playstations.name,
    series: playstations.series,
    brand: playstations.brand,
    serialNumber: playstations.serialNumber,
    purchaseDate: playstations.purchaseDate,
    condition: playstations.condition,
    status: playstations.status,
    notes: playstations.notes,
    createdAt: playstations.createdAt,
    updatedAt: playstations.updatedAt,
    roomName: sql`(SELECT name FROM rooms r WHERE r.id = playstations.room_id LIMIT 1)`.as('roomName'),
  }).from(playstations).orderBy(desc(playstations.updatedAt))
})
