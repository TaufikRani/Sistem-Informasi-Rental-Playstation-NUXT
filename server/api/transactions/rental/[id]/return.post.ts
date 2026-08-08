import { eq, and, inArray } from 'drizzle-orm'
import { transactions, transactionDetails, rentals, playstations, controllers, products, stockMovements, penaltyRates } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  const [tx] = await db.select().from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.status, 'waiting_return'), eq(transactions.transactionType, 'RENTAL')))
  if (!tx) throw createError({ statusCode: 422, statusMessage: 'Transaksi tidak ditemukan atau sudah dikembalikan' })

  const [rental] = await db.select().from(rentals).where(eq(rentals.transactionId, id))
  if (!rental) throw createError({ statusCode: 422, statusMessage: 'Data rental tidak ditemukan' })

  const now = new Date()
  const dueDate = new Date(rental.dueDate)
  const lateMs = now.getTime() - dueDate.getTime()
  const lateHours = lateMs > 0 ? Math.ceil(lateMs / 3600000) : 0

  const [rate] = await db.select().from(penaltyRates).where(and(eq(penaltyRates.type, 'hourly'), eq(penaltyRates.isActive, true))).limit(1)
  const hourlyPenalty = Number(rate?.amount || 0)
  const penaltyAmount = lateHours * hourlyPenalty

  const items = await db.select().from(transactionDetails).where(eq(transactionDetails.transactionId, id))
  let subtotal = items.reduce((sum, it) => sum + Number(it.subtotal), 0)

  if (lateHours > 0) {
    const [existing] = await db.select().from(transactionDetails)
      .where(and(eq(transactionDetails.transactionId, id), eq(transactionDetails.itemType, 'PENALTY')))
    if (existing) {
      await db.update(transactionDetails).set({
        qty: String(lateHours),
        subtotal: String(penaltyAmount),
        itemName: `Denda keterlambatan (${lateHours} jam)`,
      }).where(eq(transactionDetails.id, existing.id))
    } else {
      await db.insert(transactionDetails).values({
        transactionId: id,
        itemType: 'PENALTY',
        itemName: `Denda keterlambatan (${lateHours} jam)`,
        qty: String(lateHours),
        unit: 'JAM',
        unitPrice: String(hourlyPenalty),
        subtotal: String(penaltyAmount),
      })
    }
    subtotal += penaltyAmount
  }

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

  await db.update(rentals).set({
    returnDate: now,
    lateHours: String(lateHours),
    penaltyAmount: String(penaltyAmount),
  }).where(eq(rentals.id, rental.id))

  await db.update(playstations).set({ status: 'ready' }).where(eq(playstations.id, rental.playstationId))
  if (rental.controllerId) {
    const ids = rental.controllerId.split(',').map(Number).filter(n => n > 0)
    if (ids.length > 0) {
      await db.update(controllers).set({ status: 'ready' }).where(inArray(controllers.id, ids))
    }
  }

  const itemsAfter = await db.select().from(transactionDetails).where(eq(transactionDetails.transactionId, id))
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

  return { ok: true, invoiceNumber: tx.invoiceNumber, lateHours, penaltyAmount, grandTotal, changeAmount: amountPaid - grandTotal }
})
