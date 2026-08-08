import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const current = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (current.id === id) {
    throw createError({ statusCode: 422, statusMessage: 'Tidak dapat menghapus akun sendiri' })
  }

  await db.delete(users).where(eq(users.id, id))
  return { ok: true }
})
