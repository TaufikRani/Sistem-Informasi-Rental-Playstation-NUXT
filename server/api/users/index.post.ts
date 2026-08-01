import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  const role = String(body.role || 'cashier')
  if (!name || !username || !password || password.length < 6) {
    throw createError({ statusCode: 422, statusMessage: 'Nama, username, dan password (min 6 karakter) wajib diisi' })
  }

  const [row] = await db.insert(users).values({
    name,
    username,
    passwordHash: hashUserPassword(password),
    role,
    isActive: body.isActive !== false,
  }).$returningId()

  return { id: row.id }
})
