<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

const toast = useToast()

const { data, refresh } = await useFetch(`/api/transactions/rental/${id}`)
const { data: products, refresh: refreshProducts } = await useFetch('/api/products')
const { data: penalty } = await useFetch('/api/penalty-rate')

const hourlyPenalty = computed(() => Number(penalty.value?.hourlyPenalty || 0))
const isLate = computed(() => {
  if (data.value?.status !== 'waiting_return') return false
  return new Date(data.value?.dueDate).getTime() < Date.now()
})

const estimatedLateHours = computed(() => {
  const lateMs = Date.now() - new Date(data.value?.dueDate).getTime()
  return lateMs > 0 ? Math.ceil(lateMs / 3600000) : 0
})

const itemColumns = [
  { accessorKey: 'itemName', header: 'Item' },
  { accessorKey: 'itemType', header: 'Tipe' },
  { accessorKey: 'qty', header: 'Qty' },
  { accessorKey: 'unitPrice', header: 'Harga' },
  { accessorKey: 'subtotal', header: 'Subtotal' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

function itemTypeColor(type: string) {
  return { RENTAL: 'info', PRODUCT: 'success', SERVICE: 'warning', PENALTY: 'error' }[type] || 'neutral'
}

function formatDateTime(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const productSearch = ref('')
const filteredProducts = computed(() =>
  (products.value || []).filter((p: any) => p.isActive && (p.name || '').toLowerCase().includes(productSearch.value.toLowerCase())),
)

async function addProduct(p: any) {
  try {
    await $fetch(`/api/transactions/rental/${id}/items`, { method: 'POST', body: { productId: p.id, qty: 1 } })
    toast.add({ title: 'Item berhasil ditambahkan', color: 'success' })
    await refresh()
    await refreshProducts()
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || 'Gagal menambah item', color: 'error' })
  }
}

const deleteOpen = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

function openDeleteItem(row: any) {
  deleteTarget.value = row
  deleteOpen.value = true
}

async function onDeleteItem() {
  deleting.value = true
  await $fetch(`/api/transactions/rental/${id}/items/${deleteTarget.value.original.id}`, { method: 'DELETE' })
  deleting.value = false
  deleteOpen.value = false
  toast.add({ title: 'Item berhasil dihapus', color: 'success' })
  await refresh()
  await refreshProducts()
}

const returnOpen = ref(false)
const saving = ref(false)
const error = ref('')
const discountType = ref('none')
const discountValue = ref('0')
const paymentMethod = ref('cash')
const amountPaid = ref('')

const discountOptions = [
  { label: 'Tanpa Diskon', value: 'none' },
  { label: 'Nominal (Rp)', value: 'nominal' },
  { label: 'Persen (%)', value: 'percent' },
]

const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'QRIS', value: 'qris' },
]

const baseTotal = computed(() => {
  const itemsSum = (data.value?.items || []).reduce((s: number, i: any) => s + Number(i.subtotal), 0)
  return itemsSum + estimatedLateHours.value * hourlyPenalty.value
})

const finalTotal = computed(() => {
  const total = baseTotal.value
  if (discountType.value === 'nominal') return Math.max(0, total - (Number(discountValue.value) || 0))
  if (discountType.value === 'percent') {
    const pct = Math.min(100, Number(discountValue.value) || 0)
    return Math.max(0, total - Math.round(total * pct / 100))
  }
  return total
})

const changeAmount = computed(() => Math.max(0, (Number(amountPaid.value) || 0) - finalTotal.value))

function openReturn() {
  error.value = ''
  discountType.value = 'none'
  discountValue.value = '0'
  paymentMethod.value = 'cash'
  amountPaid.value = ''
  returnOpen.value = true
}

async function onReturn() {
  saving.value = true
  error.value = ''
  try {
    await $fetch(`/api/transactions/rental/${id}/return`, {
      method: 'POST',
      body: {
        discountType: discountType.value,
        discountValue: Number(discountValue.value) || 0,
        paymentMethod: paymentMethod.value,
        amountPaid: Number(amountPaid.value) || 0,
      },
    })
    await navigateTo(`/struk/${id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal menyelesaikan pengembalian'
  } finally {
    saving.value = false
  }
}

const cancelOpen = ref(false)
const cancelling = ref(false)

async function onCancelConfirm() {
  cancelling.value = true
  await $fetch(`/api/transactions/rental/${id}/cancel`, { method: 'POST' })
  await navigateTo('/rental')
}
</script>

<template>
  <UDashboardPanel id="rental-detail">
    <template #header>
      <UDashboardNavbar :title="`Rental ${data?.invoiceNumber}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge :color="statusColor(data?.status)" variant="subtle">{{ TRANSACTION_STATUS_LABEL[data?.status] }}</UBadge>
          <UButton v-if="data?.status === 'waiting_return'" color="neutral" variant="outline" icon="i-lucide-x" @click="cancelOpen = true">
            Batalkan
          </UButton>
          <UButton v-if="data?.status === 'waiting_return'" color="success" icon="i-lucide-check" @click="openReturn">
            Pengembalian
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            {{ data?.customerName || 'Umum' }}
            <span v-if="data?.customerPhone" class="text-muted/70">• {{ data?.customerPhone }}</span>
            <span v-if="data?.customerIdentityNumber" class="font-mono text-muted/70">• {{ data?.customerIdentityNumber }}</span>
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <UCard>
            <template #header>
              <div class="font-semibold">Item Transaksi</div>
            </template>

            <ScrollableTable :data="data?.items || []" :columns="itemColumns" empty="Belum ada item">
              <template #itemType-cell="{ row }">
                <UBadge :color="itemTypeColor(row.original.itemType)" variant="subtle">{{ row.original.itemType }}</UBadge>
              </template>
              <template #qty-cell="{ row }">
                {{ Number(row.original.qty) }} {{ row.original.unit || '' }}
              </template>
              <template #unitPrice-cell="{ row }">{{ formatRupiah(row.original.unitPrice) }}</template>
              <template #subtotal-cell="{ row }">{{ formatRupiah(row.original.subtotal) }}</template>
              <template #actions-cell="{ row }">
                <UButton
                  v-if="data?.status === 'waiting_return' && row.original.itemType !== 'RENTAL' && row.original.itemType !== 'PENALTY'"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  size="sm"
                  @click="openDeleteItem(row)"
                />
              </template>
            </ScrollableTable>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-semibold">
                <UIcon name="i-lucide-id-card" class="size-4 text-primary" />
                Identitas Penyewa
              </div>
            </template>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-xs text-muted">Nama</div>
                <div class="font-medium">{{ data?.customerName || '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">No. Identitas</div>
                <div class="font-mono font-medium">{{ data?.customerIdentityNumber || '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Telepon</div>
                <div class="font-medium">{{ data?.customerPhone || '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Alamat</div>
                <div class="font-medium">{{ data?.customerAddress || '-' }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="font-semibold">Informasi Rental</div>
            </template>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-xs text-muted">PlayStation</div>
                <div class="font-medium">{{ data?.playstationCode }} — {{ data?.playstationName }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Stick</div>
                <div class="font-medium">{{ data?.controllerNumber ? `No. ${data.controllerNumber}` : '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Paket</div>
                <div class="font-medium">{{ data?.packageName }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Tanggal Rental</div>
                <div class="font-medium">{{ formatDateTime(data?.rentalDate) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Jatuh Tempo</div>
                <div class="font-medium" :class="{ 'text-error': isLate }">{{ formatDateTime(data?.dueDate) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Dikembalikan</div>
                <div class="font-medium">{{ data?.returnDate ? formatDateTime(data.returnDate) : '-' }}</div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="space-y-6">
          <UCard v-if="data?.status === 'waiting_return'">
            <template #header>
              <div class="font-semibold">Tambah Item</div>
            </template>

            <div class="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
              <UInput v-model="productSearch" icon="i-lucide-search" placeholder="Cari produk..." size="sm" class="mb-2" />
              <UButton
                v-for="p in filteredProducts"
                :key="p.id"
                block
                size="sm"
                color="neutral"
                variant="soft"
                class="justify-between"
                :disabled="p.category !== 'service' && p.stock < 1"
                @click="addProduct(p)"
              >
                <span class="truncate">{{ p.name }}</span>
                <span class="shrink-0 text-xs text-muted">{{ formatRupiah(p.price) }}</span>
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="font-semibold">Rincian Biaya</div>
            </template>

            <div class="space-y-2 text-sm">
              <div v-for="item in data?.items || []" :key="item.id" class="flex justify-between">
                <span class="text-muted">{{ item.itemName }}</span>
                <span class="font-medium">{{ formatRupiah(item.subtotal) }}</span>
              </div>
              <USeparator />
              <div class="flex justify-between">
                <span class="text-muted">Subtotal</span>
                <span>{{ formatRupiah(data?.subtotal) }}</span>
              </div>
              <div v-if="Number(data?.discountAmount) > 0" class="flex justify-between text-error">
                <span>Diskon</span>
                <span>-{{ formatRupiah(data?.discountAmount) }}</span>
              </div>
              <div class="flex justify-between text-base font-bold">
                <span>Grand Total</span>
                <span>{{ formatRupiah(data?.grandTotal) }}</span>
              </div>
              <div v-if="Number(data?.lateHours) > 0" class="flex justify-between text-error">
                <span>Terlambat</span>
                <span>{{ data.lateHours }} jam</span>
              </div>
              <div v-if="Number(data?.penaltyAmount) > 0" class="flex justify-between text-error">
                <span>Denda</span>
                <span>{{ formatRupiah(data?.penaltyAmount) }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <UModal v-model:open="returnOpen">
        <template #content>
          <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div class="font-semibold">Pengembalian & Pembayaran</div>
          </template>

          <div v-if="isLate" class="rounded-lg border border-error/20 bg-error/5 p-3 text-sm">
            <div class="mb-1 font-semibold text-error">Terlambat {{ estimatedLateHours }} jam</div>
            <div class="text-muted">Denda: {{ formatRupiah(estimatedLateHours * hourlyPenalty) }}</div>
          </div>
          <div v-else class="text-sm text-muted">
            Tidak ada keterlambatan.
          </div>

          <UFormField label="Diskon">
            <div class="grid grid-cols-[1fr_1fr] gap-2">
              <USelect v-model="discountType" :items="discountOptions" />
              <UInput v-model="discountValue" type="number" min="0" :disabled="discountType === 'none'" />
            </div>
          </UFormField>

          <div class="flex justify-between text-lg font-bold">
            <span>Total Tagihan</span>
            <span>{{ formatRupiah(finalTotal) }}</span>
          </div>

          <UFormField label="Metode Pembayaran">
            <USelect v-model="paymentMethod" :items="paymentOptions" />
          </UFormField>
          <UFormField label="Dibayar" required>
            <UInput v-model="amountPaid" type="number" min="0" />
          </UFormField>
          <div class="flex justify-between text-sm">
            <span class="text-muted">Kembalian</span>
            <span class="font-semibold text-success">{{ formatRupiah(changeAmount) }}</span>
          </div>

          <UAlert v-if="error" color="error" variant="subtle" :title="error" :icon="null" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="returnOpen = false">Batal</UButton>
            <UButton color="success" :loading="saving" @click="onReturn">Selesaikan</UButton>
          </div>
          </UCard>
        </template>
      </UModal>

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Hapus Item"

        :loading="deleting"
              >
        <span>Hapus item <strong>{{ deleteTarget?.original?.itemName }}</strong> dari transaksi ini?</span>
      </ConfirmModal>

      <ConfirmModal
        v-model:open="cancelOpen"
        title="Batalkan Rental"
        description="Batalkan transaksi rental ini? Perangkat akan dikembalikan ke status ready."
        confirm-label="Ya, Batalkan"
        :loading="cancelling"
        @confirm="onCancelConfirm"
      />
    </template>
  </UDashboardPanel>
</template>
