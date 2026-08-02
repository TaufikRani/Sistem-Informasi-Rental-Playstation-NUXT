<script setup lang="ts">
const toast = useToast()

const { data: products, refresh: refreshProducts, pending: loadingProducts } = await useFetch('/api/products')
const movements = ref<any[]>([])
const loadingMovements = ref(false)

const productColumns = [
  { accessorKey: 'productCode', header: 'Kode' },
  { accessorKey: 'name', header: 'Produk' },
  { accessorKey: 'price', header: 'Harga' },
  { accessorKey: 'stock', header: 'Stok' },
  { accessorKey: 'minimumStock', header: 'Min' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const movementColumns = [
  { accessorKey: 'productCode', header: 'Kode' },
  { accessorKey: 'productName', header: 'Produk' },
  { accessorKey: 'movementType', header: 'Tipe' },
  { accessorKey: 'qty', header: 'Qty' },
  { accessorKey: 'stockAfter', header: 'Sisa Stok' },
  { accessorKey: 'reference', header: 'Referensi' },
  { accessorKey: 'createdAt', header: 'Waktu' },
]

async function fetchMovements() {
  loadingMovements.value = true
  try {
    movements.value = await $fetch('/api/stock-movements')
  } finally {
    loadingMovements.value = false
  }
}

const modalOpen = ref(false)
const saving = ref(false)
const error = ref('')
const selectedProduct = ref<any>(null)
const adjustType = ref<'IN' | 'CORRECTION'>('IN')
const form = reactive({ qty: 1, notes: '' })

function openAdjust(row: any, type: 'IN' | 'CORRECTION') {
  selectedProduct.value = row
  adjustType.value = type
  form.qty = 1
  form.notes = ''
  error.value = ''
  modalOpen.value = true
}

async function onSave() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/stock/adjust', {
      method: 'POST',
      body: {
        productId: selectedProduct.value.id,
        movementType: adjustType.value,
        qty: Number(form.qty),
        notes: form.notes,
      },
    })
    modalOpen.value = false
    await refreshProducts()
    await fetchMovements()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal menyesuaikan stok'
  } finally {
    saving.value = false
  }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => fetchMovements())
</script>

<template>
  <UDashboardPanel id="stok">
    <template #header>
      <UDashboardNavbar title="Manajemen Stok">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Kelola stok produk & riwayat pergerakan
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div class="font-semibold">Stok Produk</div>
            </template>

            <ScrollableTable :data="products" :loading="loadingProducts" :columns="productColumns" empty="Belum ada produk">
              <template #price-cell="{ row }">{{ formatRupiah(row.original.price) }}</template>
              <template #stock-cell="{ row }">
                <UBadge :color="row.original.stock <= row.original.minimumStock ? 'error' : 'success'" variant="subtle">{{ row.original.stock }}</UBadge>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex justify-end gap-1">
                  <UButton size="sm" color="success" variant="soft" icon="i-lucide-plus" @click="openAdjust(row, 'IN')" />
                  <UButton size="sm" color="warning" variant="soft" icon="i-lucide-minus" @click="openAdjust(row, 'CORRECTION')" />
                </div>
              </template>
            </ScrollableTable>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-semibold">Riwayat Stok</div>
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-refresh-cw" @click="fetchMovements" />
              </div>
            </template>

            <ScrollableTable :data="movements" :loading="loadingMovements" :columns="movementColumns" empty="Belum ada riwayat">
              <template #movementType-cell="{ row }">
                <UBadge :color="row.original.movementType === 'IN' ? 'success' : 'error'" variant="subtle">
                  {{ row.original.movementType === 'IN' ? 'Masuk' : row.original.movementType === 'OUT' ? 'Keluar' : 'Koreksi' }}
                </UBadge>
              </template>
              <template #qty-cell="{ row }">
                <span :class="Number(row.original.qty) < 0 ? 'text-error' : 'text-success'">{{ Number(row.original.qty) > 0 ? '+' : '' }}{{ row.original.qty }}</span>
              </template>
              <template #createdAt-cell="{ row }">
                {{ formatDateTime(row.original.createdAt) }}
              </template>
            </ScrollableTable>
          </UCard>
        </div>

        <UModal v-model:open="modalOpen">
          <template #content>
            <UCard :ui="{ body: 'space-y-4' }">
            <template #header>
              <div class="font-semibold">
                {{ adjustType === 'IN' ? 'Tambah Stok' : 'Koreksi Stok' }} — {{ selectedProduct?.name }}
              </div>
            </template>

            <div class="text-sm text-muted">
              Stok saat ini: <span class="font-semibold text-foreground">{{ selectedProduct?.stock }}</span>
            </div>
            <UFormField :label="adjustType === 'IN' ? 'Jumlah Masuk' : 'Jumlah Dikurangi'" required>
              <UInput v-model="form.qty" type="number" min="1" />
            </UFormField>
            <UFormField label="Catatan">
              <UTextarea v-model="form.notes" placeholder="Misal: restock dari supplier / stok opname" />
            </UFormField>

            <UAlert v-if="error" color="error" variant="subtle" :title="error" :icon="null" />

            <div class="flex justify-end gap-2 pt-2">
              <UButton color="neutral" variant="outline" @click="modalOpen = false">Batal</UButton>
              <UButton :color="adjustType === 'IN' ? 'success' : 'warning'" :loading="saving" @click="onSave">Simpan</UButton>
            </div>
            </UCard>
          </template>
        </UModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
