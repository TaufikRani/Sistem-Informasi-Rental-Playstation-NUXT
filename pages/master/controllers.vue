<script setup lang="ts">
const crud = useCrud<any>('/api/controllers')
const { items, loading } = crud
const { data: rooms } = await useFetch('/api/rooms')

const columns = [
  { accessorKey: 'assetCode', header: 'Kode Aset' },
  { accessorKey: 'controllerNumber', header: 'Nomor Stick' },
  { id: 'room', header: 'Room' },
  { accessorKey: 'condition', header: 'Kondisi' },
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
  <UDashboardPanel id="controllers">
    <template #header>
      <UDashboardNavbar title="Stick">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Stick
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola perangkat stick (controller)
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada stick">
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
            <div class="font-semibold">{{ editing ? 'Ubah Stick' : 'Tambah Stick' }}</div>
          </template>

          <div class="grid grid-cols-2 gap-4">
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
        </template>
      </UModal>

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Hapus Stick"
        @confirm="onDelete"

        :loading="deleting"
              >
        <span>Hapus stick <strong>{{ deleteTarget?.original?.assetCode }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
