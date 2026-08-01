import { eq, and } from 'drizzle-orm'
import { rooms, playstations, televisions, controllers, transactions } from '../db/schema'

export type AssetType = 'playstation' | 'television' | 'controller'

const ASSET_TABLES = {
  playstation: playstations,
  television: televisions,
  controller: controllers,
} as const

export async function setRoomAssetsStatus(db: ReturnType<typeof useDb>, roomId: number, status: string) {
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) })
  if (!room) return

  await db.update(rooms).set({ status }).where(eq(rooms.id, roomId))

  const ps = await db.select().from(playstations).where(eq(playstations.roomId, roomId))
  for (const p of ps) {
    if (p.status === 'maintenance') continue
    if (status === 'ready' && p.status === 'in_use') {
      await db.update(playstations).set({ status: 'ready' }).where(eq(playstations.id, p.id))
    } else if (status === 'occupied' && p.status === 'ready') {
      await db.update(playstations).set({ status: 'in_use' }).where(eq(playstations.id, p.id))
    }
  }

  const tvs = await db.select().from(televisions).where(eq(televisions.roomId, roomId))
  for (const tv of tvs) {
    if (tv.status === 'maintenance') continue
    if (status === 'ready' && tv.status === 'in_use') {
      await db.update(televisions).set({ status: 'ready' }).where(eq(televisions.id, tv.id))
    } else if (status === 'occupied' && tv.status === 'ready') {
      await db.update(televisions).set({ status: 'in_use' }).where(eq(televisions.id, tv.id))
    }
  }

  const sticks = await db.select().from(controllers).where(eq(controllers.roomId, roomId))
  for (const s of sticks) {
    if (s.status === 'maintenance') continue
    if (status === 'ready' && s.status === 'in_use') {
      await db.update(controllers).set({ status: 'ready' }).where(eq(controllers.id, s.id))
    } else if (status === 'occupied' && s.status === 'ready') {
      await db.update(controllers).set({ status: 'in_use' }).where(eq(controllers.id, s.id))
    }
  }
}

export async function setAssetStatus(db: ReturnType<typeof useDb>, type: AssetType, id: number, status: string) {
  const table = ASSET_TABLES[type]
  await db.update(table).set({ status }).where(eq(table.id, id))
}

export function isMainActive(tx: { status: string }) {
  return tx.status === 'active'
}

export function findActiveMainByRoom(db: ReturnType<typeof useDb>, roomId: number) {
  return db.select().from(transactions)
    .where(and(eq(transactions.roomId, roomId), eq(transactions.status, 'active')))
    .limit(1)
}
