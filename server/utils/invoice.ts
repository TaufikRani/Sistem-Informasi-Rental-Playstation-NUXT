import { like } from 'drizzle-orm'
import { transactions } from '../db/schema'

export async function generateInvoiceNumber(db: ReturnType<typeof useDb>) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const prefix = `PS-${y}${m}${d}-`

  const rows = await db.select({ invoiceNumber: transactions.invoiceNumber })
    .from(transactions)
    .where(like(transactions.invoiceNumber, `${prefix}%`))
    .orderBy(transactions.invoiceNumber)

  let max = 0
  for (const r of rows) {
    const n = Number(r.invoiceNumber.slice(prefix.length))
    if (n > max) max = n
  }

  return `${prefix}${String(max + 1).padStart(4, '0')}`
}
