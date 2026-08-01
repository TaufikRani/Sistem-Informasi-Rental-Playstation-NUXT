import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const username = String(body.username || '').trim()
  const role = String(body.role || 'cashier')
  if (!name || !username) {
    throw createError({ statusCode: 422, statusMessage: 'Nama dan username wajib diisi' })
  }

  const set: Record<string, unknown> = { name, username, role, isActive: body.isActive !== false }
  if (body.password) {
    if (String(body.password).length < 6) {
      throw createError({ statusCode: 422, statusMessage: 'Password minimal 6 karakter' })
    }
    set.passwordHash = hashUserPassword(String(body.password))
  }

  await db.update(users).set(set).where(eq(users.id, id))
  return { ok: true }
})
