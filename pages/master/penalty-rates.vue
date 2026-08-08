<script setup lang="ts">
const crud = useCrud<any>('/api/penalty-rates')
const { items, loading } = crud

const columns = [
  { accessorKey: 'name', header: 'Nama Denda' },
  { accessorKey: 'type', header: 'Tipe' },
  { accessorKey: 'amount', header: 'Tarif' },
  { accessorKey: 'isActive', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const typeOptions = [
  { label: 'Per Jam', value: 'hourly' },
  { label: 'Per Hari', value: 'daily' },
  { label: 'Tetap', value: 'fixed' },
]

const activeOptions = [
  { label: 'Aktif', value: true },
  { label: 'Nonaktif', value: false },
]

const PENALTY_TYPE_LABEL: Record<string, string> = { hourly: 'Per Jam', daily: 'Per Hari', fixed: 'Tetap' }

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', type: 'hourly', amount: '5000', isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.type = row?.type || 'hourly'
  form.amount = row?.amount?.toString() || '5000'
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
  const ok = await crud.deleteItem(deleteTarget.value.original.id)
  deleting.value = false
  if (ok) deleteOpen.value = false
}

onMounted(() => crud.fetchItems())
</script>

<template>
  <UDashboardPanel id="penalty-rates">
    <template #header>
      <UDashboardNavbar title="Master Denda">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Denda
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola tarif denda keterlambatan
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada denda">
          <template #amount-cell="{ row }">
            {{ formatRupiah(row.original.amount) }}
          </template>
          <template #type-cell="{ row }">
            <UBadge color="neutral" variant="outline">{{ PENALTY_TYPE_LABEL[row.original.type] || row.original.type }}</UBadge>
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
            <div class="font-semibold">{{ editing ? 'Ubah Denda' : 'Tambah Denda' }}</div>
          </template>

          <UFormField label="Nama Denda" name="name" required>
            <UInput v-model="form.name" placeholder="Denda Standar" />
          </UFormField>
          <UFormField label="Tipe" name="type" required>
            <USelect v-model="form.type" :items="typeOptions" />
          </UFormField>
          <UFormField label="Tarif" name="amount" required>
            <UInput v-model="form.amount" type="number" min="0">
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
        title="Hapus Denda"
        @confirm="onDelete"
        :loading="deleting"
      >
        <span>Hapus denda <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
