<script setup lang="ts">
const crud = useCrud<any>('/api/rooms')
const { items, loading } = crud

const columns = [
  { accessorKey: 'name', header: 'Nama Room' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const statusOptions = [
  { label: 'Ready', value: 'ready' },
  { label: 'Dipakai', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', status: 'ready' })

const deleteOpen = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

function openModal(row?: any) {
  if (row) {
    const data = row.original || row
    editing.value = data
    form.name = data.name || ''
    form.status = data.status || 'ready'
  } else {
    editing.value = null
    form.name = ''
    form.status = 'ready'
  }
  modalOpen.value = true
}

async function onSave() {
  const payload = { ...form }
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, payload)
    : await crud.createItem(payload)
  if (ok) modalOpen.value = false
}

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
        @confirm="onDelete"
        :loading="deleting"
      >
        <span>Hapus room <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
