<template>
  <div class="min-h-svh flex">
    <aside
      class="hidden lg:flex w-64 shrink-0 flex-col border-e border-default bg-elevated dark:bg-neutral-900"
    >
      <div class="flex h-14 shrink-0 items-center gap-3 px-4">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold">
          PS
        </div>
        <div class="min-w-0">
          <div class="text-sm font-bold leading-tight truncate">Rental PS</div>
          <div class="text-xs text-muted-foreground truncate">Sistem Informasi</div>
        </div>
      </div>

      <UNavigationMenu :items="navItems" orientation="vertical" class="flex-1 px-2 py-2 overflow-y-auto" />

      <div class="shrink-0 border-t border-default p-3 flex flex-col gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <UAvatar :alt="user?.name || ''" size="sm" />
          <div class="min-w-0">
            <div class="text-sm font-medium truncate">{{ user?.name }}</div>
            <div class="text-xs text-muted-foreground truncate">
              {{ user?.role === 'admin' ? 'Admin' : 'Kasir' }}
            </div>
          </div>
        </div>
        <UButton block color="neutral" variant="outline" icon="i-lucide-log-out" size="sm" @click="onLogout">
          Keluar
        </UButton>
      </div>
    </aside>

    <USlideover v-model:open="mobileOpen" side="left" title="Menu">
      <UNavigationMenu :items="navItems" orientation="vertical" class="flex-1 px-2 py-2 overflow-y-auto" />
    </USlideover>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-default px-4 sm:px-6">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            size="sm"
            class="lg:hidden"
            aria-label="Buka menu"
            @click="mobileOpen = true"
          />
          <div class="text-sm text-muted-foreground hidden sm:block">{{ todayLabel }}</div>
        </div>
        <div class="flex items-center gap-1.5">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-moon"
            aria-label="Ganti tema"
            @click="toggleDark"
          />
          <UAvatar :alt="user?.name || ''" size="sm" class="lg:hidden" />
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, clear } = useUserSession()
const colorMode = useColorMode()
const mobileOpen = ref(false)

const todayLabel = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const navItems: NavigationMenuItem[] = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Main di Tempat', icon: 'i-lucide-gamepad-2', to: '/main' },
  { label: 'Rental PS', icon: 'i-lucide-boxes', to: '/rental' },
  { label: 'Transaksi', icon: 'i-lucide-receipt-text', to: '/transactions' },
  { label: 'Stok', icon: 'i-lucide-package', to: '/stok' },
  {
    label: 'Master Data',
    icon: 'i-lucide-database',
    defaultOpen: true,
    children: [
      { label: 'Room', icon: 'i-lucide-door-open', to: '/master/rooms' },
      { label: 'PlayStation', icon: 'i-lucide-gamepad-2', to: '/master/playstations' },
      { label: 'TV', icon: 'i-lucide-tv', to: '/master/televisions' },
      { label: 'Stick', icon: 'i-lucide-wand-sparkles', to: '/master/controllers' },
      { label: 'Tarif Main', icon: 'i-lucide-tag', to: '/master/play-rates' },
      { label: 'Paket Rental', icon: 'i-lucide-box', to: '/master/rental-packages' },
      { label: 'Tarif Denda', icon: 'i-lucide-alarm-clock', to: '/master/penalty-rate' },
      { label: 'Produk', icon: 'i-lucide-shopping-bag', to: '/master/products' },
      { label: 'Customer', icon: 'i-lucide-users', to: '/master/customers' },
      { label: 'Pengguna', icon: 'i-lucide-user-cog', to: '/master/users' },
    ],
  },
  { label: 'Laporan', icon: 'i-lucide-bar-chart-3', to: '/reports' },
]

function toggleDark() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

async function onLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>
