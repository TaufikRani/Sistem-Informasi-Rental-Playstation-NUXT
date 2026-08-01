<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">PlayStation</h1>
        <p class="text-neutral-500 text-sm">Kelola perangkat PlayStation</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah PS</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada PlayStation">
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
          <div class="flex gap-1 justify-end">
            <UButton color="neutral" variant="ghost" icon="i-lucide-pencil" size="sm" @click="openModal(row)" />
            <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="sm" @click="onDelete(row)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="modalOpen">
      <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
          <div class="font-semibold">{{ editing ? 'Ubah PlayStation' : 'Tambah PlayStation' }}</div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Kode Aset" name="assetCode" required>
            <UInput v-model="form.assetCode" placeholder="PS-006" />
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
    </UModal>
  </div>
</template>

<script setup lang="ts">
const crud = useCrud<any>('/api/playstations')
const { items, loading } = crud
const { data: rooms } = await useFetch('/api/rooms')

const columns = [
  { id: 'assetCode', key: 'assetCode', label: 'Kode Aset' },
  { id: 'name', key: 'name', label: 'Nama' },
  { id: 'room', key: 'room', label: 'Room' },
  { id: 'brand', key: 'brand', label: 'Merek' },
  { id: 'condition', key: 'condition', label: 'Kondisi' },
  { id: 'status', key: 'status', label: 'Status' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

const roomOptions = computed(() => [
  { label: 'Tanpa Room', value: null },
  ...(rooms.value || []).map((r: any) => ({ label: r.name, value: r.id })),
])

function roomName(id: number | null) {
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
  editing.value = row || null
  form.assetCode = row?.assetCode || ''
  form.name = row?.name || ''
  form.roomId = row?.roomId ?? null
  form.brand = row?.brand || ''
  form.series = row?.series || ''
  form.serialNumber = row?.serialNumber || ''
  form.purchaseDate = row?.purchaseDate || ''
  form.condition = row?.condition || 'good'
  form.status = row?.status || 'ready'
  form.notes = row?.notes || ''
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

async function onDelete(row: any) {
  if (!confirm(`Hapus "${row.original.name}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
