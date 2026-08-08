import { eq, and, inArray } from 'drizzle-orm'
import { transactions, transactionDetails, rentals, playstations, controllers, rentalPackages, customers, rooms } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const playstationId = Number(body.playstationId)
  const ps = await db.query.playstations.findFirst({ where: eq(playstations.id, playstationId) })
  if (!ps) throw createError({ statusCode: 404, statusMessage: 'PlayStation tidak ditemukan' })
  const psRoom = ps.roomId ? await db.query.rooms.findFirst({ where: eq(rooms.id, ps.roomId) }) : null
  if (psRoom && psRoom.status === 'occupied') throw createError({ statusCode: 422, statusMessage: 'PlayStation sedang dipakai Main di Tempat' })

  if (ps.status !== 'ready') throw createError({ statusCode: 422, statusMessage: 'PlayStation sedang tidak tersedia' })

  let controllerId: string | null = null
  const controllerIds = (body.controllerIds || []) as number[]
  if (controllerIds.length > 0) {
    const ctrls = await db.select().from(controllers).where(inArray(controllers.id, controllerIds))
    if (ctrls.length !== controllerIds.length) throw createError({ statusCode: 404, statusMessage: 'Stick tidak ditemukan' })
    for (const c of ctrls) {
      if (c.status !== 'ready') throw createError({ statusCode: 422, statusMessage: `Stick ${c.controllerNumber} sedang tidak tersedia` })
    }
    controllerId = controllerIds.join(',')
  }

  const pkg = await db.query.rentalPackages.findFirst({ where: eq(rentalPackages.id, Number(body.packageId)) })
  if (!pkg || !pkg.isActive) throw createError({ statusCode: 422, statusMessage: 'Paket rental tidak valid' })

  const customerId = Number(body.customerId)
  if (!customerId) throw createError({ statusCode: 422, statusMessage: 'Customer wajib diisi sebagai jaminan identitas rental' })
  const c = await db.query.customers.findFirst({ where: eq(customers.id, customerId) })
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Customer tidak ditemukan' })

  const invoiceNumber = await generateInvoiceNumber(db)
  const now = new Date()
  const dueDate = new Date(now)
  dueDate.setTime(dueDate.getTime() + Math.round(Number(pkg.durationDays) * 24 * 60 * 60 * 1000))

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
  if (controllerIds.length > 0) {
    await db.update(controllers).set({ status: 'rented' }).where(inArray(controllers.id, controllerIds))
  }

  return { id: tx.id, invoiceNumber, dueDate }
})
