<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Laporan</h1>
        <p class="text-neutral-500 text-sm">Ringkasan pendapatan & operasional</p>
      </div>
      <UButton icon="i-lucide-file-down" @click="exportExcel">Export Excel</UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <UButtonGroup size="sm">
            <UButton :color="type === 'day' ? 'primary' : 'neutral'" variant="soft" @click="type = 'day'">Harian</UButton>
            <UButton :color="type === 'month' ? 'primary' : 'neutral'" variant="soft" @click="type = 'month'">Bulanan</UButton>
            <UButton :color="type === 'year' ? 'primary' : 'neutral'" variant="soft" @click="type = 'year'">Tahunan</UButton>
          </UButtonGroup>
          <UInput v-model="date" type="date" />
        </div>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <UCard>
          <div class="text-xs text-neutral-500">Pendapatan Main</div>
          <div class="text-xl font-bold text-info">{{ formatRupiah(data?.revenue.main) }}</div>
        </UCard>
        <UCard>
          <div class="text-xs text-neutral-500">Pendapatan Rental</div>
          <div class="text-xl font-bold text-warning">{{ formatRupiah(data?.revenue.rental) }}</div>
        </UCard>
        <UCard>
          <div class="text-xs text-neutral-500">Penjualan Produk</div>
          <div class="text-xl font-bold text-success">{{ formatRupiah(data?.revenue.product) }}</div>
        </UCard>
        <UCard>
          <div class="text-xs text-neutral-500">Denda</div>
          <div class="text-xl font-bold text-error">{{ formatRupiah(data?.revenue.penalty) }}</div>
        </UCard>
        <UCard class="bg-primary/5 border-primary/20">
          <div class="text-xs text-neutral-500">Total Pendapatan</div>
          <div class="text-xl font-bold text-primary">{{ formatRupiah(data?.revenue.total) }}</div>
        </UCard>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="font-semibold">Ringkasan Main</div>
        </template>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold">{{ data?.main.count }}</div>
            <div class="text-xs text-neutral-500">Transaksi</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ data?.main.totalHours }}</div>
            <div class="text-xs text-neutral-500">Jam Bermain</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ formatRupiah(data?.main.total) }}</div>
            <div class="text-xs text-neutral-500">Pendapatan</div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-semibold">Ringkasan Rental</div>
        </template>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-warning">{{ data?.rental.active }}</div>
            <div class="text-xs text-neutral-500">Aktif</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-success">{{ data?.rental.completed }}</div>
            <div class="text-xs text-neutral-500">Selesai</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-error">{{ formatRupiah(data?.rental.penalty) }}</div>
            <div class="text-xs text-neutral-500">Denda</div>
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="font-semibold">Produk Terjual</div>
      </template>
      <UTable :data="data?.products || []" :columns="productColumns" empty="Tidak ada penjualan produk">
        <template #qty-cell="{ row }">{{ row.original.qty }}</template>
        <template #omzet-cell="{ row }">{{ formatRupiah(row.original.omzet) }}</template>
      </UTable>
    </UCard>

    <UCard>
      <template #header>
        <div class="font-semibold">Daftar Transaksi Selesai</div>
      </template>
      <UTable :data="data?.transactions || []" :columns="txColumns" empty="Tidak ada transaksi">
        <template #transactionType-cell="{ row }">
          <UBadge :color="row.original.transactionType === 'MAIN' ? 'info' : 'warning'" variant="subtle">{{ row.original.transactionType }}</UBadge>
        </template>
        <template #createdAt-cell="{ row }">{{ formatDateTime(row.original.createdAt) }}</template>
        <template #grandTotal-cell="{ row }">{{ formatRupiah(row.original.grandTotal) }}</template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const type = ref('day')
const date = ref(new Date().toISOString().slice(0, 10))

const { data, refresh } = await useFetch('/api/reports/revenue', {
  watch: [type, date],
  query: { type, date },
})

const productColumns = [
  { id: 'name', key: 'name', label: 'Produk' },
  { id: 'qty', key: 'qty', label: 'Qty' },
  { id: 'omzet', key: 'omzet', label: 'Omzet' },
]

const txColumns = [
  { id: 'invoiceNumber', key: 'invoiceNumber', label: 'Invoice' },
  { id: 'transactionType', key: 'transactionType', label: 'Jenis' },
  { id: 'createdAt', key: 'createdAt', label: 'Waktu' },
  { id: 'grandTotal', key: 'grandTotal', label: 'Total' },
]

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function exportExcel() {
  const url = `/api/reports/export?type=${type.value}&date=${date.value}`
  const blob = await $fetch(url, { responseType: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `laporan-${type.value}-${date.value}.xlsx`
  link.click()
  URL.revokeObjectURL(link.href)
}

watch([type, date], () => refresh())
</script>
