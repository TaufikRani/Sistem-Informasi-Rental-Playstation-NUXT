<template>
  <div class="min-h-screen bg-neutral-200 dark:bg-neutral-900 py-8 print:bg-white print:py-0">
    <div class="mx-auto max-w-sm">
      <div class="text-center mb-4 print:hidden">
        <UButton icon="i-lucide-printer" size="lg" @click="print()">Cetak Struk</UButton>
        <UButton color="neutral" variant="outline" size="lg" class="ml-2" @click="navigateTo('/transactions')">Kembali</UButton>
      </div>

      <div id="struk" class="bg-white text-neutral-900 font-mono text-[13px] leading-relaxed p-6 shadow-lg print:shadow-none print:p-2">
        <div class="text-center border-b border-dashed border-neutral-400 pb-3 mb-3">
          <div class="text-base font-bold uppercase">Rental PlayStation</div>
          <div class="text-xs">Jln. Contoh No. 123, Kota</div>
          <div class="text-xs">Telp: 0812-3456-7890</div>
        </div>

        <div class="text-xs mb-3">
          <div class="flex justify-between"><span>Invoice</span><span class="font-bold">{{ data?.invoiceNumber }}</span></div>
          <div class="flex justify-between"><span>Tanggal</span><span>{{ formatDate(data?.startedAt) }}</span></div>
          <div class="flex justify-between"><span>Kasir</span><span>{{ data?.createdByName }}</span></div>
          <div v-if="data?.customerName" class="flex justify-between"><span>Customer</span><span>{{ data.customerName }}</span></div>
        </div>

        <div class="border-t border-dashed border-neutral-400 py-2 mb-2">
          <div v-for="item in data?.items" :key="item.id" class="text-xs">
            <div class="font-semibold">{{ item.itemName }}</div>
            <div class="flex justify-between">
              <span>{{ Number(item.qty) }} {{ item.unit }} × {{ formatNumber(item.unitPrice) }}</span>
              <span>{{ formatNumber(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <div class="border-t border-dashed border-neutral-400 pt-2 text-xs space-y-1">
          <div class="flex justify-between"><span>Subtotal</span><span>{{ formatNumber(data?.subtotal) }}</span></div>
          <div v-if="Number(data?.discountAmount) > 0" class="flex justify-between text-red-600">
            <span>Diskon{{ data?.discountType === 'percent' ? ` (${data.discountValue}%)` : '' }}</span>
            <span>-{{ formatNumber(data?.discountAmount) }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold border-t border-neutral-300 pt-1">
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

        <div class="text-center text-xs mt-4 pt-3 border-t border-dashed border-neutral-400">
          <div>Terima kasih sudah berkunjung!</div>
          <div>Main lagi, rekomendasi ke teman ya!</div>
        </div>
      </div>
    </div>
  </div>
</template>

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

function print() {
  window.print()
}
</script>

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
