<script setup lang="ts">
const crud = useCrud<any>('/api/rental-packages')
const { items, loading } = crud

const columns = [
  { accessorKey: 'name', header: 'Nama Paket' },
  { accessorKey: 'durationDays', header: 'Lama' },
  { accessorKey: 'price', header: 'Harga' },
  { accessorKey: 'isActive', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const activeOptions = [
  { label: 'Aktif', value: true },
  { label: 'Nonaktif', value: false },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', durationDays: 3, price: '50000', isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.durationDays = row?.durationDays || 3
  form.price = row?.price?.toString() || '50000'
  form.isActive = row?.isActive ?? true
  modalOpen.value = true
}

async function onSave() {
  const payload = { ...form, durationDays: Number(form.durationDays), isActive: form.isActive === true || form.isActive === 'true' }
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
  <UDashboardPanel id="rental-packages">
    <template #header>
      <UDashboardNavbar title="Paket Rental">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Paket
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola paket rental PlayStation
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada paket">
          <template #price-cell="{ row }">
            {{ formatRupiah(row.original.price) }}
          </template>
          <template #durationDays-cell="{ row }">
            {{ row.original.durationDays }} hari
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
            <div class="font-semibold">{{ editing ? 'Ubah Paket' : 'Tambah Paket' }}</div>
          </template>

          <UFormField label="Nama Paket" name="name" required>
            <UInput v-model="form.name" placeholder="7 Hari" />
          </UFormField>
          <UFormField label="Lama Hari" name="durationDays" required>
            <UInput v-model="form.durationDays" type="number" min="1" />
          </UFormField>
          <UFormField label="Harga" name="price" required>
            <UInput v-model="form.price" type="number" min="0">
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
        title="Hapus Paket"

        :loading="deleting"
              >
        <span>Hapus paket <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
