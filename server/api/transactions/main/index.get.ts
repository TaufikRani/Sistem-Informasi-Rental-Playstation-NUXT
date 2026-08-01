import { and, eq, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { transactions } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  return await db.select({
    id: transactions.id,
    invoiceNumber: transactions.invoiceNumber,
    status: transactions.status,
    roomId: transactions.roomId,
    startedAt: transactions.startedAt,
    roomName: sql`COALESCE(rooms.name, '')`.as('roomName'),
    customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
    grandTotal: transactions.grandTotal,
  }).from(transactions)
    .leftJoin(sql`rooms`, sql`rooms.id = transactions.room_id`)
    .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
    .where(and(eq(transactions.transactionType, 'MAIN'), eq(transactions.status, 'active')))
    .orderBy(desc(transactions.startedAt))
})
