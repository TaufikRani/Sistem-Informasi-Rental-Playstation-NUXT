<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="max-h-[28rem] overflow-y-auto">
    <UTable v-bind="$attrs" sticky="header">
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </UTable>
  </div>
</template>
