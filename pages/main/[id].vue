<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ data?.roomName || 'Sesi Main' }}</h1>
        <p class="text-neutral-500 text-sm">{{ data?.invoiceNumber }} • {{ data?.customerName }}</p>
      </div>
      <div class="flex items-center gap-2">
        <UBadge color="warning" variant="subtle">
          <UIcon name="i-lucide-timer" class="size-3 mr-1" />
          {{ elapsedText }}
        </UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-x" @click="onCancel">Batalkan</UButton>
        <UButton color="success" icon="i-lucide-check" @click="finishOpen = true">Selesai & Bayar</UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">Item Transaksi</div>
              <UButton size="sm" icon="i-lucide-plus" @click="addOpen = true">Tambah Item</UButton>
            </div>
          </template>
          <UTable :data="data?.items || []" :columns="itemColumns" empty="Belum ada item">
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
                v-if="row.original.itemType !== 'MAIN'"
                color="error" variant="ghost" icon="i-lucide-trash-2" size="sm"
                @click="onDeleteItem(row)"
              />
            </template>
          </UTable>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">Estimasi Tagihan</div>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-500">Biaya Main ({{ elapsedHours }} jam × {{ formatRupiah(mainRate) }})</span>
              <span class="font-medium">{{ formatRupiah(elapsedHours * mainRate) }}</span>
            </div>
            <div v-for="item in nonMainItems" :key="item.id" class="flex justify-between">
              <span class="text-neutral-500">{{ item.itemName }} × {{ Number(item.qty) }}</span>
              <span class="font-medium">{{ formatRupiah(item.subtotal) }}</span>
            </div>
            <USeparator />
            <div class="flex justify-between text-base font-bold">
              <span>Estimasi Total</span>
              <span>{{ formatRupiah(estimatedTotal) }}</span>
            </div>
          </div>
        </UCard>
      </div>

      <div>
        <UCard>
          <template #header>
            <div class="font-semibold">Tambah Item</div>
          </template>
          <div class="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
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
              <span class="shrink-0 text-xs text-neutral-500">{{ formatRupiah(p.price) }}</span>
            </UButton>
            <USeparator label="Atau item manual" />
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model="manualName" placeholder="Nama item" size="sm" />
              <UInput v-model="manualPrice" placeholder="Harga" size="sm" type="number" min="0" />
            </div>
            <UButton block size="sm" icon="i-lucide-plus" @click="addManual">Tambah Item Manual</UButton>
          </div>
        </UCard>
      </div>
    </div>

    <UModal v-model:open="finishOpen">
      <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
          <div class="font-semibold">Selesaikan Transaksi</div>
        </template>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-neutral-500">Durasi</span>
            <span>{{ elapsedHours }} jam</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Subtotal</span>
            <span>{{ formatRupiah(estimatedTotal) }}</span>
          </div>
        </div>

        <UFormField label="Diskon">
          <div class="grid grid-cols-[1fr_1fr] gap-2">
            <USelect v-model="discountType" :items="[
              { label: 'Tanpa Diskon', value: 'none' },
              { label: 'Nominal (Rp)', value: 'nominal' },
              { label: 'Persen (%)', value: 'percent' },
            ]" />
            <UInput v-model="discountValue" type="number" min="0" :disabled="discountType === 'none'" />
          </div>
        </UFormField>

        <div class="flex justify-between text-lg font-bold">
          <span>Total Tagihan</span>
          <span>{{ formatRupiah(finalTotal) }}</span>
        </div>

        <UFormField label="Metode Pembayaran">
          <USelect v-model="paymentMethod" :items="[
            { label: 'Cash', value: 'cash' },
            { label: 'Transfer', value: 'transfer' },
            { label: 'QRIS', value: 'qris' },
          ]" />
        </UFormField>
        <UFormField label="Dibayar" required>
          <UInput v-model="amountPaid" type="number" min="0" />
        </UFormField>
        <div class="flex justify-between text-sm">
          <span class="text-neutral-500">Kembalian</span>
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
    </UModal>

    <UModal v-model:open="addOpen">
      <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
          <div class="font-semibold">Tambah Item</div>
        </template>
        <UFormField label="Jenis">
          <USelect v-model="addItem.type" :items="[
            { label: 'Produk', value: 'product' },
            { label: 'Layanan / Biaya Lain', value: 'service' },
          ]" />
        </UFormField>
        <UFormField v-if="addItem.type === 'product'" label="Produk">
          <USelect v-model="addItem.productId" :items="addProductOptions" />
        </UFormField>
        <template v-else>
          <UFormField label="Nama Item">
            <UInput v-model="addItem.name" placeholder="Tambah Stick" />
          </UFormField>
          <UFormField label="Harga">
            <UInput v-model="addItem.price" type="number" min="0" />
          </UFormField>
        </template>
        <UFormField label="Qty">
          <UInput v-model="addItem.qty" type="number" min="1" />
        </UFormField>
        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="outline" @click="addOpen = false">Batal</UButton>
          <UButton :loading="adding" @click="onAddItem">Tambah</UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

const { data, refresh } = await useFetch(`/api/transactions/main/${id}`)
const { data: products, refresh: refreshProducts } = await useFetch('/api/products')

const nowTick = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    nowTick.value = Date.now()
    refresh()
  }, 30000)
})
onUnmounted(() => timer && clearInterval(timer))

const itemColumns = [
  { id: 'itemName', key: 'itemName', label: 'Item' },
  { id: 'itemType', key: 'itemType', label: 'Tipe' },
  { id: 'qty', key: 'qty', label: 'Qty' },
  { id: 'unitPrice', key: 'unitPrice', label: 'Harga' },
  { id: 'subtotal', key: 'subtotal', label: 'Subtotal' },
  { id: 'actions', key: 'actions', label: '', meta: { class: { th: 'text-right', td: 'text-right' } }, id: 'actions' },
]

const mainItem = computed(() => data.value?.items?.find((i: any) => i.itemType === 'MAIN'))
const mainRate = computed(() => Number(mainItem.value?.unitPrice || 0))
const elapsedHours = computed(() => {
  if (data.value?.durationMinutes != null) return Math.ceil(data.value.durationMinutes / 60)
  return Math.max(1, Math.ceil((nowTick.value - new Date(data.value?.startedAt).getTime()) / 3600000))
})
const elapsedText = computed(() => {
  const mins = Math.max(0, Math.floor((nowTick.value - new Date(data.value?.startedAt).getTime()) / 60000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h} jam ${m} menit`
})
const nonMainItems = computed(() => (data.value?.items || []).filter((i: any) => i.itemType !== 'MAIN'))
const estimatedTotal = computed(() => {
  const itemsSum = nonMainItems.value.reduce((s: number, i: any) => s + Number(i.subtotal), 0)
  return elapsedHours.value * mainRate.value + itemsSum
})

function itemTypeColor(type: string) {
  return { MAIN: 'info', PRODUCT: 'success', SERVICE: 'warning', PENALTY: 'error' }[type] || 'neutral'
}

const productSearch = ref('')
const filteredProducts = computed(() =>
  (products.value || []).filter((p: any) => p.isActive && (p.name || '').toLowerCase().includes(productSearch.value.toLowerCase()))
)

async function addProduct(p: any) {
  try {
    await $fetch(`/api/transactions/main/${id}/items`, { method: 'POST', body: { productId: p.id, qty: 1 } })
    await refresh()
    await refreshProducts()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal menambah item')
  }
}

const manualName = ref('')
const manualPrice = ref('')

async function addManual() {
  if (!manualName.value || !manualPrice.value) return
  try {
    await $fetch(`/api/transactions/main/${id}/items`, {
      method: 'POST',
      body: { name: manualName.value, unitPrice: Number(manualPrice.value), qty: 1 },
    })
    manualName.value = ''
    manualPrice.value = ''
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal menambah item')
  }
}

async function onDeleteItem(row: any) {
  if (!confirm(`Hapus item "${row.original.itemName}"?`)) return
  await $fetch(`/api/transactions/main/${id}/items/${row.original.id}`, { method: 'DELETE' })
  await refresh()
  await refreshProducts()
}

const addOpen = ref(false)
const adding = ref(false)
const addItem = reactive({ type: 'product', productId: null, name: '', price: '', qty: 1 })

const addProductOptions = computed(() => (products.value || [])
  .filter((p: any) => p.isActive)
  .map((p: any) => ({ label: `${p.name} — ${formatRupiah(p.price)} (stok ${p.stock})`, value: p.id })))

async function onAddItem() {
  adding.value = true
  try {
    if (addItem.type === 'product') {
      await $fetch(`/api/transactions/main/${id}/items`, { method: 'POST', body: { productId: addItem.productId, qty: Number(addItem.qty) } })
    } else {
      await $fetch(`/api/transactions/main/${id}/items`, { method: 'POST', body: { name: addItem.name, unitPrice: Number(addItem.price), qty: Number(addItem.qty) } })
    }
    addOpen.value = false
    addItem.productId = null
    addItem.name = ''
    addItem.price = ''
    addItem.qty = 1
    await refresh()
    await refreshProducts()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal menambah item')
  } finally {
    adding.value = false
  }
}

const finishOpen = ref(false)
const finishing = ref(false)
const finishError = ref('')
const discountType = ref('none')
const discountValue = ref('0')
const paymentMethod = ref('cash')
const amountPaid = ref('')
const notes = ref('')

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

async function onCancel() {
  if (!confirm('Batalkan sesi main ini?')) return
  await $fetch(`/api/transactions/main/${id}/cancel`, { method: 'POST' })
  await navigateTo('/main')
}
</script>
