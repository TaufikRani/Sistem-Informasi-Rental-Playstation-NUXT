<script setup lang="ts">
const crud = useCrud<any>('/api/playstations')
const { items, loading } = crud
const { data: rooms } = await useFetch('/api/rooms')

const columns = [
  { accessorKey: 'assetCode', header: 'Kode Aset' },
  { accessorKey: 'name', header: 'Nama' },
  { id: 'room', header: 'Room' },
  { accessorKey: 'brand', header: 'Merek' },
  { accessorKey: 'condition', header: 'Kondisi' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const roomOptions = computed(() => [
  { label: 'Tanpa Room', value: null },
  ...(rooms.value || []).map((r: any) => ({ label: r.name, value: r.id })),
])

function roomName(id: number | null) {
  if (id === null || id === undefined) return 'Tanpa Room'
  return rooms.value?.find((r: any) => r.id === id)?.name || '-'
}

const conditionOptions = [
  { label: 'Baik', value: 'good' },
  { label: 'Cukup', value: 'fair' },
  { label: 'Rusak', value: 'broken' },
]

const statusOptions = [
  { label: 'Ready', value: 'ready' },
  { label: 'Dipakai', value: 'in_use' },
  { label: 'Rental', value: 'rented' },
  { label: 'Maintenance', value: 'maintenance' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({
  assetCode: '', name: '', roomId: null, brand: '', series: '',
  serialNumber: '', purchaseDate: '', condition: 'good', status: 'ready', notes: '',
})

function openModal(row?: any) {
  if (row) {
    const data = row.original || row
    editing.value = data
    form.assetCode = data.assetCode || ''
    form.name = data.name || ''
    form.roomId = data.roomId ?? null
    form.brand = data.brand || ''
    form.series = data.series || ''
    form.serialNumber = data.serialNumber || ''
    form.purchaseDate = data.purchaseDate || ''
    form.condition = data.condition || 'good'
    form.status = data.status || 'ready'
    form.notes = data.notes || ''
  } else {
    editing.value = null
    form.assetCode = ''
    form.name = ''
    form.roomId = null
    form.brand = ''
    form.series = ''
    form.serialNumber = ''
    form.purchaseDate = ''
    form.condition = 'good'
    form.status = 'ready'
    form.notes = ''
  }
  modalOpen.value = true
}

async function onSave() {
  const payload = {
    assetCode: form.assetCode,
    name: form.name,
    roomId: form.roomId,
    brand: form.brand,
    series: form.series,
    serialNumber: form.serialNumber,
    purchaseDate: form.purchaseDate || null,
    condition: form.condition,
    status: form.status,
    notes: form.notes,
  }
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, payload)
    : await crud.createItem(payload)
  if (ok) modalOpen.value = false
}

const deleteOpen = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

function openDelete(row: any) {
  deleteTarget.value = row
  deleteOpen.value = true
}

async function onDelete() {
  deleting.value = true
  const ok = await crud.deleteItem(deleteTarget.value.original.id)
  deleting.value = false
  if (ok) deleteOpen.value = false
}

onMounted(() => crud.fetchItems())
</script>

<template>
  <UDashboardPanel id="playstations">
    <template #header>
      <UDashboardNavbar title="PlayStation">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah PS
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola perangkat PlayStation
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada PlayStation">
          <template #status-cell="{ row }">
            <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ ASSET_STATUS_LABEL[row.original.status] || row.original.status }}</UBadge>
          </template>
          <template #condition-cell="{ row }">
            <UBadge color="neutral" variant="outline">{{ ASSET_CONDITION_LABEL[row.original.condition] || row.original.condition }}</UBadge>
          </template>
          <template #room-cell="{ row }">
            {{ roomName(row.original.roomId) }}
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-1">
              <UButton color="neutral" variant="ghost" icon="i-lucide-pencil" size="sm" @click="openModal(row)" />
              <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="sm" @click="openDelete(row)" />
            </div>
          </template>
        </ScrollableTable>
      </UCard>

      <UModal v-model:open="modalOpen">
        <template #content>
          <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div class="font-semibold">{{ editing ? 'Ubah PlayStation' : 'Tambah PlayStation' }}</div>
          </template>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Kode Aset" name="assetCode">
              <UInput v-model="form.assetCode" :disabled="!!editing" placeholder="Kosongkan untuk auto-generate" />
            </UFormField>
            <UFormField label="Nama" name="name" required>
              <UInput v-model="form.name" placeholder="PlayStation 5" />
            </UFormField>
            <UFormField label="Room">
              <USelect v-model="form.roomId" :items="roomOptions" />
            </UFormField>
            <UFormField label="Merek">
              <UInput v-model="form.brand" placeholder="Sony" />
            </UFormField>
            <UFormField label="Seri">
              <UInput v-model="form.series" placeholder="PS5" />
            </UFormField>
            <UFormField label="Serial Number">
              <UInput v-model="form.serialNumber" />
            </UFormField>
            <UFormField label="Tanggal Pembelian">
              <UInput v-model="form.purchaseDate" type="date" />
            </UFormField>
            <UFormField label="Kondisi">
              <USelect v-model="form.condition" :items="conditionOptions" />
            </UFormField>
          </div>
          <UFormField v-if="editing" label="Status">
            <USelect v-model="form.status" :items="statusOptions" />
          </UFormField>
          <UFormField label="Catatan">
            <UTextarea v-model="form.notes" />
          </UFormField>

          <UAlert v-if="crud.error.value" color="error" variant="subtle" :title="crud.error.value" :icon="null" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="modalOpen = false">Batal</UButton>
            <UButton :loading="crud.saving.value" @click="onSave">Simpan</UButton>
          </div>
          </UCard>
        </template>
      </UModal>

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Hapus PlayStation"
        @confirm="onDelete"

        :loading="deleting"
              >
        <span>Hapus <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
