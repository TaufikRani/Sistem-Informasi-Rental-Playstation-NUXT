<script setup lang="ts">
const crud = useCrud<any>('/api/televisions')
const { items, loading } = crud
const { data: rooms } = await useFetch('/api/rooms')

const columns = [
  { accessorKey: 'assetCode', header: 'Kode Aset' },
  { accessorKey: 'name', header: 'Nama' },
  { id: 'room', header: 'Room' },
  { accessorKey: 'size', header: 'Ukuran' },
  { accessorKey: 'serialNumber', header: 'Serial Number' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
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

const deleteOpen = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

function openDelete(row: any) {
  deleteTarget.value = row
  deleteOpen.value = true
}

async function onDelete() {
  deleting.value = true
  await crud.deleteItem(deleteTarget.value.original.id)
  deleting.value = false
  deleteOpen.value = false
}

onMounted(() => crud.fetchItems())
</script>

<template>
  <UDashboardPanel id="televisions">
    <template #header>
      <UDashboardNavbar title="TV">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah TV
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola perangkat TV
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada TV">
          <template #status-cell="{ row }">
            <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ ASSET_STATUS_LABEL[row.original.status] || row.original.status }}</UBadge>
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
        </template>
      </UModal>

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Hapus TV"

        :loading="deleting"
              >
        <span>Hapus <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
