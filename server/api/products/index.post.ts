import { sql } from 'drizzle-orm'
import { products, stockMovements } from '../../db/schema'

async function nextProductCode(db: ReturnType<typeof useDb>) {
  const rows = await db.select({ code: products.productCode })
    .from(products)
    .where(sql`${products.productCode} LIKE 'PDT-%'`)
  let max = 0
  for (const r of rows) {
    const n = parseInt(String(r.code).replace('PDT-', ''), 10)
    if (!isNaN(n) && n > max) max = n
  }
  return `PDT-${String(max + 1).padStart(3, '0')}`
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const name = String(body.name || '').trim()
  const category = String(body.category || '').trim()
  const price = String(body.price || '0')
  if (!name || !category || Number(price) < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data produk tidak valid' })
  }

  const productCode = String(body.productCode || '').trim() || await nextProductCode(db)

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

  return { id: row.id, productCode }
})
