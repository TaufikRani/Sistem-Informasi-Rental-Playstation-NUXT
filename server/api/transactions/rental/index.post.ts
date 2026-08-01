import { eq, and } from 'drizzle-orm'
import { transactions, transactionDetails, rentals, playstations, controllers, rentalPackages, customers } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const playstationId = Number(body.playstationId)
  const ps = await db.query.playstations.findFirst({ where: eq(playstations.id, playstationId) })
  if (!ps) throw createError({ statusCode: 404, statusMessage: 'PlayStation tidak ditemukan' })
  if (ps.status !== 'ready') throw createError({ statusCode: 422, statusMessage: 'PlayStation sedang tidak tersedia' })

  let controllerId: number | null = null
  if (body.controllerId) {
    const ctrl = await db.query.controllers.findFirst({ where: eq(controllers.id, Number(body.controllerId)) })
    if (!ctrl) throw createError({ statusCode: 404, statusMessage: 'Stick tidak ditemukan' })
    if (ctrl.status !== 'ready') throw createError({ statusCode: 422, statusMessage: 'Stick sedang tidak tersedia' })
    controllerId = ctrl.id
  }

  const pkg = await db.query.rentalPackages.findFirst({ where: eq(rentalPackages.id, Number(body.packageId)) })
  if (!pkg || !pkg.isActive) throw createError({ statusCode: 422, statusMessage: 'Paket rental tidak valid' })

  let customerId: number | null = null
  if (body.customerId) {
    const c = await db.query.customers.findFirst({ where: eq(customers.id, Number(body.customerId)) })
    if (c) customerId = c.id
  }

  const invoiceNumber = await generateInvoiceNumber(db)
  const now = new Date()
  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + pkg.durationDays)

  const [tx] = await db.insert(transactions).values({
    invoiceNumber,
    transactionType: 'RENTAL',
    customerId,
    status: 'waiting_return',
    startedAt: now,
    subtotal: '0',
    discountType: 'none',
    discountValue: '0',
    discountAmount: '0',
    grandTotal: '0',
    amountPaid: '0',
    changeAmount: '0',
    notes: body.notes ? String(body.notes) : null,
    createdBy: user.id,
  }).$returningId()

  await db.insert(rentals).values({
    transactionId: tx.id,
    playstationId,
    controllerId,
    packageId: pkg.id,
    rentalDate: now,
    dueDate,
  })

  await db.insert(transactionDetails).values({
    transactionId: tx.id,
    itemType: 'RENTAL',
    itemName: `Rental ${ps.name} — ${pkg.name}`,
    qty: String(pkg.durationDays),
    unit: 'HARI',
    unitPrice: pkg.price,
    subtotal: pkg.price,
  })

  await db.update(playstations).set({ status: 'rented' }).where(eq(playstations.id, playstationId))
  if (controllerId) {
    await db.update(controllers).set({ status: 'rented' }).where(eq(controllers.id, controllerId))
  }

  return { id: tx.id, invoiceNumber, dueDate }
})
