import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const current = await requireUser(event)
  if (current.id === id) {
    throw createError({ statusCode: 422, statusMessage: 'Tidak dapat menghapus akun sendiri' })
  }

  await db.delete(users).where(eq(users.id, id))
  return { ok: true }
})
