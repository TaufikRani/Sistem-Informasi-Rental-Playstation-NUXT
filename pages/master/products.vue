<script setup lang="ts">
const crud = useCrud<any>('/api/products')
const { items, loading } = crud

const columns = [
  { accessorKey: 'productCode', header: 'Kode' },
  { accessorKey: 'name', header: 'Nama' },
  { accessorKey: 'category', header: 'Kategori' },
  { accessorKey: 'price', header: 'Harga' },
  { accessorKey: 'stock', header: 'Stok' },
  { accessorKey: 'minimumStock', header: 'Min Stok' },
  { accessorKey: 'isActive', header: 'Status' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const categoryOptions = [
  { label: 'Makanan', value: 'food' },
  { label: 'Minuman', value: 'drink' },
  { label: 'Layanan', value: 'service' },
  { label: 'Lain-lain', value: 'other' },
]

const activeOptions = [
  { label: 'Aktif', value: true },
  { label: 'Nonaktif', value: false },
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
  form.isActive = row?.isActive ?? true
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
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="Produk">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" @click="openModal()">
            Tambah Produk
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola produk & layanan tambahan
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard>
        <ScrollableTable :data="items" :loading="loading" :columns="columns" empty="Belum ada produk">
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
        title="Hapus Produk"

        :loading="deleting"
              >
        <span>Hapus produk <strong>{{ deleteTarget?.original?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</span>
      </ConfirmModal>
    </template>
  </UDashboardPanel>
</template>
