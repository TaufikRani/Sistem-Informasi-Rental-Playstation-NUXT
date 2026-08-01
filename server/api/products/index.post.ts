import { products, stockMovements } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const productCode = String(body.productCode || '').trim()
  const name = String(body.name || '').trim()
  const category = String(body.category || '').trim()
  const price = String(body.price || '0')
  if (!productCode || !name || !category || Number(price) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data produk tidak valid' })
  }

  const stock = Math.max(0, Number(body.stock) || 0)
  const minimumStock = Math.max(0, Number(body.minimumStock) || 0)

  const [row] = await db.insert(products).values({
    productCode,
    category,
    name,
    price,
    stock,
    minimumStock,
    isActive: body.isActive !== false,
  }).$returningId()

  if (stock > 0) {
    await db.insert(stockMovements).values({
      productId: row.id,
      movementType: 'IN',
      qty: stock,
      stockAfter: stock,
      notes: 'Stok awal',
    })
  }

  return { id: row.id }
})
