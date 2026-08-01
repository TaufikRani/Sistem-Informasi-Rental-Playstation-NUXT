<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Pengguna</h1>
        <p class="text-neutral-500 text-sm">Kelola akun admin & kasir</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah Pengguna</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada pengguna">
        <template #role-cell="{ row }">
          <UBadge :color="row.original.role === 'admin' ? 'warning' : 'info'" variant="subtle">{{ row.original.role === 'admin' ? 'Admin' : 'Kasir' }}</UBadge>
        </template>
        <template #isActive-cell="{ row }">
          <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="subtle">{{ row.original.isActive ? 'Aktif' : 'Nonaktif' }}</UBadge>
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
        <UFormField label="Role" name="role">
          <USelect v-model="form.role" :items="[{ label: 'Kasir', value: 'cashier' }, { label: 'Admin', value: 'admin' }]" />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="form.isActive" :items="[{ label: 'Aktif', value: true }, { label: 'Nonaktif', value: false }]" />
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
const crud = useCrud<any>('/api/users')
const { items, loading } = crud

const columns = [
  { id: 'name', key: 'name', label: 'Nama' },
  { id: 'username', key: 'username', label: 'Username' },
  { id: 'role', key: 'role', label: 'Role' },
  { id: 'isActive', key: 'isActive', label: 'Status' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', username: '', password: '', role: 'cashier', isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.username = row?.username || ''
  form.password = ''
  form.role = row?.role || 'cashier'
  form.isActive = row ? row.original.isActive : true
  modalOpen.value = true
}

async function onSave() {
  const payload: Record<string, unknown> = {
    name: form.name,
    username: form.username,
    role: form.role,
    isActive: form.isActive === true || form.isActive === 'true',
  }
  if (form.password) payload.password = form.password
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, payload)
    : await crud.createItem(payload)
  if (ok) modalOpen.value = false
}

async function onDelete(row: any) {
  if (!confirm(`Hapus pengguna "${row.original.name}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
