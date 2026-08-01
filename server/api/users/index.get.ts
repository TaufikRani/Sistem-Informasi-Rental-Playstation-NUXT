import { asc } from 'drizzle-orm'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()
  const rows = await db.select({
    id: users.id,
    name: users.name,
    username: users.username,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users).orderBy(asc(users.name))
  return rows
})
