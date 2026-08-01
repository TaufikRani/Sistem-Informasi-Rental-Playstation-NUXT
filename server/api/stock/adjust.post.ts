import { eq } from 'drizzle-orm'
import { products, stockMovements } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const productId = Number(body.productId)
  const movementType = body.movementType === 'IN' ? 'IN' : 'CORRECTION'
  const qty = Math.abs(Number(body.qty)) || 0
  if (!productId || qty === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data penyesuaian stok tidak valid' })
  }

  const product = await db.query.products.findFirst({ where: eq(products.id, productId) })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })

  let newStock = product.stock
  if (movementType === 'IN') {
    newStock = product.stock + qty
  } else {
    newStock = Math.max(0, product.stock - qty)
  }

  await db.update(products).set({ stock: newStock }).where(eq(products.id, productId))
  await db.insert(stockMovements).values({
    productId,
    movementType,
    qty: movementType === 'IN' ? qty : -qty,
    stockAfter: newStock,
    notes: body.notes ? String(body.notes) : null,
    createdBy: user.id,
  })

  return { ok: true, stock: newStock }
})
