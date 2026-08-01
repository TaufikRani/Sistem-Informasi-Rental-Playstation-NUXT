import { and, count, eq, gte, lt, sum, sql } from 'drizzle-orm'
import { products, rooms, transactions, transactionDetails, rentals, playstations, controllers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1)

  const [roomRows, mainActive, rentalActive, todayTx, monthTx, todayProduct, lowStock, lateRows] = await Promise.all([
    db.select({ status: rooms.status, count: count() }).from(rooms).groupBy(rooms.status),
    db.select({ count: count() }).from(transactions).where(and(eq(transactions.transactionType, 'MAIN'), eq(transactions.status, 'active'))),
    db.select({ count: count() }).from(transactions).where(and(eq(transactions.transactionType, 'RENTAL'), eq(transactions.status, 'waiting_return'))),
    db.select({
      revenue: sum(transactions.grandTotal),
      count: count(),
    }).from(transactions).where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, startOfDay))),
    db.select({
      revenue: sum(transactions.grandTotal),
    }).from(transactions).where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, startOfMonth))),
    db.select({ qty: sum(transactionDetails.qty) }).from(transactionDetails)
      .innerJoin(transactions, eq(transactionDetails.transactionId, transactions.id))
      .where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, startOfDay), eq(transactionDetails.itemType, 'PRODUCT'))),
    db.select().from(products).where(sql`stock <= minimum_stock`).orderBy(products.stock),
    db.select({
      id: rentals.id,
      invoiceNumber: transactions.invoiceNumber,
      dueDate: rentals.dueDate,
      customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
      playstationName: playstations.name,
    }).from(rentals)
      .innerJoin(transactions, eq(rentals.transactionId, transactions.id))
      .leftJoin(playstations, eq(rentals.playstationId, playstations.id))
      .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
      .where(and(lt(rentals.dueDate, new Date()), sql`return_date IS NULL`))
      .orderBy(rentals.dueDate),
  ])

  const roomCount: Record<string, number> = { ready: 0, occupied: 0, maintenance: 0 }
  for (const r of roomRows) {
    roomCount[r.status] = Number(r.count)
  }

  const [activeMains] = await Promise.all([
    db.select({
      id: transactions.id,
      invoiceNumber: transactions.invoiceNumber,
      roomName: rooms.name,
      startedAt: transactions.startedAt,
      customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
    }).from(transactions)
      .leftJoin(rooms, eq(transactions.roomId, rooms.id))
      .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
      .where(and(eq(transactions.transactionType, 'MAIN'), eq(transactions.status, 'active')))
      .orderBy(transactions.startedAt),
  ])

  const [activeRentals] = await Promise.all([
    db.select({
      id: transactions.id,
      invoiceNumber: transactions.invoiceNumber,
      dueDate: rentals.dueDate,
      customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
      playstationName: playstations.name,
    }).from(transactions)
      .innerJoin(rentals, eq(rentals.transactionId, transactions.id))
      .leftJoin(playstations, eq(rentals.playstationId, playstations.id))
      .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
      .where(and(eq(transactions.status, 'waiting_return')))
      .orderBy(rentals.dueDate),
  ])

  const [psStats, controllerStats] = await Promise.all([
    db.select({ status: playstations.status, count: count() }).from(playstations).groupBy(playstations.status),
    db.select({ status: controllers.status, count: count() }).from(controllers).groupBy(controllers.status),
  ])

  const countBy = (rows: { status: string; count: number }[]) => {
    const map: Record<string, number> = {}
    for (const r of rows) map[r.status] = Number(r.count)
    return map
  }

  return {
    rooms: {
      total: Object.values(roomCount).reduce((a, b) => a + b, 0),
      ...roomCount,
    },
    mainActive: Number(mainActive[0]?.count || 0),
    rentalActive: Number(rentalActive[0]?.count || 0),
    today: {
      revenue: Number(todayTx[0]?.revenue || 0),
      count: Number(todayTx[0]?.count || 0),
      productsSold: Number(todayProduct[0]?.qty || 0),
    },
    monthRevenue: Number(monthTx[0]?.revenue || 0),
    lowStock: lowStock,
    activeMains: activeMains,
    activeRentals: activeRentals,
    lateReturns: lateRows,
    playstations: countBy(psStats),
    controllers: countBy(controllerStats),
  }
})
