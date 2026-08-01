import ExcelJS from 'exceljs'
import { and, eq, gte, lte, sum, count } from 'drizzle-orm'
import { transactions, transactionDetails, rentals, products, stockMovements, rooms, playstations, controllers, televisions } from '../../db/schema'

function getRange(type: string, date: string) {
  const d = date ? new Date(date) : new Date()
  if (type === 'month') {
    return {
      from: new Date(d.getFullYear(), d.getMonth(), 1),
      to: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    }
  }
  if (type === 'year') {
    return {
      from: new Date(d.getFullYear(), 0, 1),
      to: new Date(d.getFullYear(), 11, 31, 23, 59, 59),
    }
  }
  return {
    from: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    to: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59),
  }
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const query = getQuery(event)
  const type = String(query.type || 'day')
  const { from, to } = getRange(type, String(query.date || ''))

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistem Informasi Rental PS'
  wb.created = new Date()

  const title = `Laporan ${type === 'day' ? 'Harian' : type === 'month' ? 'Bulanan' : 'Tahunan'}`
  const period = `${from.toLocaleDateString('id-ID')} s/d ${to.toLocaleDateString('id-ID')}`

  const ws = wb.addWorksheet('Pendapatan')
  ws.mergeCells('A1:H1')
  ws.getCell('A1').value = `LAPORAN PENDAPATAN — ${title}`
  ws.getCell('A1').font = { bold: true, size: 14 }
  ws.mergeCells('A2:H2')
  ws.getCell('A2').value = `Periode: ${period}`
  ws.getCell('A2').font = { italic: true }

  const [txs, revenueRows, productRows, rentalPenalty, mainRows] = await Promise.all([
    db.select({
      invoiceNumber: transactions.invoiceNumber,
      transactionType: transactions.transactionType,
      status: transactions.status,
      createdAt: transactions.createdAt,
      grandTotal: transactions.grandTotal,
      paymentMethod: transactions.paymentMethod,
    }).from(transactions)
      .where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
      .orderBy(transactions.createdAt),
    db.select({
      type: transactions.transactionType,
      total: sum(transactions.grandTotal),
    }).from(transactions)
      .where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
      .groupBy(transactions.transactionType),
    db.select({
      itemName: transactionDetails.itemName,
      qty: sum(transactionDetails.qty),
      omzet: sum(transactionDetails.subtotal),
    }).from(transactionDetails)
      .innerJoin(transactions, eq(transactionDetails.transactionId, transactions.id))
      .where(and(eq(transactionDetails.itemType, 'PRODUCT'), eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
      .groupBy(transactionDetails.itemName),
    db.select({ total: sum(rentals.penaltyAmount) }).from(rentals)
      .innerJoin(transactions, eq(rentals.transactionId, transactions.id))
      .where(and(eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to))),
    db.select({
      count: count(),
      hours: sum(transactions.durationMinutes),
      total: sum(transactions.grandTotal),
    }).from(transactions)
      .where(and(eq(transactions.transactionType, 'MAIN'), eq(transactions.status, 'completed'), gte(transactions.createdAt, from), lte(transactions.createdAt, to))),
  ])

  const revenueMap: Record<string, number> = { MAIN: 0, RENTAL: 0 }
  for (const r of revenueRows) revenueMap[r.type] = Number(r.total || 0)
  const penaltyTotal = Number(rentalPenalty[0]?.total || 0)
  const productTotal = productRows.reduce((s, r) => s + Number(r.omzet), 0)

  ws.addRow([])
  ws.addRow(['RINGKASAN']).font = { bold: true }
  ws.addRow(['Pendapatan Main', revenueMap.MAIN])
  ws.addRow(['Pendapatan Rental', revenueMap.RENTAL])
  ws.addRow(['Penjualan Produk', productTotal])
  ws.addRow(['Denda', penaltyTotal])
  ws.addRow(['TOTAL PENDAPATAN', revenueMap.MAIN + revenueMap.RENTAL + productTotal + penaltyTotal]).font = { bold: true }
  ws.addRow([])

  ws.addRow(['DETAIL TRANSAKSI']).font = { bold: true }
  ws.addRow(['Invoice', 'Jenis', 'Tanggal', 'Metode', 'Total'])
  ws.getRow(ws.rowCount).font = { bold: true }
  for (const t of txs) {
    ws.addRow([
      t.invoiceNumber,
      t.transactionType === 'MAIN' ? 'Main' : 'Rental',
      t.createdAt.toLocaleString('id-ID'),
      t.paymentMethod,
      Number(t.grandTotal),
    ])
  }

  const wsMain = wb.addWorksheet('Main')
  wsMain.addRow(['LAPORAN MAIN DI TEMPAT']).font = { bold: true, size: 14 }
  wsMain.addRow([`Periode: ${period}`]).font = { italic: true }
  wsMain.addRow([])
  wsMain.addRow(['Jumlah Transaksi', Number(mainRows[0]?.count || 0)])
  wsMain.addRow(['Total Jam Bermain', Math.round(Number(mainRows[0]?.hours || 0) / 60)])
  wsMain.addRow(['Pendapatan', Number(mainRows[0]?.total || 0)])

  const wsRental = wb.addWorksheet('Rental')
  wsRental.addRow(['LAPORAN RENTAL']).font = { bold: true, size: 14 }
  wsRental.addRow([`Periode: ${period}`]).font = { italic: true }
  wsRental.addRow([])
  wsRental.addRow(['Denda Total', penaltyTotal])

  const rentalRows = await db.select({
    invoiceNumber: transactions.invoiceNumber,
    customerName: rentals.playstationId,
    rentalDate: rentals.rentalDate,
    dueDate: rentals.dueDate,
    returnDate: rentals.returnDate,
    lateHours: rentals.lateHours,
    penaltyAmount: rentals.penaltyAmount,
    status: transactions.status,
  }).from(transactions)
    .innerJoin(rentals, eq(rentals.transactionId, transactions.id))
    .where(and(gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
    .orderBy(transactions.createdAt)

  wsRental.addRow([])
  wsRental.addRow(['Invoice', 'Rental', 'Kembali', 'Terlambat (jam)', 'Denda', 'Status'])
  wsRental.getRow(wsRental.rowCount).font = { bold: true }
  for (const r of rentalRows) {
    wsRental.addRow([
      r.invoiceNumber,
      r.rentalDate.toLocaleDateString('id-ID'),
      r.returnDate ? r.returnDate.toLocaleDateString('id-ID') : '-',
      Number(r.lateHours || 0),
      Number(r.penaltyAmount || 0),
      r.status,
    ])
  }

  const wsProduct = wb.addWorksheet('Produk')
  wsProduct.addRow(['LAPORAN PENJUALAN PRODUK']).font = { bold: true, size: 14 }
  wsProduct.addRow([`Periode: ${period}`]).font = { italic: true }
  wsProduct.addRow([])
  wsProduct.addRow(['Produk', 'Qty', 'Omzet'])
  wsProduct.getRow(wsProduct.rowCount).font = { bold: true }
  for (const p of productRows) {
    wsProduct.addRow([p.itemName, Number(p.qty), Number(p.omzet)])
  }

  const wsStock = wb.addWorksheet('Stok')
  wsStock.addRow(['LAPORAN STOK']).font = { bold: true, size: 14 }
  wsStock.addRow([])
  wsStock.addRow(['Kode', 'Produk', 'Stok', 'Min Stok'])
  wsStock.getRow(wsStock.rowCount).font = { bold: true }
  const stockRows = await db.select().from(products).orderBy(products.name)
  for (const p of stockRows) {
    wsStock.addRow([p.productCode, p.name, p.stock, p.minimumStock])
  }

  const wsAssets = wb.addWorksheet('Perangkat')
  wsAssets.addRow(['LAPORAN PERANGKAT']).font = { bold: true, size: 14 }
  wsAssets.addRow([])
  wsAssets.addRow(['Jenis', 'Status', 'Jumlah'])
  wsAssets.getRow(wsAssets.rowCount).font = { bold: true }
  for (const [label, table] of [['PlayStation', playstations], ['TV', televisions], ['Stick', controllers]] as const) {
    const rows = await db.select({ status: table.status, count: count() }).from(table).groupBy(table.status)
    for (const r of rows) {
      wsAssets.addRow([label, r.status, Number(r.count)])
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const filename = `laporan-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`
  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  return buffer
})
