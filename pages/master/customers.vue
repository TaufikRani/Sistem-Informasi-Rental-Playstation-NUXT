<script setup lang="ts">
const crud = useCrud<any>('/api/customers')
const { items, loading } = crud
const search = ref('')

const columns = [
  { accessorKey: 'name', header: 'Nama' },
  { accessorKey: 'phone', header: 'Telepon' },
  { accessorKey: 'identityNumber', header: 'No. Identitas' },
  { accessorKey: 'createdAt', header: 'Terdaftar' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter((c: any) => (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q))
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', phone: '', address: '', identityNumber: '' })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.phone = row?.phone || ''
  form.address = row?.address || ''
  form.identityNumber = row?.identityNumber || ''
  modalOpen.value = true
}

async function onSave() {
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, { ...form })
    : await crud.createItem({ ...form })
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
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="Customer">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Cari nama/telepon..." class="max-w-64" />
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Customer
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola data pelanggan
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="filtered" :loading="loading" :columns="columns" empty="Belum ada customer">
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
            <div class="font-semibold">{{ editing ? 'Ubah Customer' : 'Tambah Customer' }}</div>
          </template>

          <UFormField label="Nama" name="name" required>
            <UInput v-model="form.name" placeholder="Budi" />
          </UFormField>
          <UFormField label="No. Telepon">
            <UInput v-model="form.phone" placeholder="08xxxxxxxxxx" />
          </UFormField>
          <UFormField label="Alamat">
            <UTextarea v-model="form.address" />
          </UFormField>
          <UFormField label="No. Identitas (opsional)">
            <UInput v-model="form.identityNumber" />
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
        title="Hapus Customer"
        @confirm="onDelete"

        :loading="deleting"
              >
        <span>Hapus customer <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
