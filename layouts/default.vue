<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

const mainLinks = [[{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
}, {
  label: 'Main di Tempat',
  icon: 'i-lucide-gamepad-2',
  to: '/main',
}, {
  label: 'Rental PS',
  icon: 'i-lucide-boxes',
  to: '/rental',
}, {
  label: 'Transaksi',
  icon: 'i-lucide-receipt-text',
  to: '/transactions',
}, {
  label: 'Stok',
  icon: 'i-lucide-package',
  to: '/stok',
}, {
  label: 'Master Data',
  icon: 'i-lucide-database',
  type: 'trigger',
  defaultOpen: true,
  children: [{
    label: 'Room',
    icon: 'i-lucide-door-open',
    to: '/master/rooms',
  }, {
    label: 'PlayStation',
    icon: 'i-lucide-gamepad-2',
    to: '/master/playstations',
  }, {
    label: 'TV',
    icon: 'i-lucide-tv',
    to: '/master/televisions',
  }, {
    label: 'Stick',
    icon: 'i-lucide-wand-sparkles',
    to: '/master/controllers',
  }, {
    label: 'Tarif Main',
    icon: 'i-lucide-tag',
    to: '/master/play-rates',
  }, {
    label: 'Paket Rental',
    icon: 'i-lucide-box',
    to: '/master/rental-packages',
  }, {
    label: 'Tarif Denda',
    icon: 'i-lucide-alarm-clock',
    to: '/master/penalty-rate',
  }, {
    label: 'Produk',
    icon: 'i-lucide-shopping-bag',
    to: '/master/products',
  }, {
    label: 'Customer',
    icon: 'i-lucide-users',
    to: '/master/customers',
  }, {
    label: 'Pengguna',
    icon: 'i-lucide-user-cog',
    to: '/master/users',
  }],
}, {
  label: 'Laporan',
  icon: 'i-lucide-bar-chart-3',
  to: '/reports',
}]] satisfies NavigationMenuItem[][]

const pageLinks = computed(() =>
  (mainLinks[0] || []).flatMap((item) => {
    if (!item.to) return []
    return [{
      id: item.to,
      label: item.label ?? item.to,
      icon: item.icon,
      to: item.to,
      onSelect: () => {
        open.value = false
      },
    }]
  }),
)

const groups = computed(() => [{
  id: 'pages',
  label: 'Halaman',
  items: pageLinks.value,
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <BrandMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="mainLinks[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
