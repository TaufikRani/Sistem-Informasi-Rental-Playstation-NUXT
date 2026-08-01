export function formatRupiah(value: number | string | null | undefined) {
  const n = Number(value || 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function formatNumber(value: number | string | null | undefined) {
  const n = Number(value || 0)
  return new Intl.NumberFormat('id-ID').format(n)
}

export const ROOM_STATUS_LABEL: Record<string, string> = {
  ready: 'Ready',
  occupied: 'Dipakai',
  maintenance: 'Maintenance',
}

export const ASSET_STATUS_LABEL: Record<string, string> = {
  ready: 'Ready',
  in_use: 'Dipakai',
  rented: 'Rental',
  maintenance: 'Maintenance',
}

export const ASSET_CONDITION_LABEL: Record<string, string> = {
  good: 'Baik',
  fair: 'Cukup',
  broken: 'Rusak',
}

export const TRANSACTION_STATUS_LABEL: Record<string, string> = {
  active: 'Aktif',
  waiting_return: 'Menunggu Pengembalian',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  transfer: 'Transfer',
  qris: 'QRIS',
}

export const PRODUCT_CATEGORY_LABEL: Record<string, string> = {
  food: 'Makanan',
  drink: 'Minuman',
  service: 'Layanan',
  other: 'Lain-lain',
}

export const ROOM_TYPE_LABEL: Record<string, string> = {
  reguler: 'Reguler',
  vip: 'VIP',
  premium: 'Premium',
}

export function statusColor(status: string) {
  switch (status) {
    case 'ready': return 'success'
    case 'occupied':
    case 'in_use':
    case 'active': return 'info'
    case 'rented':
    case 'waiting_return': return 'warning'
    case 'maintenance':
    case 'broken': return 'error'
    default: return 'neutral'
  }
}
