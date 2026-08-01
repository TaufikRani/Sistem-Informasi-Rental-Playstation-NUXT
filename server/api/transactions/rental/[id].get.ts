import { eq } from 'drizzle-orm'
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
    customerPhone: sql`COALESCE(customers.phone, '')`.as('customerPhone'),
    startedAt: transactions.startedAt,
    endedAt: transactions.endedAt,
    subtotal: transactions.subtotal,
    discountType: transactions.discountType,
    discountValue: transactions.discountValue,
    discountAmount: transactions.discountAmount,
    grandTotal: transactions.grandTotal,
    paymentMethod: transactions.paymentMethod,
    amountPaid: transactions.amountPaid,
    changeAmount: transactions.changeAmount,
    notes: transactions.notes,
    rentalDate: sql`rentals.rental_date`.as('rentalDate'),
    dueDate: sql`rentals.due_date`.as('dueDate'),
    returnDate: sql`rentals.return_date`.as('returnDate'),
    lateHours: sql`rentals.late_hours`.as('lateHours'),
    penaltyAmount: sql`rentals.penalty_amount`.as('penaltyAmount'),
    playstationName: sql`playstations.name`.as('playstationName'),
    playstationCode: sql`playstations.asset_code`.as('playstationCode'),
    controllerNumber: sql`controllers.controller_number`.as('controllerNumber'),
    packageName: sql`rental_packages.name`.as('packageName'),
    durationDays: sql`rental_packages.duration_days`.as('durationDays'),
    packagePrice: sql`rental_packages.price`.as('packagePrice'),
  }).from(transactions)
    .innerJoin(sql`rentals`, sql`rentals.transaction_id = transactions.id`)
    .leftJoin(sql`customers`, sql`customers.id = transactions.customer_id`)
    .leftJoin(sql`playstations`, sql`playstations.id = rentals.playstation_id`)
    .leftJoin(sql`controllers`, sql`controllers.id = rentals.controller_id`)
    .leftJoin(sql`rental_packages`, sql`rental_packages.id = rentals.package_id`)
    .where(eq(transactions.id, id))

  if (!tx) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })

  const items = await db.select().from(transactionDetails)
    .where(eq(transactionDetails.transactionId, id))
    .orderBy(transactionDetails.id)

  return { ...tx, items }
})
