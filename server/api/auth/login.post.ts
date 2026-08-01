import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = (body.username || '').trim()
  const password = body.password || ''

  if (!username || !password) {
    throw createError({ statusCode: 422, statusMessage: 'Username dan password wajib diisi' })
  }

  const db = useDb()
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user || !verifyUserPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
  }

  if (!user.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Akun dinonaktifkan' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role as 'admin' | 'cashier',
    },
  })

  return { ok: true }
})
