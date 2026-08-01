<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Produk</h1>
        <p class="text-neutral-500 text-sm">Kelola produk & layanan tambahan</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openModal()">Tambah Produk</UButton>
    </div>

    <UCard>
      <UTable :data="items" :loading="loading" :columns="columns" empty="Belum ada produk">
        <template #category-cell="{ row }">
          <UBadge color="neutral" variant="outline">{{ PRODUCT_CATEGORY_LABEL[row.original.category] || row.original.category }}</UBadge>
        </template>
        <template #price-cell="{ row }">
          {{ formatRupiah(row.original.price) }}
        </template>
        <template #stock-cell="{ row }">
          <UBadge :color="row.original.stock <= row.original.minimumStock ? 'error' : 'success'" variant="subtle">{{ row.original.stock }}</UBadge>
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
          <div class="font-semibold">{{ editing ? 'Ubah Produk' : 'Tambah Produk' }}</div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Kode Produk" name="productCode" required>
            <UInput v-model="form.productCode" placeholder="PDT-009" />
          </UFormField>
          <UFormField label="Kategori" name="category" required>
            <USelect v-model="form.category" :items="categoryOptions" />
          </UFormField>
          <UFormField label="Nama Produk" name="name" required>
            <UInput v-model="form.name" placeholder="Indomie Goreng" />
          </UFormField>
          <UFormField label="Harga" name="price" required>
            <UInput v-model="form.price" type="number" min="0">
              <template #trailing>Rp</template>
            </UInput>
          </UFormField>
          <UFormField v-if="!editing" label="Stok Awal">
            <UInput v-model="form.stock" type="number" min="0" />
          </UFormField>
          <UFormField label="Minimal Stok">
            <UInput v-model="form.minimumStock" type="number" min="0" />
          </UFormField>
        </div>
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
const crud = useCrud<any>('/api/products')
const { items, loading } = crud

const columns = [
  { id: 'productCode', key: 'productCode', label: 'Kode' },
  { id: 'name', key: 'name', label: 'Nama' },
  { id: 'category', key: 'category', label: 'Kategori' },
  { id: 'price', key: 'price', label: 'Harga' },
  { id: 'stock', key: 'stock', label: 'Stok' },
  { id: 'minimumStock', key: 'minimumStock', label: 'Min Stok' },
  { id: 'isActive', key: 'isActive', label: 'Status' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

const categoryOptions = [
  { label: 'Makanan', value: 'food' },
  { label: 'Minuman', value: 'drink' },
  { label: 'Layanan', value: 'service' },
  { label: 'Lain-lain', value: 'other' },
]

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ productCode: '', name: '', category: 'food', price: '0', stock: 0, minimumStock: 0, isActive: true })

function openModal(row?: any) {
  editing.value = row || null
  form.productCode = row?.productCode || ''
  form.name = row?.name || ''
  form.category = row?.category || 'food'
  form.price = row?.price?.toString() || '0'
  form.stock = row?.stock ?? 0
  form.minimumStock = row?.minimumStock ?? 0
  form.isActive = row ? row.original.isActive : true
  modalOpen.value = true
}

async function onSave() {
  const payload = {
    ...form,
    price: form.price.toString(),
    stock: Number(form.stock),
    minimumStock: Number(form.minimumStock),
    isActive: form.isActive === true || form.isActive === 'true',
  }
  const ok = editing.value
    ? await crud.updateItem(editing.value.id, payload)
    : await crud.createItem(payload)
  if (ok) modalOpen.value = false
}

async function onDelete(row: any) {
  if (!confirm(`Hapus produk "${row.original.name}"?`)) return
  await crud.deleteItem(row.original.id)
}

onMounted(() => crud.fetchItems())
</script>
