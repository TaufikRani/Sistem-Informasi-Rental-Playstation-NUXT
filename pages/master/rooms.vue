<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Room</h1>
        <p class="text-neutral-500 text-sm">Kelola ruangan bermain</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah Room</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada room">
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ ROOM_STATUS_LABEL[row.original.status] || row.original.status }}</UBadge>
        </template>
        <template #roomType-cell="{ row }">
          <UBadge color="neutral" variant="outline">{{ ROOM_TYPE_LABEL[row.original.roomType] || row.original.roomType }}</UBadge>
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
          <div class="font-semibold">{{ editing ? 'Ubah Room' : 'Tambah Room' }}</div>
        </template>

        <UFormField label="Nama Room" name="name" required>
          <UInput v-model="form.name" placeholder="Room 1" />
        </UFormField>
        <UFormField label="Jenis Room" name="roomType" required>
          <USelect v-model="form.roomType" :items="roomTypeOptions" />
        </UFormField>
        <UFormField v-if="editing" label="Status" name="status">
          <USelect v-model="form.status" :items="statusOptions" />
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
const crud = useCrud<any>('/api/rooms')
const { items, loading } = crud

const columns = [
  { id: 'name', key: 'name', label: 'Nama Room' },
  { id: 'roomType', key: 'roomType', label: 'Jenis' },
  { id: 'status', key: 'status', label: 'Status' },
  { id: 'actions', key: 'actions', label: '' },
]

const roomTypeOptions = [
  { label: 'Reguler', value: 'reguler' },
  { label: 'VIP', value: 'vip' },
  { label: 'Premium', value: 'premium' },
]

const statusOptions = [
  { label: 'Ready', value: 'ready' },
  { label: 'Dipakai', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', roomType: 'reguler', status: 'ready' })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.roomType = row?.roomType || 'reguler'
  form.status = row?.status || 'ready'
  modalOpen.value = true
}

async function onSave() {
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, { ...form })
    : await crud.createItem({ ...form })
  if (ok) modalOpen.value = false
}

async function onDelete(row: any) {
  if (!confirm(`Hapus room "${row.original.name}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
