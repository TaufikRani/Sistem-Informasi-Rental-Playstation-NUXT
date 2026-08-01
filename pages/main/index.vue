<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Main di Tempat</h1>
        <p class="text-neutral-500 text-sm">Mulai dan kelola sesi bermain</p>
      </div>
      <div class="flex items-center gap-2">
        <UInput v-model="customerSearch" icon="i-lucide-search" placeholder="Cari customer..." class="w-56" />
        <USelect v-model="selectedCustomer" :items="customerOptions" class="w-48" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <UCard
        v-for="room in rooms"
        :key="room.id"
        :ui="{ body: 'p-5' }"
        class="transition-shadow"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="font-semibold text-lg">{{ room.name }}</div>
          <UBadge :color="statusColor(room.status)" variant="subtle">{{ ROOM_STATUS_LABEL[room.status] || room.status }}</UBadge>
        </div>
        <div class="text-sm text-neutral-500 mb-4">{{ ROOM_TYPE_LABEL[room.roomType] || room.roomType }} • {{ rateLabel(room.roomType) }}</div>
        <div v-if="room.status === 'occupied'" class="text-xs text-info mb-3 flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-3" /> {{ activeByRoom[room.id]?.startedLabel || 'Sedang bermain' }}
        </div>
        <UButton
          block
          :color="room.status === 'occupied' ? 'info' : 'success'"
          :disabled="room.status === 'maintenance'"
          @click="room.status === 'occupied' ? openDetail(activeByRoom[room.id]?.id) : startMain(room)"
        >
          {{ room.status === 'occupied' ? 'Kelola Sesi' : room.status === 'maintenance' ? 'Maintenance' : 'Mulai Main' }}
        </UButton>
      </UCard>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <div class="text-2xl font-bold text-success">{{ stats.ready }}</div>
        <div class="text-sm text-neutral-500">Room Tersedia</div>
      </UCard>
      <UCard>
        <div class="text-2xl font-bold text-info">{{ stats.occupied }}</div>
        <div class="text-sm text-neutral-500">Sedang Dipakai</div>
      </UCard>
      <UCard>
        <div class="text-2xl font-bold text-warning">{{ stats.maintenance }}</div>
        <div class="text-sm text-neutral-500">Maintenance</div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: rooms, refresh } = await useFetch('/api/rooms')
const { data: activeMains } = await useFetch('/api/transactions/main')
const { data: rates } = await useFetch('/api/play-rates')
const { data: customers } = await useFetch('/api/customers')

const customerSearch = ref('')
const selectedCustomer = ref<number | null>(null)

const customerOptions = computed(() => [
  { label: 'Umum (tanpa customer)', value: null },
  ...(customers.value || [])
    .filter((c: any) => (c.name || '').toLowerCase().includes(customerSearch.value.toLowerCase()))
    .map((c: any) => ({ label: c.name + (c.phone ? ` — ${c.phone}` : ''), value: c.id })),
])

const activeByRoom = computed(() => {
  const map: Record<number, any> = {}
  for (const a of activeMains.value || []) {
    map[a.roomId] = a
  }
  return map
})

const stats = computed(() => {
  const s = { ready: 0, occupied: 0, maintenance: 0 }
  for (const r of rooms.value || []) s[r.status] = (s[r.status] || 0) + 1
  return s
})

function rateLabel(roomType: string) {
  const rate = rates.value?.find((r: any) => r.roomType === roomType && r.isActive)
  return rate ? formatRupiah(rate.hourlyRate) + '/jam' : '-'
}

function openDetail(id?: number) {
  if (id) navigateTo(`/main/${id}`)
}

async function startMain(room: any) {
  try {
    const res = await $fetch('/api/transactions/main', {
      method: 'POST',
      body: { roomId: room.id, customerId: selectedCustomer.value },
    })
    await refresh()
    await navigateTo(`/main/${res.id}`)
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal mulai main')
  }
}

await refresh()
</script>
