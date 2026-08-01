import { and, eq } from 'drizzle-orm'
import { transactions, transactionDetails, products, stockMovements } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const [tx] = await db.select().from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.status, 'active'), eq(transactions.transactionType, 'MAIN')))
  if (!tx) throw createError({ statusCode: 422, statusMessage: 'Transaksi tidak ditemukan atau sudah selesai' })

  const now = new Date()
  const durationMinutes = Math.max(1, Math.round((now.getTime() - new Date(tx.startedAt).getTime()) / 60000))
  const hours = Math.ceil(durationMinutes / 60)

  const items = await db.select().from(transactionDetails).where(eq(transactionDetails.transactionId, id))

  for (const item of items) {
    if (item.itemType === 'MAIN') {
      const unitPrice = Number(item.unitPrice)
      const subtotal = hours * unitPrice
      await db.update(transactionDetails).set({ qty: String(hours), subtotal: String(subtotal) })
        .where(eq(transactionDetails.id, item.id))
    }
  }

  const itemsAfter = await db.select().from(transactionDetails).where(eq(transactionDetails.transactionId, id))
  const subtotal = itemsAfter.reduce((sum, it) => sum + Number(it.subtotal), 0)

  let discountAmount = 0
  let discountType = 'none'
  let discountValue = '0'
  const discountInput = body.discountType || 'none'
  if (discountInput === 'nominal') {
    discountAmount = Math.min(subtotal, Math.max(0, Number(body.discountValue) || 0))
    discountValue = String(discountAmount)
    discountType = 'nominal'
  } else if (discountInput === 'percent') {
    const pct = Math.min(100, Math.max(0, Number(body.discountValue) || 0))
    discountAmount = Math.round(subtotal * pct / 100)
    discountValue = String(pct)
    discountType = 'percent'
  }

  const grandTotal = Math.max(0, subtotal - discountAmount)
  const amountPaid = Number(body.amountPaid) || 0
  const paymentMethod = ['cash', 'transfer', 'qris'].includes(body.paymentMethod) ? body.paymentMethod : 'cash'
  if (amountPaid < grandTotal) {
    throw createError({ statusCode: 422, statusMessage: `Pembayaran kurang: tagihan ${grandTotal}, dibayar ${amountPaid}` })
  }

  await db.update(transactions).set({
    status: 'completed',
    endedAt: now,
    durationMinutes,
    subtotal: String(subtotal),
    discountType,
    discountValue,
    discountAmount: String(discountAmount),
    grandTotal: String(grandTotal),
    paymentMethod,
    amountPaid: String(amountPaid),
    changeAmount: String(amountPaid - grandTotal),
    notes: body.notes ? String(body.notes) : tx.notes,
  }).where(eq(transactions.id, id))

  const productItems = itemsAfter.filter((it) => it.itemType === 'PRODUCT')
  for (const it of productItems) {
    if (!it.referenceId) continue
    const product = await db.query.products.findFirst({ where: eq(products.id, it.referenceId) })
    if (!product) continue
    const qty = Number(it.qty)
    const newStock = Math.max(0, product.stock - qty)
    await db.update(products).set({ stock: newStock }).where(eq(products.id, product.id))
    await db.insert(stockMovements).values({
      productId: product.id,
      movementType: 'OUT',
      qty,
      stockAfter: newStock,
      reference: tx.invoiceNumber,
      notes: `Penjualan ${it.itemName}`,
    })
  }

  if (tx.roomId) {
    await setRoomAssetsStatus(db, tx.roomId, 'ready')
  }

  return { ok: true, invoiceNumber: tx.invoiceNumber, grandTotal, changeAmount: amountPaid - grandTotal }
})
