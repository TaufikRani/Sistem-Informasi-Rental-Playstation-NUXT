<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

defineEmits<{ confirm: [] }>()
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-default">
            {{ title }}
          </h3>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="sm" aria-label="Tutup" @click="open = false" />
        </div>
      </template>

      <p class="text-sm text-muted">
        <slot>{{ description }}</slot>
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="outline" :disabled="loading" @click="open = false">
            Batal
          </UButton>
          <UButton color="error" :loading="loading" @click="$emit('confirm')">
            {{ confirmLabel || 'Hapus' }}
          </UButton>
        </div>
      </template>
      </UCard>
    </template>
  </UModal>
</template>
