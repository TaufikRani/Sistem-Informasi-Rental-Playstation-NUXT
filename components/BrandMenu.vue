<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <UButton
    label="Rental PS"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    class="data-[state=open]:bg-elevated"
    :class="[!collapsed && 'py-2']"
    :ui="{ trailingIcon: 'text-dimmed' }"
  >
    <template #avatar>
      <UAvatar
        :ui="{ fallback: 'bg-primary text-white font-bold rounded-lg' }"
        size="sm"
        text="PS"
        alt="Rental PS"
      />
    </template>

    <template #trailing>
      <UIcon v-if="!collapsed" name="i-lucide-chevrons-up-down" class="ms-auto size-4 shrink-0 text-dimmed" />
    </template>
  </UButton>
</template>
