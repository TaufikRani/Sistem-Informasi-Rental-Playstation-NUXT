import { asc, sql } from 'drizzle-orm'
import { rooms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  return await db.select({
    id: rooms.id,
    name: rooms.name,
    playRateId: rooms.playRateId,
    status: rooms.status,
    createdAt: rooms.createdAt,
    updatedAt: rooms.updatedAt,
    playRateName: sql`(SELECT name FROM play_rates pr WHERE pr.id = rooms.play_rate_id LIMIT 1)`.as('playRateName'),
    playstationName: sql`(SELECT name FROM playstations p WHERE p.room_id = rooms.id ORDER BY p.id LIMIT 1)`.as('playstationName'),
    playstationCode: sql`(SELECT asset_code FROM playstations p WHERE p.room_id = rooms.id ORDER BY p.id LIMIT 1)`.as('playstationCode'),
    playstationStatus: sql`(SELECT status FROM playstations p WHERE p.room_id = rooms.id ORDER BY p.id LIMIT 1)`.as('playstationStatus'),
  }).from(rooms).orderBy(asc(rooms.id))
})
