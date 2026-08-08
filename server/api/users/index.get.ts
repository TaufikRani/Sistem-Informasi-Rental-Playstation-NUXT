import { desc } from 'drizzle-orm'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const rows = await db.select({
    id: users.id,
    name: users.name,
    username: users.username,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).orderBy(desc(users.updatedAt))
  return rows
})
