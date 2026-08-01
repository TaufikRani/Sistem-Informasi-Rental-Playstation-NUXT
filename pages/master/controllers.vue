<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Stick</h1>
        <p class="text-neutral-500 text-sm">Kelola perangkat stick (controller)</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah Stick</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada stick">
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
          <div class="font-semibold">{{ editing ? 'Ubah Stick' : 'Tambah Stick' }}</div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Kode Aset" name="assetCode" required>
            <UInput v-model="form.assetCode" placeholder="STK-11" />
          </UFormField>
          <UFormField label="Nomor Stick" name="controllerNumber" required>
            <UInput v-model="form.controllerNumber" placeholder="11" />
          </UFormField>
          <UFormField label="Room">
            <USelect v-model="form.roomId" :items="roomOptions" />
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
const crud = useCrud<any>('/api/controllers')
const { items, loading } = crud
const { data: rooms } = await useFetch('/api/rooms')

const columns = [
  { id: 'assetCode', key: 'assetCode', label: 'Kode Aset' },
  { id: 'controllerNumber', key: 'controllerNumber', label: 'Nomor Stick' },
  { id: 'room', key: 'room', label: 'Room' },
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
const form = reactive({ assetCode: '', controllerNumber: '', roomId: null, condition: 'good', status: 'ready', notes: '' })

function openModal(row?: any) {
  editing.value = row || null
  form.assetCode = row?.assetCode || ''
  form.controllerNumber = row?.controllerNumber || ''
  form.roomId = row?.roomId ?? null
  form.condition = row?.condition || 'good'
  form.status = row?.status || 'ready'
  form.notes = row?.notes || ''
  modalOpen.value = true
}

async function onSave() {
  const payload = {
    assetCode: form.assetCode,
    controllerNumber: form.controllerNumber,
    roomId: form.roomId,
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
  if (!confirm(`Hapus stick "${row.original.assetCode}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
