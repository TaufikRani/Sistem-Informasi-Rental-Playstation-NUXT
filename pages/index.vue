<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-neutral-500 text-sm">Ringkasan operasional rental PS</p>
    </div>

    <UAlert v-if="lowStock.length" color="warning" variant="subtle" title="Perhatian: Stok menipis" :description="`${lowStock.length} produk berada di bawah batas minimal stok.`" icon="i-lucide-package-minus" />

    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <UCard v-for="card in statCards" :key="card.label">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl" :class="card.bg">
            <UIcon :name="card.icon" class="size-5" />
          </div>
          <div>
            <div class="text-xs text-neutral-500">{{ card.label }}</div>
            <div class="text-lg font-bold">{{ card.value }}</div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">Main yang Sedang Berjalan</div>
              <NuxtLink to="/main" class="text-sm text-primary">Kelola</NuxtLink>
            </div>
          </template>
          <UTable :data="activeMains" :columns="mainColumns" empty="Tidak ada main aktif">
            <template #startedAt-cell="{ row }">
              {{ formatTime(row.original.startedAt) }}
            </template>
          </UTable>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">Rental Aktif</div>
              <NuxtLink to="/rental" class="text-sm text-primary">Kelola</NuxtLink>
            </div>
          </template>
          <UTable :data="activeRentals" :columns="rentalColumns" empty="Tidak ada rental aktif">
            <template #dueDate-cell="{ row }">
              {{ formatDateTime(row.original.dueDate) }}
            </template>
          </UTable>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="font-semibold">Pengembalian Terlambat</div>
          </template>
          <div v-if="lateReturns.length" class="space-y-3">
            <div v-for="r in lateReturns" :key="r.id" class="flex items-center justify-between gap-2 rounded-lg bg-error/5 border border-error/20 p-3">
              <div class="min-w-0">
                <div class="text-sm font-medium truncate">{{ r.customerName }} — {{ r.playstationName }}</div>
                <div class="text-xs text-neutral-500">{{ r.invoiceNumber }}</div>
              </div>
              <UBadge color="error" variant="subtle">Terlambat</UBadge>
            </div>
          </div>
          <div v-else class="text-sm text-neutral-500 py-4 text-center">Tidak ada keterlambatan</div>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">Stok Menipis</div>
          </template>
          <div v-if="lowStock.length" class="space-y-3">
            <div v-for="p in lowStock" :key="p.id" class="flex items-center justify-between gap-2">
              <div class="text-sm truncate">{{ p.name }}</div>
              <UBadge color="error" variant="subtle">{{ p.stock }} tersisa</UBadge>
            </div>
          </div>
          <div v-else class="text-sm text-neutral-500 py-4 text-center">Semua stok aman</div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BadgeColor } from '@nuxt/ui'

const { data: stats, refresh } = await useFetch('/api/dashboard/stats')

const lowStock = computed(() => stats.value?.lowStock || [])
const activeMains = computed(() => stats.value?.activeMains || [])
const activeRentals = computed(() => stats.value?.activeRentals || [])
const lateReturns = computed(() => stats.value?.lateReturns || [])

onMounted(() => {
  const t = setInterval(() => refresh(), 60000)
  onUnmounted(() => clearInterval(t))
})

const mainColumns = [
  { id: 'invoiceNumber', key: 'invoiceNumber', label: 'Invoice' },
  { id: 'roomName', key: 'roomName', label: 'Room' },
  { id: 'customerName', key: 'customerName', label: 'Customer' },
  { id: 'startedAt', key: 'startedAt', label: 'Mulai' },
]

const rentalColumns = [
  { id: 'invoiceNumber', key: 'invoiceNumber', label: 'Invoice' },
  { id: 'customerName', key: 'customerName', label: 'Customer' },
  { id: 'playstationName', key: 'playstationName', label: 'PS' },
  { id: 'dueDate', key: 'dueDate', label: 'Jatuh Tempo' },
]

const cards = computed(() => [
  { label: 'Room Tersedia', value: stats.value?.rooms?.ready ?? 0, icon: 'i-lucide-door-open', bg: 'bg-success/10 text-success' },
  { label: 'Room Dipakai', value: stats.value?.rooms?.occupied ?? 0, icon: 'i-lucide-gamepad-2', bg: 'bg-info/10 text-info' },
  { label: 'Rental Aktif', value: stats.value?.rentalActive ?? 0, icon: 'i-lucide-boxes', bg: 'bg-warning/10 text-warning' },
  { label: 'Pendapatan Hari Ini', value: formatRupiah(stats.value?.today?.revenue), icon: 'i-lucide-wallet', bg: 'bg-primary/10 text-primary' },
  { label: 'Pendapatan Bulan Ini', value: formatRupiah(stats.value?.monthRevenue), icon: 'i-lucide-trending-up', bg: 'bg-primary/10 text-primary' },
  { label: 'Transaksi Hari Ini', value: stats.value?.today?.count ?? 0, icon: 'i-lucide-receipt-text', bg: 'bg-secondary/10 text-secondary' },
])

const statCards = computed(() => cards.value.map((c, i) => ({ ...c, color: ['success', 'info', 'warning', 'primary', 'primary', 'secondary'][i] as BadgeColor })))

function formatTime(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
function formatDateTime(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
