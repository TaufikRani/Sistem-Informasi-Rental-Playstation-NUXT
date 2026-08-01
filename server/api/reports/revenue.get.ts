import { and, eq, gte, lte, sum, count, sql } from 'drizzle-orm'
import { transactions, transactionDetails, rentals } from '../../db/schema'

function getRange(type: string, date: string) {
  const d = date ? new Date(date) : new Date()
  if (type === 'month') {
    return {
      from: new Date(d.getFullYear(), d.getMonth(), 1),
      to: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    }
  }
  if (type === 'year') {
    return {
      from: new Date(d.getFullYear(), 0, 1),
      to: new Date(d.getFullYear(), 11, 31, 23, 59, 59),
    }
  }
  return {
    from: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    to: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59),
  }
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const query = getQuery(event)
  const type = ['day', 'month', 'year'].includes(String(query.type)) ? String(query.type) : 'day'
  const { from, to } = getRange(type, String(query.date || ''))

  const completedTx = db.select({
    id: transactions.id,
    invoiceNumber: transactions.invoiceNumber,
    transactionType: transactions.transactionType,
    grandTotal: transactions.grandTotal,
    createdAt: transactions.createdAt,
  }).from(transactions)
    .where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))

  const [txs, revenueRows, productRows, rentalStats, mainStats] = await Promise.all([
    completedTx,
    db.select({
      type: transactions.transactionType,
      total: sum(transactions.grandTotal),
    }).from(transactions)
      .where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
      .groupBy(transactions.transactionType),
    db.select({
      productName: transactionDetails.itemName,
      qty: sum(transactionDetails.qty),
      omzet: sum(transactionDetails.subtotal),
    }).from(transactionDetails)
      .innerJoin(transactions, eq(transactionDetails.transactionId, transactions.id))
      .where(and(
        eq(transactionDetails.itemType, 'PRODUCT'),
        eq(transactions.status, 'completed'),
        gte(transactions.createdAt, from),
        lte(transactions.createdAt, to),
      ))
      .groupBy(transactionDetails.itemName),
    db.select({
      status: transactions.status,
      count: count(),
      penalty: sum(rentals.penaltyAmount),
    }).from(transactions)
      .innerJoin(rentals, eq(rentals.transactionId, transactions.id))
      .where(and(eq(transactions.transactionType, 'RENTAL'), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
      .groupBy(transactions.status),
    db.select({
      count: count(),
      totalHours: sum(transactions.durationMinutes),
      total: sum(transactions.grandTotal),
    }).from(transactions)
      .where(and(
        eq(transactions.transactionType, 'MAIN'),
        eq(transactions.status, 'completed'),
        gte(transactions.createdAt, from),
        lte(transactions.createdAt, to),
      )),
  ])

  const revenueMap: Record<string, number> = { MAIN: 0, RENTAL: 0 }
  for (const r of revenueRows) revenueMap[r.type] = Number(r.total || 0)

  const penaltyTotal = rentalStats.reduce((s, r) => s + Number(r.penalty || 0), 0)
  const productTotal = productRows.reduce((s, r) => s + Number(r.omzet || 0), 0)

  const rentalActive = rentalStats.find((r) => r.status === 'waiting_return')?.count || 0
  const rentalCompleted = rentalStats.find((r) => r.status === 'completed')?.count || 0

  return {
    type,
    from,
    to,
    revenue: {
      main: revenueMap.MAIN,
      rental: revenueMap.RENTAL,
      product: productTotal,
      penalty: penaltyTotal,
      total: revenueMap.MAIN + revenueMap.RENTAL + productTotal + penaltyTotal,
    },
    main: {
      count: Number(mainStats[0]?.count || 0),
      totalHours: Math.round(Number(mainStats[0]?.totalHours || 0) / 60),
      total: Number(mainStats[0]?.total || 0),
    },
    rental: {
      active: Number(rentalActive),
      completed: Number(rentalCompleted),
      lateCount: 0,
      penalty: penaltyTotal,
    },
    products: productRows.map((r) => ({ name: r.productName, qty: Number(r.qty), omzet: Number(r.omzet) })),
    transactions: txs,
  }
})
