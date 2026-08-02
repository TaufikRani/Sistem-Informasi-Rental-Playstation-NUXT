<script setup lang="ts">
const type = ref('day')
const date = ref(new Date().toISOString().slice(0, 10))

const { data, refresh } = await useFetch('/api/reports/revenue', {
  watch: [type, date],
  query: { type, date },
})

const productColumns = [
  { accessorKey: 'name', header: 'Produk' },
  { accessorKey: 'qty', header: 'Qty' },
  { accessorKey: 'omzet', header: 'Omzet' },
]

const txColumns = [
  { accessorKey: 'invoiceNumber', header: 'Invoice' },
  { accessorKey: 'transactionType', header: 'Jenis' },
  { accessorKey: 'createdAt', header: 'Waktu' },
  { accessorKey: 'grandTotal', header: 'Total' },
]

const revenueCards = computed(() => [
  { label: 'Pendapatan Main', value: data.value?.revenue?.main, color: 'info' as const },
  { label: 'Pendapatan Rental', value: data.value?.revenue?.rental, color: 'warning' as const },
  { label: 'Penjualan Produk', value: data.value?.revenue?.product, color: 'success' as const },
  { label: 'Denda', value: data.value?.revenue?.penalty, color: 'error' as const },
  { label: 'Total Pendapatan', value: data.value?.revenue?.total, color: 'primary' as const, highlight: true },
])

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

<template>
  <UDashboardPanel id="reports">
    <template #header>
      <UDashboardNavbar title="Laporan">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-file-down" @click="exportExcel">
            Export Excel
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UButtonGroup size="sm">
            <UButton :color="type === 'day' ? 'primary' : 'neutral'" variant="soft" @click="type = 'day'">Harian</UButton>
            <UButton :color="type === 'month' ? 'primary' : 'neutral'" variant="soft" @click="type = 'month'">Bulanan</UButton>
            <UButton :color="type === 'year' ? 'primary' : 'neutral'" variant="soft" @click="type = 'year'">Tahunan</UButton>
          </UButtonGroup>
          <UInput v-model="date" type="date" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
          <UCard v-for="card in revenueCards" :key="card.label" :class="card.highlight && 'border-primary/20 bg-primary/5'">
            <div class="text-xs text-muted">{{ card.label }}</div>
            <div class="text-xl font-bold" :class="card.highlight ? 'text-primary' : `text-${card.color}`">
              {{ formatRupiah(card.value) }}
            </div>
          </UCard>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div class="font-semibold">Ringkasan Main</div>
            </template>

            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold">{{ data?.main?.count }}</div>
                <div class="text-xs text-muted">Transaksi</div>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ data?.main?.totalHours }}</div>
                <div class="text-xs text-muted">Jam Bermain</div>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ formatRupiah(data?.main?.total) }}</div>
                <div class="text-xs text-muted">Pendapatan</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="font-semibold">Ringkasan Rental</div>
            </template>

            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-warning">{{ data?.rental?.active }}</div>
                <div class="text-xs text-muted">Aktif</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-success">{{ data?.rental?.completed }}</div>
                <div class="text-xs text-muted">Selesai</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-error">{{ formatRupiah(data?.rental?.penalty) }}</div>
                <div class="text-xs text-muted">Denda</div>
              </div>
            </div>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <div class="font-semibold">Produk Terjual</div>
          </template>

          <ScrollableTable :data="data?.products || []" :columns="productColumns" empty="Tidak ada penjualan produk">
            <template #qty-cell="{ row }">{{ row.original.qty }}</template>
            <template #omzet-cell="{ row }">{{ formatRupiah(row.original.omzet) }}</template>
          </ScrollableTable>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">Daftar Transaksi Selesai</div>
          </template>

          <ScrollableTable :data="data?.transactions || []" :columns="txColumns" empty="Tidak ada transaksi">
            <template #transactionType-cell="{ row }">
              <UBadge :color="row.original.transactionType === 'MAIN' ? 'info' : 'warning'" variant="subtle">{{ row.original.transactionType }}</UBadge>
            </template>
            <template #createdAt-cell="{ row }">{{ formatDateTime(row.original.createdAt) }}</template>
            <template #grandTotal-cell="{ row }">{{ formatRupiah(row.original.grandTotal) }}</template>
          </ScrollableTable>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
