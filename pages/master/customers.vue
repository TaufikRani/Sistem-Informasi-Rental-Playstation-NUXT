<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Customer</h1>
        <p class="text-neutral-500 text-sm">Kelola data pelanggan</p>
      </div>
      <div class="flex gap-2">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Cari nama/telepon..." class="w-64" @keyup.enter="crud.fetchItems" />
        <UButton icon="i-lucide-plus" @click="openModal()">Tambah Customer</UButton>
      </div>
    </div>

    <UCard>
      <UTable :data="filtered" :loading="loading" :columns="columns" empty="Belum ada customer">
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
    </UModal>
  </div>
</template>

<script setup lang="ts">
const crud = useCrud<any>('/api/customers')
const { items, loading } = crud
const search = ref('')

const columns = [
  { id: 'name', key: 'name', label: 'Nama' },
  { id: 'phone', key: 'phone', label: 'Telepon' },
  { id: 'identityNumber', key: 'identityNumber', label: 'No. Identitas' },
  { id: 'createdAt', key: 'createdAt', label: 'Terdaftar' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
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

async function onDelete(row: any) {
  if (!confirm(`Hapus customer "${row.original.name}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
