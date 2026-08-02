<script setup lang="ts">
const crud = useCrud<any>('/api/rooms')
const { items, loading } = crud

const columns = [
  { accessorKey: 'name', header: 'Nama Room' },
  { accessorKey: 'roomType', header: 'Jenis' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
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

const deleteOpen = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

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
  <UDashboardPanel id="rooms">
    <template #header>
      <UDashboardNavbar title="Room">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Room
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola ruangan bermain
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada room">
          <template #status-cell="{ row }">
            <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ ROOM_STATUS_LABEL[row.original.status] || row.original.status }}</UBadge>
          </template>
          <template #roomType-cell="{ row }">
            <UBadge color="neutral" variant="outline">{{ ROOM_TYPE_LABEL[row.original.roomType] || row.original.roomType }}</UBadge>
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
        </template>
      </UModal>

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Hapus Room"

        :loading="deleting"
              >
        <span>Hapus room <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
