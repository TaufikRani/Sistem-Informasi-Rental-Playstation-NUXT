import { and, eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { transactions, transactionDetails } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [tx] = await db.select({
    id: transactions.id,
    invoiceNumber: transactions.invoiceNumber,
    transactionType: transactions.transactionType,
    status: transactions.status,
    customerId: transactions.customerId,
    customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
    roomId: transactions.roomId,
    roomName: sql`COALESCE(rooms.name, '')`.as('roomName'),
    startedAt: transactions.startedAt,
    endedAt: transactions.endedAt,
    durationMinutes: transactions.durationMinutes,
    subtotal: transactions.subtotal,
    discountType: transactions.discountType,
    discountValue: transactions.discountValue,
    discountAmount: transactions.discountAmount,
    grandTotal: transactions.grandTotal,
    paymentMethod: transactions.paymentMethod,
    amountPaid: transactions.amountPaid,
    changeAmount: transactions.changeAmount,
    notes: transactions.notes,
  }).from(transactions)
    .leftJoin(sql`rooms`, sql`rooms.id = transactions.room_id`)
    .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
    .where(eq(transactions.id, id))

  if (!tx) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })

  const items = await db.select().from(transactionDetails)
    .where(eq(transactionDetails.transactionId, id))
    .orderBy(transactionDetails.id)

  const rate = tx.durationMinutes != null
    ? tx.durationMinutes
    : Math.max(1, Math.round(((tx.endedAt ?? new Date()).getTime() - new Date(tx.startedAt).getTime()) / 60000))

  return { ...tx, items, elapsedMinutes: Math.max(1, rate) }
})
