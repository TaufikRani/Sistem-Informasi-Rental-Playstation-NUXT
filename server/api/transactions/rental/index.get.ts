import { and, eq, desc, inArray, sql } from 'drizzle-orm'
import { transactions, rentals } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const query = getQuery(event)
  const status = String(query.status || 'active')

  const rows = await db.select({
    id: transactions.id,
    invoiceNumber: transactions.invoiceNumber,
    status: transactions.status,
    startedAt: transactions.startedAt,
    customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
    identityNumber: sql`COALESCE(customers.identity_number, '')`.as('identityNumber'),
    phone: sql`COALESCE(customers.phone, '')`.as('phone'),
    playstationName: sql`playstations.name`.as('playstationName'),
    dueDate: rentals.dueDate,
    returnDate: rentals.returnDate,
    lateHours: rentals.lateHours,
    penaltyAmount: rentals.penaltyAmount,
    grandTotal: transactions.grandTotal,
  }).from(transactions)
    .innerJoin(rentals, eq(rentals.transactionId, transactions.id))
    .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
    .leftJoin(sql`playstations`, sql`playstations.id = rentals.playstation_id`)
    .where(and(eq(transactions.transactionType, 'RENTAL'), status === 'all' ? undefined : eq(transactions.status, status)))
    .orderBy(desc(transactions.startedAt))

  return rows
})
