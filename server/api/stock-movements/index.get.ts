import { desc, eq, sql } from 'drizzle-orm'
import { stockMovements } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const limit = Math.min(Number(getQuery(event).limit || 300), 500)

  const rows = await db.select({
    id: stockMovements.id,
    productId: stockMovements.productId,
    productName: sql`products.name`.as('productName'),
    productCode: sql`products.product_code`.as('productCode'),
    movementType: stockMovements.movementType,
    qty: stockMovements.qty,
    stockAfter: stockMovements.stockAfter,
    reference: stockMovements.reference,
    notes: stockMovements.notes,
    userName: sql`COALESCE(users.name, '-')`.as('userName'),
    createdAt: stockMovements.createdAt,
  }).from(stockMovements)
    .innerJoin(sql`products`, sql`products.id = stock_movements.product_id`)
    .leftJoin(sql`users`, sql`users.id = stock_movements.created_by`)
    .orderBy(desc(stockMovements.createdAt))
    .limit(limit)

  return rows
})
