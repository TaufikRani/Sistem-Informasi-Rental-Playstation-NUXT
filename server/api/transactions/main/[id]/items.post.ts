import { and, eq } from 'drizzle-orm'
import { transactions, transactionDetails, products } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const [tx] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.status, 'active')))
  if (!tx) throw createError({ statusCode: 422, statusMessage: 'Transaksi tidak aktif' })

  const qty = Math.max(1, Number(body.qty) || 1)
  let itemType = 'SERVICE'
  let itemName = String(body.name || '').trim()
  let unitPrice = Number(body.unitPrice || 0)
  let referenceId: number | null = null

  if (body.productId) {
    const product = await db.query.products.findFirst({ where: eq(products.id, Number(body.productId)) })
    if (!product || !product.isActive) throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
    if (product.category === 'service') {
      itemType = 'SERVICE'
    } else {
      itemType = 'PRODUCT'
      if (product.stock < qty) throw createError({ statusCode: 422, statusMessage: `Stok ${product.name} tidak cukup (sisa ${product.stock})` })
    }
    itemName = product.name
    unitPrice = Number(product.price)
    referenceId = product.id
  }

  if (!itemName || unitPrice < 0) {
    throw createError({ statusCode: 422, statusMessage: 'Data item tidak valid' })
  }

  const existing = await db.select().from(transactionDetails)
    .where(and(eq(transactionDetails.transactionId, id), eq(transactionDetails.referenceId, referenceId ?? -1)))

  if (body.productId && existing.length) {
    const e = existing[0]
    const newQty = Number(e.qty) + qty
    const newSubtotal = Math.round(newQty * unitPrice)
    await db.update(transactionDetails).set({ qty: String(newQty), subtotal: String(newSubtotal) })
      .where(eq(transactionDetails.id, e.id))
    return { ok: true }
  }

  await db.insert(transactionDetails).values({
    transactionId: id,
    itemType,
    referenceId,
    itemName,
    qty: String(qty),
    unit: itemType === 'PRODUCT' ? 'PCS' : 'ITEM',
    unitPrice: String(unitPrice),
    subtotal: String(Math.round(qty * unitPrice)),
  })

  return { ok: true }
})
