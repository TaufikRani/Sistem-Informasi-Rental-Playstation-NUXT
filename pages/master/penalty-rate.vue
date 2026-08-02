<script setup lang="ts">
const toast = useToast()

const { data, refresh } = await useFetch('/api/penalty-rate')
const form = reactive({ hourlyPenalty: data.value?.hourlyPenalty || '5000' })
const saving = ref(false)
const error = ref('')

async function onSave() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/penalty-rate', { method: 'PUT', body: { hourlyPenalty: form.hourlyPenalty } })
    await refresh()
    toast.add({ title: 'Tarif denda berhasil disimpan', color: 'success' })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="penalty-rate">
    <template #header>
      <UDashboardNavbar title="Tarif Denda">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Denda keterlambatan pengembalian rental
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
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
    </template>
  </UDashboardPanel>
</template>
