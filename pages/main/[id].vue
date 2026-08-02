<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

const toast = useToast()

const { data, refresh } = await useFetch(`/api/transactions/main/${id}`)
const { data: products, refresh: refreshProducts } = await useFetch('/api/products')

const nowTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
  refreshTimer = setInterval(() => {
    refresh()
  }, 30000)
})
onUnmounted(() => {
  tickTimer && clearInterval(tickTimer)
  refreshTimer && clearInterval(refreshTimer)
})

const itemColumns = [
  { accessorKey: 'itemName', header: 'Item' },
  { accessorKey: 'itemType', header: 'Tipe' },
  { accessorKey: 'qty', header: 'Qty' },
  { accessorKey: 'unitPrice', header: 'Harga' },
  { accessorKey: 'subtotal', header: 'Subtotal' },
  { id: 'actions', header: '', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const mainItem = computed(() => data.value?.items?.find((i: any) => i.itemType === 'MAIN'))
const mainRate = computed(() => Number(mainItem.value?.unitPrice || 0))

const startedAtMs = computed(() => new Date(data.value?.startedAt || Date.now()).getTime())
const endedAtMs = computed(() => new Date(data.value?.endedAt || Date.now()).getTime())

const isActive = computed(() => data.value?.status === 'active')

const elapsedSeconds = computed(() => {
  const from = startedAtMs.value
  const to = isActive.value ? nowTick.value : endedAtMs.value
  return Math.max(0, Math.floor((to - from) / 1000))
})

const elapsedMinutes = computed(() => {
  if (data.value?.durationMinutes != null) return Math.max(1, data.value.durationMinutes)
  return Math.max(1, Math.round(elapsedSeconds.value / 60))
})

function formatMinutes(m: number) {
  const mm = Math.max(0, Math.floor(Number(m) || 0))
  const h = Math.floor(mm / 60)
  const rest = mm % 60
  if (h === 0) return `${rest} menit`
  return rest > 0 ? `${h} jam ${rest} menit` : `${h} jam`
}

const elapsedText = computed(() => {
  if (!isActive.value) return formatMinutes(elapsedMinutes.value)
  const s = elapsedSeconds.value
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h} jam ${m} menit ${sec} detik`
})
const nonMainItems = computed(() => (data.value?.items || []).filter((i: any) => i.itemType !== 'MAIN'))
const estimatedMain = computed(() => Math.ceil(elapsedMinutes.value * mainRate.value / 60))
const estimatedTotal = computed(() => {
  const itemsSum = nonMainItems.value.reduce((s: number, i: any) => s + Number(i.subtotal), 0)
  return estimatedMain.value + itemsSum
})

function itemTypeColor(type: string) {
  return { MAIN: 'info', PRODUCT: 'success', SERVICE: 'warning', PENALTY: 'error' }[type] || 'neutral'
}

const productSearch = ref('')
const filteredProducts = computed(() =>
  (products.value || []).filter((p: any) => p.isActive && (p.name || '').toLowerCase().includes(productSearch.value.toLowerCase())),
)

async function addProduct(p: any) {
  try {
    await $fetch(`/api/transactions/main/${id}/items`, { method: 'POST', body: { productId: p.id, qty: 1 } })
    toast.add({ title: 'Item berhasil ditambahkan', color: 'success' })
    await refresh()
    await refreshProducts()
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || 'Gagal menambah item', color: 'error' })
  }
}

const manualName = ref('')
const manualPrice = ref('')
const manualQty = ref('1')

async function addManual() {
  if (!manualName.value || !manualPrice.value) return
  try {
    await $fetch(`/api/transactions/main/${id}/items`, {
      method: 'POST',
      body: { name: manualName.value, unitPrice: Number(manualPrice.value), qty: Number(manualQty.value) || 1 },
    })
    manualName.value = ''
    manualPrice.value = ''
    manualQty.value = '1'
    toast.add({ title: 'Item berhasil ditambahkan', color: 'success' })
    await refresh()
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
  await $fetch(`/api/transactions/main/${id}/items/${deleteTarget.value.original.id}`, { method: 'DELETE' })
  deleting.value = false
  deleteOpen.value = false
  toast.add({ title: 'Item berhasil dihapus', color: 'success' })
  await refresh()
  await refreshProducts()
}

const cancelOpen = ref(false)
const cancelling = ref(false)

const finishOpen = ref(false)
const finishing = ref(false)
const finishError = ref('')
const discountType = ref('none')
const discountValue = ref('0')
const paymentMethod = ref('cash')
const amountPaid = ref('')
const notes = ref('')

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

const finalTotal = computed(() => {
  const total = estimatedTotal.value
  if (discountType.value === 'nominal') return Math.max(0, total - (Number(discountValue.value) || 0))
  if (discountType.value === 'percent') {
    const pct = Math.min(100, Number(discountValue.value) || 0)
    return Math.max(0, total - Math.round(total * pct / 100))
  }
  return total
})

const changeAmount = computed(() => Math.max(0, (Number(amountPaid.value) || 0) - finalTotal.value))

function openFinish() {
  finishError.value = ''
  discountType.value = 'none'
  discountValue.value = '0'
  paymentMethod.value = 'cash'
  amountPaid.value = ''
  notes.value = ''
  finishOpen.value = true
}

async function onFinish() {
  finishing.value = true
  finishError.value = ''
  try {
    await $fetch(`/api/transactions/main/${id}/finish`, {
      method: 'POST',
      body: {
        discountType: discountType.value,
        discountValue: Number(discountValue.value) || 0,
        paymentMethod: paymentMethod.value,
        amountPaid: Number(amountPaid.value) || 0,
        notes: notes.value,
      },
    })
    await navigateTo(`/struk/${id}`)
  } catch (e: any) {
    finishError.value = e?.data?.statusMessage || 'Gagal menyelesaikan transaksi'
  } finally {
    finishing.value = false
  }
}

async function onCancelConfirm() {
  cancelling.value = true
  await $fetch(`/api/transactions/main/${id}/cancel`, { method: 'POST' })
  await navigateTo('/main')
}
</script>

<template>
  <UDashboardPanel id="main-detail">
    <template #header>
      <UDashboardNavbar :title="data?.roomName || 'Sesi Main'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge color="warning" variant="subtle">
            <UIcon name="i-lucide-timer" class="mr-1 size-3" />
            {{ elapsedText }}
          </UBadge>
          <UButton v-if="data?.status === 'active'" color="neutral" variant="outline" icon="i-lucide-x" @click="cancelOpen = true">
            Batalkan
          </UButton>
          <UButton v-if="data?.status === 'active'" color="success" icon="i-lucide-check" @click="openFinish">
            Selesai & Bayar
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            {{ data?.invoiceNumber }} • {{ data?.customerName || 'Umum' }}
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
                <template v-if="row.original.itemType === 'MAIN'">{{ formatMinutes(elapsedMinutes) }}</template>
                <template v-else>{{ Number(row.original.qty) }} {{ row.original.unit || '' }}</template>
              </template>
              <template #unitPrice-cell="{ row }">{{ formatRupiah(row.original.unitPrice) }}</template>
              <template #subtotal-cell="{ row }">{{ formatRupiah(row.original.subtotal) }}</template>
              <template #actions-cell="{ row }">
                <UButton
                  v-if="row.original.itemType !== 'MAIN'"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  size="sm"
                  @click="openDeleteItem(row)"
                />
              </template>
            </ScrollableTable>
          </UCard>

          <UCard v-if="data?.status === 'active'">
            <template #header>
              <div class="font-semibold">Estimasi Tagihan</div>
            </template>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Biaya Main ({{ formatMinutes(elapsedMinutes) }} × {{ formatRupiah(mainRate) }}/jam)</span>
                <span class="font-medium">{{ formatRupiah(estimatedMain) }}</span>
              </div>
              <div v-for="item in nonMainItems" :key="item.id" class="flex justify-between">
                <span class="text-muted">{{ item.itemName }} × {{ Number(item.qty) }}</span>
                <span class="font-medium">{{ formatRupiah(item.subtotal) }}</span>
              </div>
              <USeparator />
              <div class="flex justify-between text-base font-bold">
                <span>Estimasi Total</span>
                <span>{{ formatRupiah(estimatedTotal) }}</span>
              </div>
            </div>
          </UCard>

          <UCard v-else>
            <template #header>
              <div class="font-semibold">Rincian Biaya</div>
            </template>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Durasi</span>
                <span class="font-medium">{{ formatMinutes(elapsedMinutes) }}</span>
              </div>
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
            </div>
          </UCard>
        </div>

        <div class="space-y-6">
          <UCard v-if="data?.status === 'active'">
            <template #header>
              <div class="font-semibold">Tambah Item</div>
            </template>

            <div class="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
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
              <USeparator label="Atau item manual" />
              <div class="grid grid-cols-3 gap-2">
                <UInput v-model="manualName" placeholder="Nama item" size="sm" />
                <UInput v-model="manualPrice" placeholder="Harga" size="sm" type="number" min="0" />
                <UInput v-model="manualQty" placeholder="Qty" size="sm" type="number" min="1" />
              </div>
              <UButton block size="sm" icon="i-lucide-plus" @click="addManual">
                Tambah Item Manual
              </UButton>
            </div>
          </UCard>

          <UCard v-else>
            <template #header>
              <div class="font-semibold">Informasi Transaksi</div>
            </template>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Status</span>
                <span class="font-medium">{{ TRANSACTION_STATUS_LABEL[data?.status] }}</span>
              </div>
              <div v-if="data?.paymentMethod" class="flex justify-between">
                <span class="text-muted">Pembayaran</span>
                <span>{{ PAYMENT_METHOD_LABEL[data.paymentMethod] }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Dibayar</span>
                <span>{{ formatRupiah(data?.amountPaid) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Kembalian</span>
                <span>{{ formatRupiah(data?.changeAmount) }}</span>
              </div>
              <div v-if="data?.notes" class="flex justify-between">
                <span class="text-muted">Catatan</span>
                <span>{{ data.notes }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <UModal v-model:open="finishOpen">
        <template #content>
          <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div class="font-semibold">Selesaikan Transaksi</div>
          </template>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Durasi</span>
              <span>{{ formatMinutes(elapsedMinutes) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Subtotal</span>
              <span>{{ formatRupiah(estimatedTotal) }}</span>
            </div>
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
          <UFormField label="Catatan">
            <UTextarea v-model="notes" />
          </UFormField>

          <UAlert v-if="finishError" color="error" variant="subtle" :title="finishError" :icon="null" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="finishOpen = false">Batal</UButton>
            <UButton color="success" :loading="finishing" @click="onFinish">Selesaikan</UButton>
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
        title="Batalkan Sesi Main"
        description="Batalkan sesi main ini? Room dan perangkat akan dikembalikan ke status ready."
        confirm-label="Ya, Batalkan"
        :loading="cancelling"
        @confirm="onCancelConfirm"
      />
    </template>
  </UDashboardPanel>
</template>
