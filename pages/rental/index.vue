<script setup lang="ts">
const toast = useToast()

const { data: customers } = await useFetch('/api/customers')
const { data: playstations } = await useFetch('/api/playstations')
const { data: controllers } = await useFetch('/api/controllers')
const { data: packages } = await useFetch('/api/rental-packages')

const statusFilter = ref('waiting_return')
const items = ref<any[]>([])
const loading = ref(false)

const columns = [
  { accessorKey: 'invoiceNumber', header: 'Invoice' },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'identityNumber', header: 'Identitas' },
  { accessorKey: 'playstationName', header: 'PlayStation' },
  { accessorKey: 'dueDate', header: 'Jatuh Tempo' },
  { id: 'penalty', header: 'Denda' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
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

const customerOptions = computed(() => (customers.value || [])
  .map((c: any) => ({
    label: c.name + (c.phone ? ` — ${c.phone}` : '') + (c.identityNumber ? ` (${c.identityNumber})` : ''),
    value: c.id,
  })))

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

function openCreate() {
  error.value = ''
  form.customerId = null
  form.playstationId = null
  form.controllerId = null
  form.packageId = null
  form.notes = ''
  createOpen.value = true
}

async function onCreate() {
  saving.value = true
  error.value = ''
  try {
    if (!form.customerId || !form.playstationId || !form.packageId) {
      throw { data: { statusMessage: 'Pilih customer, PlayStation, dan paket rental' } }
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
    toast.add({ title: 'Rental berhasil dibuat', color: 'success' })
    await fetchItems()
    await navigateTo(`/rental/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal membuat rental'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="rental">
    <template #header>
      <UDashboardNavbar title="Rental PS">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openCreate">
            Buat Rental
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <div class="flex items-center gap-1.5">
            <UButton size="sm" :color="statusFilter === 'waiting_return' ? 'primary' : 'neutral'" variant="soft" @click="statusFilter = 'waiting_return'">
              Menunggu Kembali
            </UButton>
            <UButton size="sm" :color="statusFilter === 'completed' ? 'primary' : 'neutral'" variant="soft" @click="statusFilter = 'completed'">
              Selesai
            </UButton>
            <UButton size="sm" :color="statusFilter === 'all' ? 'primary' : 'neutral'" variant="soft" @click="statusFilter = 'all'">
              Semua
            </UButton>
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada rental">
          <template #identityNumber-cell="{ row }">
            <span v-if="row.original.identityNumber" class="font-mono text-xs">{{ row.original.identityNumber }}</span>
            <span v-else class="text-muted">-</span>
          </template>
          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 'waiting_return' ? 'warning' : row.original.status === 'completed' ? 'success' : 'neutral'" variant="subtle">
              {{ TRANSACTION_STATUS_LABEL[row.original.status] }}
            </UBadge>
          </template>
          <template #dueDate-cell="{ row }">
            <span :class="{ 'font-semibold text-error': isLate(row) }">
              {{ formatDateTime(row.original.dueDate) }}
            </span>
          </template>
          <template #penalty-cell="{ row }">
            <span v-if="Number(row.original.penaltyAmount) > 0" class="font-semibold text-error">{{ formatRupiah(row.original.penaltyAmount) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UButton size="sm" color="neutral" variant="soft" @click="navigateTo(`/rental/${row.original.id}`)">
                {{ row.original.status === 'waiting_return' ? 'Pengembalian' : 'Detail' }}
              </UButton>
            </div>
          </template>
        </ScrollableTable>
      </UCard>

      <UModal v-model:open="createOpen" :ui="{ content: 'w-[calc(100vw-2rem)] max-w-2xl!' }">
        <template #content>
          <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div class="font-semibold">Buat Rental Baru</div>
          </template>

          <UFormField label="Customer" required :hint="'Wajib — jaminan identitas untuk barang rental'">
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
          <div v-if="selectedPackage" class="text-sm text-muted">
            Jatuh tempo: <span class="font-semibold text-foreground">{{ dueDateLabel }}</span>
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
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
