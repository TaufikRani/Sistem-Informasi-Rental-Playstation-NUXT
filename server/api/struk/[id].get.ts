import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { transactions, transactionDetails, rentals, playstations, rentalPackages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [tx] = await db.select({
    id: transactions.id,
    invoiceNumber: transactions.invoiceNumber,
    transactionType: transactions.transactionType,
    status: transactions.status,
    customerName: sql`COALESCE(customers.name, 'Umum')`.as('customerName'),
    customerPhone: sql`COALESCE(customers.phone, '')`.as('customerPhone'),
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
    createdByName: sql`COALESCE(users.name, '')`.as('createdByName'),
    rentalDate: rentals.rentalDate,
    dueDate: rentals.dueDate,
    returnDate: rentals.returnDate,
    lateHours: rentals.lateHours,
    penaltyAmount: rentals.penaltyAmount,
    playstationName: sql`playstations.name`.as('playstationName'),
    packageName: sql`rental_packages.name`.as('packageName'),
  }).from(transactions)
    .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
    .leftJoin(sql`rooms`, sql`rooms.id = transactions.room_id`)
    .leftJoin(sql`users`, sql`users.id = transactions.created_by`)
    .leftJoin(rentals, eq(rentals.transactionId, transactions.id))
    .leftJoin(sql`playstations`, sql`playstations.id = rentals.playstation_id`)
    .leftJoin(sql`rental_packages`, sql`rental_packages.id = rentals.package_id`)
    .where(eq(transactions.id, id))

  if (!tx) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })

  const items = await db.select().from(transactionDetails)
    .where(eq(transactionDetails.transactionId, id))
    .orderBy(transactionDetails.id)

  return { ...tx, items }
})
