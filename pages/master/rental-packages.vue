<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Paket Rental</h1>
        <p class="text-neutral-500 text-sm">Kelola paket rental PlayStation</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah Paket</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada paket">
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
const crud = useCrud<any>('/api/rental-packages')
const { items, loading } = crud

const columns = [
  { id: 'name', key: 'name', label: 'Nama Paket' },
  { id: 'durationDays', key: 'durationDays', label: 'Lama' },
  { id: 'price', key: 'price', label: 'Harga' },
  { id: 'isActive', key: 'isActive', label: 'Status' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', durationDays: 3, price: '50000', isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.name = row?.name || ''
  form.durationDays = row?.durationDays || 3
  form.price = row?.price?.toString() || '50000'
  form.isActive = row ? row.original.isActive : true
  modalOpen.value = true
}

async function onSave() {
  const payload = { ...form, durationDays: Number(form.durationDays), isActive: form.isActive === true || form.isActive === 'true' }
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, payload)
    : await crud.createItem(payload)
  if (ok) modalOpen.value = false
}

async function onDelete(row: any) {
  if (!confirm(`Hapus paket "${row.original.name}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
