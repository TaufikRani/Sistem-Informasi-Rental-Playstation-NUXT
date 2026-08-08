<script setup lang="ts">
const { data: rooms, refresh } = await useFetch('/api/rooms')
const { data: activeMains } = await useFetch('/api/transactions/main')
const { data: rates } = await useFetch('/api/play-rates')
const { data: customers } = await useFetch('/api/customers')

const toast = useToast()

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

const nowTick = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})
onUnmounted(() => timer && clearInterval(timer))

function elapsedLabel(active: any) {
  if (!active?.startedAt) return 'Sedang bermain'
  const s = Math.max(0, Math.floor((nowTick.value - new Date(active.startedAt).getTime()) / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h} jam ${m} menit ${sec} detik`
}

const stats = computed(() => {
  const s = { ready: 0, occupied: 0, maintenance: 0 }
  for (const r of rooms.value || []) s[r.status] = (s[r.status] || 0) + 1
  return s
})

function rateLabel(room: any) {
  const rate = rates.value?.find((r: any) => r.id === room.playRateId && r.isActive)
  return rate ? `${rate.name} • ${formatRupiah(rate.hourlyRate)}/jam` : '-'
}

function psUnavailable(room: any) {
  return !!room.playstationName && room.playstationStatus !== 'ready'
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
    toast.add({ title: 'Sesi main dimulai', color: 'success' })
    await refresh()
    await navigateTo(`/main/${res.id}`)
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || 'Gagal mulai main', color: 'error' })
  }
}

await refresh()
</script>

<template>
  <UDashboardPanel id="main">
    <template #header>
      <UDashboardNavbar title="Main di Tempat">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UInput v-model="customerSearch" icon="i-lucide-search" placeholder="Cari customer..." class="max-w-40" />
          <USelect v-model="selectedCustomer" :items="customerOptions" class="max-w-52" />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Mulai dan kelola sesi bermain
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <UCard
            v-for="room in rooms"
            :key="room.id"
            :ui="{ body: 'p-5' }"
            class="transition-shadow"
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="text-lg font-semibold">{{ room.name }}</div>
              <UBadge :color="statusColor(room.status)" variant="subtle">{{ ROOM_STATUS_LABEL[room.status] || room.status }}</UBadge>
            </div>

            <div class="mb-4 text-sm text-muted">{{ rateLabel(room) }}</div>

            <div v-if="room.playstationName" class="mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-gamepad-2" class="size-4 shrink-0 text-primary" />
              <span class="text-sm font-medium">{{ room.playstationName }}</span>
              <span class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted">{{ room.playstationCode }}</span>
              <UBadge v-if="room.playstationStatus !== 'ready'" :color="room.playstationStatus === 'maintenance' ? 'warning' : 'info'" variant="subtle" size="sm">
                {{ ASSET_STATUS_LABEL[room.playstationStatus] }}
              </UBadge>
            </div>

            <UButton
              block
              :color="room.status === 'occupied' ? 'info' : 'primary'"
              :disabled="room.status === 'maintenance' || (room.status === 'ready' && psUnavailable(room))"
              @click="room.status === 'occupied' ? openDetail(activeByRoom[room.id]?.id) : startMain(room)"
            >
              {{ room.status === 'occupied' ? 'Kelola Sesi' : room.status === 'maintenance' ? 'Maintenance' : 'Mulai Main' }}
            </UButton>

            <div v-if="room.status === 'occupied'" class="mt-3 flex items-center justify-center gap-1 text-xs text-info">
              <UIcon name="i-lucide-clock" class="size-3" /> {{ elapsedLabel(activeByRoom[room.id]) }}
            </div>
          </UCard>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <UCard>
            <div class="text-2xl font-bold text-success">{{ stats.ready }}</div>
            <div class="text-sm text-muted">Room Tersedia</div>
          </UCard>
          <UCard>
            <div class="text-2xl font-bold text-info">{{ stats.occupied }}</div>
            <div class="text-sm text-muted">Sedang Dipakai</div>
          </UCard>
          <UCard>
            <div class="text-2xl font-bold text-warning">{{ stats.maintenance }}</div>
            <div class="text-sm text-muted">Maintenance</div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
