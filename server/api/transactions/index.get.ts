import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const query = getQuery(event)
  const type = String(query.type || 'all')
  const status = String(query.status || 'all')
  const from = query.from ? new Date(String(query.from)) : null
  const to = query.to ? new Date(String(query.to)) : null
  const limit = Math.min(Number(query.limit || 200), 500)

  const conditions = []
  if (type !== 'all') conditions.push(eq(transactions.transactionType, type))
  if (status !== 'all') conditions.push(eq(transactions.status, status))
  if (from) conditions.push(gte(transactions.createdAt, from))
  if (to) {
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    conditions.push(lte(transactions.createdAt, end))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const rows = await db.select({
    id: transactions.id,
    invoiceNumber: transactions.invoiceNumber,
    transactionType: transactions.transactionType,
    status: transactions.status,
    createdAt: transactions.createdAt,
    customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
    roomName: sql`COALESCE(rooms.name, '')`.as('roomName'),
    grandTotal: transactions.grandTotal,
    paymentMethod: transactions.paymentMethod,
    createdBy: sql`COALESCE(users.name, '')`.as('createdBy'),
  }).from(transactions)
    .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
    .leftJoin(sql`rooms`, sql`rooms.id = transactions.room_id`)
    .leftJoin(sql`users`, sql`users.id = transactions.created_by`)
    .where(where)
    .orderBy(desc(transactions.updatedAt))
    .limit(limit)

  return rows
})
