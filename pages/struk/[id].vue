<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const id = Number(route.params.id)

const { data } = await useFetch(`/api/struk/${id}`)

const paymentLabel = computed(() => PAYMENT_METHOD_LABEL[data.value?.paymentMethod] || '-')

function formatDate(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration() {
  const m = Number(data.value?.durationMinutes || 0)
  if (m <= 0) return '-'
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (h === 0) return `${rest} menit`
  return rest > 0 ? `${h} jam ${rest} menit` : `${h} jam`
}

function print() {
  window.print()
}
</script>

<template>
  <div class="min-h-svh bg-muted py-8 print:bg-white print:py-0">
    <div class="mx-auto max-w-sm">
      <div class="mb-4 flex justify-center gap-2 print:hidden">
        <UButton icon="i-lucide-printer" size="lg" @click="print()">
          Cetak Struk
        </UButton>
        <UButton color="neutral" variant="outline" size="lg" icon="i-lucide-arrow-left" @click="navigateTo('/transactions')">
          Kembali
        </UButton>
      </div>

      <div id="struk" class="bg-white p-6 font-mono text-[13px] leading-relaxed text-neutral-900 shadow-lg print:p-2 print:shadow-none">
        <div class="mb-3 border-b border-dashed border-neutral-400 pb-3 text-center">
          <div class="text-base font-bold uppercase">Rental PlayStation</div>
          <div class="text-xs">Jln. Contoh No. 123, Kota</div>
          <div class="text-xs">Telp: 0812-3456-7890</div>
        </div>

        <div class="mb-3 text-xs">
          <div class="flex justify-between"><span>Invoice</span><span class="font-bold">{{ data?.invoiceNumber }}</span></div>
          <div class="flex justify-between"><span>Tanggal</span><span>{{ formatDate(data?.startedAt) }}</span></div>
          <div class="flex justify-between"><span>Kasir</span><span>{{ data?.createdByName }}</span></div>
          <div v-if="data?.customerName" class="flex justify-between"><span>Customer</span><span>{{ data.customerName }}</span></div>
        </div>

        <div class="mb-2 border-t border-dashed border-neutral-400 py-2">
          <div v-for="item in data?.items" :key="item.id" class="text-xs">
            <div class="font-semibold">{{ item.itemName }}</div>
            <div class="flex justify-between">
              <template v-if="item.itemType === 'MAIN'">
                <span>Durasi: {{ formatDuration() }}</span>
              </template>
              <template v-else>
                <span>{{ Number(item.qty) }} {{ item.unit }} × {{ formatNumber(item.unitPrice) }}</span>
              </template>
              <span>{{ formatNumber(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-1 border-t border-dashed border-neutral-400 pt-2 text-xs">
          <div class="flex justify-between"><span>Subtotal</span><span>{{ formatNumber(data?.subtotal) }}</span></div>
          <div v-if="Number(data?.discountAmount) > 0" class="flex justify-between text-red-600">
            <span>Diskon{{ data?.discountType === 'percent' ? ` (${data.discountValue}%)` : '' }}</span>
            <span>-{{ formatNumber(data?.discountAmount) }}</span>
          </div>
          <div class="flex justify-between border-t border-neutral-300 pt-1 text-sm font-bold">
            <span>TOTAL</span>
            <span>{{ formatNumber(data?.grandTotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Bayar ({{ paymentLabel }})</span>
            <span>{{ formatNumber(data?.amountPaid) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Kembali</span>
            <span>{{ formatNumber(data?.changeAmount) }}</span>
          </div>
          <div v-if="Number(data?.lateHours) > 0" class="flex justify-between text-red-600">
            <span>Denda {{ data?.lateHours }} jam</span>
            <span>{{ formatNumber(data?.penaltyAmount) }}</span>
          </div>
          <div v-if="data?.dueDate" class="flex justify-between">
            <span>Jatuh tempo</span>
            <span>{{ formatDate(data?.dueDate) }}</span>
          </div>
          <div v-if="data?.returnDate" class="flex justify-between">
            <span>Dikembalikan</span>
            <span>{{ formatDate(data?.returnDate) }}</span>
          </div>
        </div>

        <div class="mt-4 border-t border-dashed border-neutral-400 pt-3 text-center text-xs">
          <div>Terima kasih sudah berkunjung!</div>
          <div>Main lagi, rekomendasi ke teman ya!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: white !important;
  }
  @page {
    size: 58mm auto;
    margin: 2mm;
  }
}
</style>
