import { eq, and } from 'drizzle-orm'
import { transactions, transactionDetails, rooms, playRates, customers, playstations } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const db = useDb()

  const roomId = Number(body.roomId)
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) })
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room tidak ditemukan' })
  if (room.status !== 'ready') throw createError({ statusCode: 422, statusMessage: 'Room sedang tidak tersedia' })

  const active = await db.select().from(transactions)
    .where(and(eq(transactions.roomId, roomId), eq(transactions.status, 'active')))
    .limit(1)
  if (active.length) throw createError({ statusCode: 422, statusMessage: 'Room sudah memiliki transaksi aktif' })

  const roomPS = await db.select().from(playstations)
    .where(and(eq(playstations.roomId, roomId), eq(playstations.status, 'rented')))
    .limit(1)
  if (roomPS.length) {
    throw createError({ statusCode: 422, statusMessage: `PlayStation ${roomPS[0].name} sedang di-rental` })
  }

  const rate = await db.query.playRates.findFirst({ where: and(eq(playRates.roomType, room.roomType), eq(playRates.isActive, true)) })

  let customerId: number | null = null
  if (body.customerId) {
    const c = await db.query.customers.findFirst({ where: eq(customers.id, Number(body.customerId)) })
    if (c) customerId = c.id
  }

  const invoiceNumber = await generateInvoiceNumber(db)
  const now = new Date()

  const [tx] = await db.insert(transactions).values({
    invoiceNumber,
    transactionType: 'MAIN',
    customerId,
    roomId,
    status: 'active',
    startedAt: now,
    subtotal: '0',
    discountType: 'none',
    discountValue: '0',
    discountAmount: '0',
    grandTotal: '0',
    amountPaid: '0',
    changeAmount: '0',
    createdBy: user.id,
  }).$returningId()

  const rateName = rate ? `${rate.name} (${room.roomType})` : room.roomType
  await db.insert(transactionDetails).values({
    transactionId: tx.id,
    itemType: 'MAIN',
    itemName: `Main ${room.name} — ${rateName}`,
    qty: '0',
    unit: 'JAM',
    unitPrice: rate?.hourlyRate || '0',
    subtotal: '0',
  })

  await setRoomAssetsStatus(db, roomId, 'occupied')

  return { id: tx.id, invoiceNumber }
})
