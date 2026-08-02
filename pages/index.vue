<script setup lang="ts">
const { data: stats, refresh } = await useFetch('/api/dashboard/stats')

onMounted(() => {
  const t = setInterval(() => refresh(), 60000)
  onUnmounted(() => clearInterval(t))
})

const lowStock = computed(() => stats.value?.lowStock || [])
const activeMains = computed(() => stats.value?.activeMains || [])
const activeRentals = computed(() => stats.value?.activeRentals || [])
const lateReturns = computed(() => stats.value?.lateReturns || [])

const statCards = computed(() => [
  { label: 'Room Tersedia', value: stats.value?.rooms?.ready ?? 0, icon: 'i-lucide-door-open', color: 'success' as const },
  { label: 'Room Dipakai', value: stats.value?.rooms?.occupied ?? 0, icon: 'i-lucide-gamepad-2', color: 'info' as const },
  { label: 'Rental Aktif', value: stats.value?.rentalActive ?? 0, icon: 'i-lucide-boxes', color: 'warning' as const },
  { label: 'Pendapatan Hari Ini', value: formatRupiah(stats.value?.today?.revenue), icon: 'i-lucide-wallet', color: 'primary' as const },
  { label: 'Pendapatan Bulan Ini', value: formatRupiah(stats.value?.monthRevenue), icon: 'i-lucide-trending-up', color: 'primary' as const },
  { label: 'Transaksi Hari Ini', value: stats.value?.today?.count ?? 0, icon: 'i-lucide-receipt-text', color: 'neutral' as const },
])

const mainColumns = [
  { accessorKey: 'invoiceNumber', header: 'Invoice' },
  { accessorKey: 'roomName', header: 'Room' },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'startedAt', header: 'Mulai' },
]

const rentalColumns = [
  { accessorKey: 'invoiceNumber', header: 'Invoice' },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'playstationName', header: 'PS' },
  { accessorKey: 'dueDate', header: 'Jatuh Tempo' },
]

function formatTime(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Ringkasan operasional rental PS
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <UAlert
          v-if="lowStock.length"
          color="warning"
          variant="subtle"
          title="Perhatian: Stok menipis"
          :description="`${lowStock.length} produk berada di bawah batas minimal stok.`"
          icon="i-lucide-package-minus"
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <UCard v-for="card in statCards" :key="card.label">
            <div class="flex items-center gap-3">
              <UAvatar :ui="{ fallback: 'rounded-xl' }" :color="card.color" variant="subtle" :icon="card.icon" size="lg" />

              <div class="min-w-0">
                <div class="truncate text-xs text-muted">{{ card.label }}</div>
                <div class="text-lg font-bold">{{ card.value }}</div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div class="space-y-6 xl:col-span-2">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="font-semibold">Main yang Sedang Berjalan</div>
                  <NuxtLink to="/main" class="text-sm text-primary">
                    Kelola
                  </NuxtLink>
                </div>
              </template>

              <ScrollableTable :data="activeMains" :columns="mainColumns" empty="Tidak ada main aktif">
                <template #startedAt-cell="{ row }">
                  {{ formatTime(row.original.startedAt) }}
                </template>
              </ScrollableTable>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="font-semibold">Rental Aktif</div>
                  <NuxtLink to="/rental" class="text-sm text-primary">
                    Kelola
                  </NuxtLink>
                </div>
              </template>

              <ScrollableTable :data="activeRentals" :columns="rentalColumns" empty="Tidak ada rental aktif">
                <template #dueDate-cell="{ row }">
                  {{ formatDateTime(row.original.dueDate) }}
                </template>
              </ScrollableTable>
            </UCard>
          </div>

          <div class="space-y-6">
            <UCard>
              <template #header>
                <div class="font-semibold">Pengembalian Terlambat</div>
              </template>

              <div v-if="lateReturns.length" class="space-y-3">
                <div
                  v-for="r in lateReturns"
                  :key="r.id"
                  class="flex items-center justify-between gap-2 rounded-lg border border-error/20 bg-error/5 p-3"
                >
                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium">{{ r.customerName }} — {{ r.playstationName }}</div>
                    <div class="text-xs text-muted">{{ r.invoiceNumber }}</div>
                  </div>
                  <UBadge color="error" variant="subtle">Terlambat</UBadge>
                </div>
              </div>
              <div v-else class="py-4 text-center text-sm text-muted">
                Tidak ada keterlambatan
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="font-semibold">Stok Menipis</div>
              </template>

              <div v-if="lowStock.length" class="space-y-3">
                <div v-for="p in lowStock" :key="p.id" class="flex items-center justify-between gap-2">
                  <div class="truncate text-sm">{{ p.name }}</div>
                  <UBadge color="error" variant="subtle">{{ p.stock }} tersisa</UBadge>
                </div>
              </div>
              <div v-else class="py-4 text-center text-sm text-muted">
                Semua stok aman
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
