<script setup lang="ts">
const crud = useCrud<any>('/api/play-rates')
const { items, loading } = crud

const columns = [
  { accessorKey: 'name', header: 'Nama Tarif' },
  { accessorKey: 'roomType', header: 'Jenis Room' },
  { accessorKey: 'hourlyRate', header: 'Harga/Jam' },
  { accessorKey: 'isActive', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const roomTypeOptions = [
  { label: 'Reguler', value: 'reguler' },
  { label: 'VIP', value: 'vip' },
  { label: 'Premium', value: 'premium' },
]

const activeOptions = [
  { label: 'Aktif', value: true },
  { label: 'Nonaktif', value: false },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', roomType: 'reguler', hourlyRate: '5000', isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.roomType = row?.roomType || 'reguler'
  form.hourlyRate = row?.hourlyRate?.toString() || '5000'
  form.isActive = row?.isActive ?? true
  modalOpen.value = true
}

async function onSave() {
  const payload = { ...form, isActive: form.isActive === true || form.isActive === 'true' }
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
  <UDashboardPanel id="play-rates">
    <template #header>
      <UDashboardNavbar title="Tarif Main">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Tarif
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola tarif main per jenis room
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada tarif">
          <template #roomType-cell="{ row }">
            <UBadge color="neutral" variant="outline">{{ ROOM_TYPE_LABEL[row.original.roomType] || row.original.roomType }}</UBadge>
          </template>
          <template #hourlyRate-cell="{ row }">
            {{ formatRupiah(row.original.hourlyRate) }}/jam
          </template>
          <template #isActive-cell="{ row }">
            <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="subtle">{{ row.original.isActive ? 'Aktif' : 'Nonaktif' }}</UBadge>
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
            <div class="font-semibold">{{ editing ? 'Ubah Tarif' : 'Tambah Tarif' }}</div>
          </template>

          <UFormField label="Nama Tarif" name="name" required>
            <UInput v-model="form.name" placeholder="Reguler" />
          </UFormField>
          <UFormField label="Jenis Room" name="roomType" required>
            <USelect v-model="form.roomType" :items="roomTypeOptions" />
          </UFormField>
          <UFormField label="Harga Per Jam" name="hourlyRate" required>
            <UInput v-model="form.hourlyRate" type="number" min="0">
              <template #trailing>Rp</template>
            </UInput>
          </UFormField>
          <UFormField label="Status">
            <USelect v-model="form.isActive" :items="activeOptions" />
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
        title="Hapus Tarif"

        :loading="deleting"
              >
        <span>Hapus tarif <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
