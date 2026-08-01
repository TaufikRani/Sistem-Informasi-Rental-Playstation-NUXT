import { customers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  if (!name) {
    throw createError({ statusCode: 422, statusMessage: 'Nama customer wajib diisi' })
  }

  const [row] = await db.insert(customers).values({
    name,
    phone: body.phone ? String(body.phone).trim() : null,
    address: body.address ? String(body.address).trim() : null,
    identityNumber: body.identityNumber ? String(body.identityNumber).trim() : null,
  }).$returningId()

  return { id: row.id }
})
