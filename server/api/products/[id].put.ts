import { eq } from 'drizzle-orm'
import { products } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const productCode = String(body.productCode || '').trim()
  const name = String(body.name || '').trim()
  const category = String(body.category || '').trim()
  const price = String(body.price || '0')
  if (!productCode || !name || !category || Number(price) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data produk tidak valid' })
  }

  await db.update(products).set({
    productCode,
    category,
    name,
    price,
    minimumStock: Math.max(0, Number(body.minimumStock) || 0),
    isActive: body.isActive !== false,
  }).where(eq(products.id, id))

  return { ok: true }
})
