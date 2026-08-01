<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Transaksi</h1>
      <p class="text-neutral-500 text-sm">Riwayat seluruh transaksi</p>
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <USelect v-model="filters.type" :items="typeOptions" class="w-36" />
          <USelect v-model="filters.status" :items="statusOptions" class="w-48" />
          <UInput v-model="filters.from" type="date" class="w-40" />
          <UInput v-model="filters.to" type="date" class="w-40" />
          <UButton icon="i-lucide-search" @click="fetchItems">Filter</UButton>
          <UButton color="neutral" variant="outline" @click="resetFilters">Reset</UButton>
        </div>
      </template>

      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada transaksi">
        <template #transactionType-cell="{ row }">
          <UBadge :color="row.original.transactionType === 'MAIN' ? 'info' : 'warning'" variant="subtle">
            {{ row.original.transactionType === 'MAIN' ? 'Main' : 'Rental' }}
          </UBadge>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ TRANSACTION_STATUS_LABEL[row.original.status] }}</UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDateTime(row.original.createdAt) }}
        </template>
        <template #grandTotal-cell="{ row }">
          <span class="font-semibold">{{ formatRupiah(row.original.grandTotal) }}</span>
        </template>
        <template #paymentMethod-cell="{ row }">
          {{ row.original.paymentMethod ? PAYMENT_METHOD_LABEL[row.original.paymentMethod] : '-' }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1 justify-end">
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-receipt" @click="navigateTo(`/struk/${row.original.id}`)" />
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-eye" @click="navigateTo(row.original.transactionType === 'MAIN' ? `/main/${row.original.id}` : `/rental/${row.original.id}`)" />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const filters = reactive({ type: 'all', status: 'all', from: '', to: '' })
const items = ref<any[]>([])
const loading = ref(false)

const typeOptions = [
  { label: 'Semua Jenis', value: 'all' },
  { label: 'Main', value: 'MAIN' },
  { label: 'Rental', value: 'RENTAL' },
]

const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Menunggu Pengembalian', value: 'waiting_return' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
]

const columns = [
  { id: 'invoiceNumber', key: 'invoiceNumber', label: 'Invoice' },
  { id: 'transactionType', key: 'transactionType', label: 'Jenis' },
  { id: 'customerName', key: 'customerName', label: 'Customer' },
  { id: 'roomName', key: 'roomName', label: 'Room' },
  { id: 'createdAt', key: 'createdAt', label: 'Waktu' },
  { id: 'paymentMethod', key: 'paymentMethod', label: 'Bayar' },
  { id: 'grandTotal', key: 'grandTotal', label: 'Total' },
  { id: 'status', key: 'status', label: 'Status' },
  { id: 'createdBy', key: 'createdBy', label: 'Kasir' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

async function fetchItems() {
  loading.value = true
  try {
    const qs = new URLSearchParams({
      type: filters.type,
      status: filters.status,
      from: filters.from,
      to: filters.to,
    })
    items.value = await $fetch(`/api/transactions?${qs}`)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.type = 'all'
  filters.status = 'all'
  filters.from = ''
  filters.to = ''
  fetchItems()
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => fetchItems())
</script>
