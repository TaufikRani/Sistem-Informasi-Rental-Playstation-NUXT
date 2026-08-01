<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Rental PS</h1>
        <p class="text-neutral-500 text-sm">Kelola rental PlayStation</p>
      </div>
      <UButton icon="i-lucide-plus" @click="createOpen = true">Buat Rental</UButton>
    </div>

    <div class="flex gap-2">
      <UButtonGroup size="sm">
        <UButton :color="statusFilter === 'active' ? 'primary' : 'neutral'" variant="soft" @click="statusFilter = 'active'">Menunggu Kembali</UButton>
        <UButton :color="statusFilter === 'completed' ? 'primary' : 'neutral'" variant="soft" @click="statusFilter = 'completed'">Selesai</UButton>
        <UButton :color="statusFilter === 'all' ? 'primary' : 'neutral'" variant="soft" @click="statusFilter = 'all'">Semua</UButton>
      </UButtonGroup>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada rental">
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'waiting_return' ? 'warning' : row.original.status === 'completed' ? 'success' : 'neutral'" variant="subtle">
            {{ TRANSACTION_STATUS_LABEL[row.original.status] }}
          </UBadge>
        </template>
        <template #dueDate-cell="{ row }">
          <span :class="{ 'text-error font-semibold': isLate(row) }">
            {{ formatDateTime(row.original.dueDate) }}
          </span>
        </template>
        <template #penalty-cell="{ row }">
          <span v-if="Number(row.original.penaltyAmount) > 0" class="text-error font-semibold">{{ formatRupiah(row.original.penaltyAmount) }}</span>
          <span v-else class="text-neutral-400">-</span>
        </template>
        <template #grandTotal-cell="{ row }">
          {{ row.original.status === 'waiting_return' ? formatRupiah(row.original.grandTotal) : formatRupiah(row.original.grandTotal) }}
        </template>
        <template #actions-cell="{ row }">
          <UButton size="sm" color="neutral" variant="soft" @click="navigateTo(`/rental/${row.original.id}`)">
            {{ row.original.status === 'waiting_return' ? 'Pengembalian' : 'Detail' }}
          </UButton>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="createOpen">
      <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
          <div class="font-semibold">Buat Rental Baru</div>
        </template>

        <UFormField label="Customer">
          <USelect v-model="form.customerId" :items="customerOptions" searchable />
        </UFormField>
        <UFormField label="PlayStation" required>
          <USelect v-model="form.playstationId" :items="psOptions" searchable />
        </UFormField>
        <UFormField label="Stick (opsional)">
          <USelect v-model="form.controllerId" :items="controllerOptions" searchable />
        </UFormField>
        <UFormField label="Paket Rental" required>
          <USelect v-model="form.packageId" :items="packageOptions" />
        </UFormField>
        <div v-if="selectedPackage" class="text-sm text-neutral-500">
          Jatuh tempo: <span class="font-semibold text-neutral-800 dark:text-neutral-200">{{ dueDateLabel }}</span>
        </div>
        <UFormField label="Catatan">
          <UTextarea v-model="form.notes" />
        </UFormField>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" :icon="null" />

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="outline" @click="createOpen = false">Batal</UButton>
          <UButton :loading="saving" @click="onCreate">Buat Rental</UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { data: customers } = await useFetch('/api/customers')
const { data: playstations } = await useFetch('/api/playstations')
const { data: controllers } = await useFetch('/api/controllers')
const { data: packages } = await useFetch('/api/rental-packages')

const statusFilter = ref('active')
const items = ref<any[]>([])
const loading = ref(false)

const columns = [
  { id: 'invoiceNumber', key: 'invoiceNumber', label: 'Invoice' },
  { id: 'customerName', key: 'customerName', label: 'Customer' },
  { id: 'playstationName', key: 'playstationName', label: 'PlayStation' },
  { id: 'dueDate', key: 'dueDate', label: 'Jatuh Tempo' },
  { id: 'penalty', key: 'penalty', label: 'Denda' },
  { id: 'status', key: 'status', label: 'Status' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

async function fetchItems() {
  loading.value = true
  try {
    items.value = await $fetch(`/api/transactions/rental?status=${statusFilter.value}`)
  } finally {
    loading.value = false
  }
}

watch(statusFilter, () => fetchItems())
onMounted(() => fetchItems())

function isLate(row: any) {
  return row.original.status === 'waiting_return' && new Date(row.original.dueDate).getTime() < Date.now()
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const customerOptions = computed(() => [
  { label: 'Umum (tanpa customer)', value: null },
  ...(customers.value || []).map((c: any) => ({ label: c.name + (c.phone ? ` — ${c.phone}` : ''), value: c.id })),
])

const psOptions = computed(() => (playstations.value || [])
  .filter((p: any) => p.status === 'ready')
  .map((p: any) => ({ label: `${p.assetCode} — ${p.name}`, value: p.id })))

const controllerOptions = computed(() => [
  { label: 'Tanpa stick', value: null },
  ...(controllers.value || []).filter((c: any) => c.status === 'ready').map((c: any) => ({ label: `${c.assetCode} — No. ${c.controllerNumber}`, value: c.id })),
])

const packageOptions = computed(() => (packages.value || [])
  .filter((p: any) => p.isActive)
  .map((p: any) => ({ label: `${p.name} — ${formatRupiah(p.price)}`, value: p.id })))

const form = reactive({ customerId: null, playstationId: null, controllerId: null, packageId: null, notes: '' })
const createOpen = ref(false)
const saving = ref(false)
const error = ref('')

const selectedPackage = computed(() => (packages.value || []).find((p: any) => p.id === Number(form.packageId)))
const dueDateLabel = computed(() => {
  if (!selectedPackage.value) return '-'
  const d = new Date()
  d.setDate(d.getDate() + selectedPackage.value.durationDays)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

async function onCreate() {
  saving.value = true
  error.value = ''
  try {
    if (!form.playstationId || !form.packageId) {
      throw { data: { statusMessage: 'Pilih PlayStation dan paket rental' } }
    }
    const res = await $fetch('/api/transactions/rental', {
      method: 'POST',
      body: {
        customerId: form.customerId,
        playstationId: form.playstationId,
        controllerId: form.controllerId,
        packageId: form.packageId,
        notes: form.notes,
      },
    })
    createOpen.value = false
    await fetchItems()
    await navigateTo(`/rental/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal membuat rental'
  } finally {
    saving.value = false
  }
}
</script>
