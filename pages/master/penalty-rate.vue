<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Tarif Denda</h1>
      <p class="text-neutral-500 text-sm">Denda keterlambatan pengembalian rental</p>
    </div>

    <UCard class="max-w-md">
      <div class="space-y-4">
        <UFormField label="Denda Per Jam" name="hourlyPenalty" required>
          <UInput v-model="form.hourlyPenalty" type="number" min="0">
            <template #trailing>Rp</template>
          </UInput>
        </UFormField>
        <UAlert v-if="error" color="error" variant="subtle" :title="error" :icon="null" />
        <UButton :loading="saving" @click="onSave">Simpan</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/penalty-rate')
const form = reactive({ hourlyPenalty: data.value?.hourlyPenalty || '5000' })
const saving = ref(false)
const error = ref('')

async function onSave() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/penalty-rate', { method: 'PUT', body: { hourlyPenalty: form.hourlyPenalty } })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}
</script>
