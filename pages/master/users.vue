<script setup lang="ts">
const crud = useCrud<any>('/api/users')
const { items, loading } = crud

const columns = [
  { accessorKey: 'name', header: 'Nama' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'isActive', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const activeOptions = [
  { label: 'Aktif', value: true },
  { label: 'Nonaktif', value: false },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', username: '', password: '', role: 'admin', isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.username = row?.username || ''
  form.password = ''
  form.role = 'admin'
  form.isActive = row?.isActive ?? true
  modalOpen.value = true
}

async function onSave() {
  const payload: Record<string, unknown> = {
    name: form.name,
    username: form.username,
    isActive: form.isActive === true || form.isActive === 'true',
  }
  if (form.password) payload.password = form.password
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
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Pengguna">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Pengguna
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola akun admin
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada pengguna">
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
            <div class="font-semibold">{{ editing ? 'Ubah Pengguna' : 'Tambah Pengguna' }}</div>
          </template>

          <UFormField label="Nama" name="name" required>
            <UInput v-model="form.name" placeholder="Nama Kasir" />
          </UFormField>
          <UFormField label="Username" name="username" required>
            <UInput v-model="form.username" placeholder="kasir2" />
          </UFormField>
          <UFormField :label="editing ? 'Password (kosongkan jika tidak diubah)' : 'Password'" name="password" :required="!editing">
            <UInput v-model="form.password" type="password" placeholder="min. 6 karakter" />
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
        title="Hapus Pengguna"
        @confirm="onDelete"

        :loading="deleting"
              >
        <span>Hapus pengguna <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
