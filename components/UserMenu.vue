<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { user, clear } = useUserSession()

const colorMode = useColorMode()

const appearanceItems = computed<DropdownMenuItem[]>(() => [{
  label: 'Terang',
  icon: 'i-lucide-sun',
  type: 'checkbox',
  checked: colorMode.value === 'light',
  onSelect(e: Event) {
    e.preventDefault()
    colorMode.preference = 'light'
  },
}, {
  label: 'Gelap',
  icon: 'i-lucide-moon',
  type: 'checkbox',
  checked: colorMode.value === 'dark',
  onSelect(e: Event) {
    e.preventDefault()
    colorMode.preference = 'dark'
  },
}, {
  label: 'Sistem',
  icon: 'i-lucide-monitor',
  type: 'checkbox',
  checked: colorMode.value === 'system',
  onSelect(e: Event) {
    e.preventDefault()
    colorMode.preference = 'system'
  },
}])

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: user.value?.name || 'Pengguna',
  description: user.value?.role === 'admin' ? 'Administrator' : 'Kasir',
}], [{
  label: 'Tampilan',
  icon: 'i-lucide-sun-moon',
  children: appearanceItems.value,
}], [{
  label: 'Keluar',
  icon: 'i-lucide-log-out',
  onSelect: onLogout,
}]])

async function onLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :avatar="{ text: user?.name?.charAt(0)?.toUpperCase() || 'U' }"
      :label="collapsed ? undefined : user?.name"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    >
      <template #trailing>
        <UIcon v-if="!collapsed" name="i-lucide-chevrons-up-down" class="ms-auto size-4 shrink-0 text-dimmed" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
