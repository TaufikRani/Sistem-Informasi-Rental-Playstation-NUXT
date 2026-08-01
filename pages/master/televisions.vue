<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">TV</h1>
        <p class="text-neutral-500 text-sm">Kelola perangkat TV</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah TV</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada TV">
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ ASSET_STATUS_LABEL[row.original.status] || row.original.status }}</UBadge>
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
          <div class="font-semibold">{{ editing ? 'Ubah TV' : 'Tambah TV' }}</div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Kode Aset" name="assetCode" required>
            <UInput v-model="form.assetCode" placeholder="TV-006" />
          </UFormField>
          <UFormField label="Nama" name="name" required>
            <UInput v-model="form.name" placeholder="TV Room 6" />
          </UFormField>
          <UFormField label="Room">
            <USelect v-model="form.roomId" :items="roomOptions" />
          </UFormField>
          <UFormField label="Ukuran">
            <UInput v-model="form.size" placeholder="32 inch" />
          </UFormField>
          <UFormField label="Serial Number">
            <UInput v-model="form.serialNumber" />
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
const crud = useCrud<any>('/api/televisions')
const { items, loading } = crud
const { data: rooms } = await useFetch('/api/rooms')

const columns = [
  { id: 'assetCode', key: 'assetCode', label: 'Kode Aset' },
  { id: 'name', key: 'name', label: 'Nama' },
  { id: 'room', key: 'room', label: 'Room' },
  { id: 'size', key: 'size', label: 'Ukuran' },
  { id: 'serialNumber', key: 'serialNumber', label: 'Serial Number' },
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

const statusOptions = [
  { label: 'Ready', value: 'ready' },
  { label: 'Dipakai', value: 'in_use' },
  { label: 'Maintenance', value: 'maintenance' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ assetCode: '', name: '', roomId: null, size: '', serialNumber: '', status: 'ready', notes: '' })

function openModal(row?: any) {
  editing.value = row || null
  form.assetCode = row?.assetCode || ''
  form.name = row?.name || ''
  form.roomId = row?.roomId ?? null
  form.size = row?.size || ''
  form.serialNumber = row?.serialNumber || ''
  form.status = row?.status || 'ready'
  form.notes = row?.notes || ''
  modalOpen.value = true
}

async function onSave() {
  const payload = {
    assetCode: form.assetCode,
    name: form.name,
    roomId: form.roomId,
    size: form.size,
    serialNumber: form.serialNumber,
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
